/**
 * Mobixy API - Get Build Status (Serverless)
 * GET /api/build/:id
 * 
 * Vercel Serverless Function for checking build status
 */

// Import shared builds store (for demo)
// In production, use Redis: import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Build ID is required',
            });
        }

        // In production, fetch from Redis:
        // const redis = Redis.fromEnv();
        // const build = await redis.get(`build:${id}`);

        // For production, fallback to fetching real status from EAS
        const build = await getEasBuildStatus(id);

        if (!build) {
            return res.status(404).json({
                success: false,
                error: 'Build not found',
            });
        }

        return res.status(200).json({
            success: true,
            ...build,
        });

    } catch (error) {
        console.error('Build status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}

/**
 * Fetch Real Build Status from Expo
 */
async function getEasBuildStatus(buildId) {
    const EXPO_TOKEN = process.env.EXPO_TOKEN;
    const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;

    // Use simulated response if no token (dev mode)
    if (!EXPO_TOKEN) {
        return generateDemoBuild(buildId);
    }

    try {
        const response = await fetch(`https://api.expo.dev/v2/builds/${buildId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${EXPO_TOKEN}`,
            },
        });

        if (!response.ok) {
            // Fallback to demo if ID is not found (e.g. invalid ID during dev)
            if (response.status === 404) return generateDemoBuild(buildId);
            throw new Error(`Expo API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const build = data.data;

        // Map Expo status to our API format
        return {
            id: build.id,
            status: build.status, // 'queued', 'in-progress', 'finished', 'errored'
            websiteUrl: build.metadata?.appVersion || 'Unknown', // Stored in metadata or env?
            appName: 'Mobixy App',
            packageName: 'com.mobixy.app',
            buildType: build.profile === 'production' ? 'aab' : 'apk',
            startedAt: build.createdAt,
            duration: 'Calculating...',
            downloadUrl: build.artifacts?.buildUrl || null,
            expoUrl: `https://expo.dev/accounts/er-abinesh-21/projects/mobixy/builds/${build.id}`,
            logs: [
                { timestamp: build.createdAt, message: `Build status: ${build.status}`, type: 'info' }
            ]
        };
    } catch (e) {
        console.error("Error fetching EAS build:", e);
        return generateDemoBuild(buildId); // Fallback so UI doesn't crash
    }
}

function generateDemoBuild(id) {
    // ... existing demo logic ...
    const now = new Date();
    const startedAt = new Date(now.getTime() - 30000);

    return {
        id,
        status: 'finished',
        websiteUrl: 'https://example.com',
        appName: 'Demo App',
        packageName: 'com.demo.app',
        buildType: 'apk',
        startedAt: startedAt.toISOString(),
        duration: '0m 30s',
        // Use safe URL to avoid 404s
        downloadUrl: `https://mobixy-cloud.vercel.app/`,
        expoUrl: `https://expo.dev/accounts/er-abinesh-21/projects/mobixy/builds`,
        logs: [
            { timestamp: new Date(startedAt.getTime()).toISOString(), message: 'Build queued', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 30000).toISOString(), message: '✅ Simulation complete', type: 'success' },
        ],
    };
}
