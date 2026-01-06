/**
 * Mobixy API - Start Build (Serverless)
 * POST /api/build
 * 
 * Vercel Serverless Function for starting Android app builds
 * Uses Upstash Redis for state persistence (add @upstash/redis for production)
 */

import { nanoid } from 'nanoid';

// In-memory store for demo - Replace with Upstash Redis for production
// import { Redis } from '@upstash/redis';
// const redis = Redis.fromEnv();

const builds = new Map(); // Demo only - not persistent across invocations

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { websiteUrl, appName, packageName, buildType } = req.body;

        // Validation
        const errors = validateInput({ websiteUrl, appName, packageName, buildType });
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Create build record
        // Create build record (stored locally for reference, but real source of truth is Expo)
        const localBuildId = nanoid(12);

        let easBuildData;
        try {
            // Trigger Real Build
            easBuildData = await triggerEasBuild({ websiteUrl, appName, packageName, buildType });
        } catch (err) {
            console.error('Failed to trigger EAS build:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        const build = {
            id: localBuildId,
            easBuildId: easBuildData.id,
            status: easBuildData.status, // e.g. 'queued'
            websiteUrl,
            appName,
            packageName,
            buildType,
            startedAt: new Date().toISOString(),
            logs: [
                { timestamp: new Date().toISOString(), message: 'Build queued on Expo EAS', type: 'info' },
            ],
            expoUrl: `https://expo.dev/accounts/er-abinesh-21/projects/mobixy/builds/${easBuildData.id}`
        };

        builds.set(localBuildId, build);

        return res.status(201).json({
            success: true,
            buildId: localBuildId, // We return our local ID for the frontend to poll status
            easBuildId: easBuildData.id,
            message: 'Build started successfully on Expo Cloud',
            status: easBuildData.status,
        });

    } catch (error) {
        console.error('Build API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}

/**
 * Validate build input
 */
function validateInput({ websiteUrl, appName, packageName, buildType }) {
    const errors = [];

    // Website URL
    if (!websiteUrl) {
        errors.push('Website URL is required');
    } else {
        try {
            const url = new URL(websiteUrl);
            if (url.protocol !== 'https:') {
                errors.push('URL must use HTTPS protocol');
            }
        } catch {
            errors.push('Invalid URL format');
        }
    }

    // App Name
    if (!appName) {
        errors.push('App name is required');
    } else if (appName.length > 30) {
        errors.push('App name must be 30 characters or less');
    }

    // Package Name
    if (!packageName) {
        errors.push('Package name is required');
    } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
        errors.push('Invalid package name format. Use: com.company.appname');
    }

    // Build Type
    if (!buildType) {
        errors.push('Build type is required');
    } else if (!['apk', 'aab'].includes(buildType)) {
        errors.push('Build type must be "apk" or "aab"');
    }

    return errors;
}

/**
 * Simulate build process (demo only)
 * In production, this would trigger EAS Build API
 */
/**
 * Trigger Real EAS Build
 */
async function triggerEasBuild({ websiteUrl, appName, packageName, buildType }) {
    const EXPO_TOKEN = process.env.EXPO_TOKEN;
    const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;

    if (!EXPO_TOKEN || !EAS_PROJECT_ID) {
        throw new Error('Server misconfiguration: Missing EXPO_TOKEN or EAS_PROJECT_ID');
    }

    // 1. Prepare Build Profile
    // We strictly use the 'preview' profile for APKs and 'production' for AABs logic from eas.json
    const profile = buildType === 'apk' ? 'preview' : 'production';

    // 2. Call Expo API to Start Build
    // Docs: https://docs.expo.dev/eas/api/
    const response = await fetch('https://api.expo.dev/v2/builds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${EXPO_TOKEN}`,
        },
        body: JSON.stringify({
            projectId: EAS_PROJECT_ID,
            platform: 'android',
            profile: profile,
            // We can pass environment variables to the build process
            // The app's app.config.js usually reads these to configure the app dynamically
            metadata: {
                appVersion: '1.0.0',
                appBuildVersion: '1',
                gitCommitHash: 'latest',
                credentialsSource: 'remote', // Use credentials stored in EAS
            },
            // Environment variables injected into the build environment
            env: {
                APP_NAME: appName,
                APP_PACKAGE: packageName,
                WEBSITE_URL: websiteUrl,
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Expo API Error:', errorText);
        throw new Error(`Failed to start build: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.data; // Returns the build object
}

// ... existing helpers ...

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDuration(startTime) {
    const start = new Date(startTime).getTime();
    const end = Date.now();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

// Export builds map for other functions
export { builds };
