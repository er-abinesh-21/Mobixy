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
        const buildId = nanoid(12);
        const build = {
            id: buildId,
            status: 'queued',
            websiteUrl,
            appName,
            packageName,
            buildType,
            startedAt: new Date().toISOString(),
            logs: [
                { timestamp: new Date().toISOString(), message: 'Build queued successfully', type: 'info' },
            ],
        };

        // Store build (use Redis in production)
        // await redis.set(`build:${buildId}`, JSON.stringify(build), { ex: 86400 });
        builds.set(buildId, build);

        // In production, trigger build via:
        // 1. Vercel Cron Job
        // 2. Inngest background job
        // 3. QStash async message
        // 4. Direct EAS API call

        // For demo, simulate build progress
        simulateBuildAsync(buildId, build);

        return res.status(201).json({
            success: true,
            buildId,
            message: 'Build started successfully',
            status: 'queued',
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
async function simulateBuildAsync(buildId, build) {
    const steps = [
        { delay: 2000, message: 'Preparing build environment...' },
        { delay: 3000, message: 'Processing app configuration...' },
        { delay: 2000, message: 'Generating app resources...' },
        { delay: 4000, message: 'Starting EAS Cloud build...' },
        { delay: 5000, message: 'Compiling JavaScript bundle...' },
        { delay: 6000, message: 'Building Android package...' },
        { delay: 3000, message: 'Signing application...' },
        { delay: 2000, message: 'Uploading artifacts...' },
    ];

    build.status = 'building';
    builds.set(buildId, build);

    for (const step of steps) {
        await sleep(step.delay);
        build.logs.push({
            timestamp: new Date().toISOString(),
            message: step.message,
            type: 'info',
        });
        builds.set(buildId, build);
    }

    // Complete
    build.status = 'finished';
    build.downloadUrl = `https://expo.dev/artifacts/eas/${buildId}.apk`;
    build.expoUrl = `https://expo.dev/builds/${buildId}`;
    build.duration = calculateDuration(build.startedAt);
    build.logs.push({
        timestamp: new Date().toISOString(),
        message: '✅ Build completed successfully!',
        type: 'success',
    });
    builds.set(buildId, build);
}

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
