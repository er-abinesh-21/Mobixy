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

        // For demo, return a simulated build status
        // Since serverless functions don't share state, we simulate progress
        const build = generateDemoBuild(id);

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
 * Generate demo build data based on time elapsed
 * In production, this would fetch from Redis/database
 */
function generateDemoBuild(id) {
    // Simulate build progress based on when it was created
    // For demo purposes, we'll show a completed build

    const now = new Date();
    const startedAt = new Date(now.getTime() - 30000); // 30 seconds ago

    return {
        id,
        status: 'finished',
        websiteUrl: 'https://example.com',
        appName: 'Demo App',
        packageName: 'com.demo.app',
        buildType: 'apk',
        startedAt: startedAt.toISOString(),
        duration: '0m 30s',
        downloadUrl: `https://expo.dev/artifacts/eas/${id}.apk`,
        expoUrl: `https://expo.dev/builds/${id}`,
        logs: [
            { timestamp: new Date(startedAt.getTime()).toISOString(), message: 'Build queued successfully', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 2000).toISOString(), message: 'Preparing build environment...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 5000).toISOString(), message: 'Processing app configuration...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 8000).toISOString(), message: 'Starting EAS Cloud build...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 15000).toISOString(), message: 'Compiling JavaScript bundle...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 22000).toISOString(), message: 'Building Android package...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 27000).toISOString(), message: 'Signing application...', type: 'info' },
            { timestamp: new Date(startedAt.getTime() + 30000).toISOString(), message: '✅ Build completed successfully!', type: 'success' },
        ],
    };
}
