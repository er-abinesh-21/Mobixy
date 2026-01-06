/**
 * Mobixy API - Push Notifications (Serverless)
 * POST /api/push
 * 
 * Vercel Serverless Function for sending push notifications via Expo Push API
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { expoPushToken, title, body, data } = req.body;

        // Validation
        if (!expoPushToken) {
            return res.status(400).json({
                success: false,
                error: 'Expo push token is required',
            });
        }

        if (!expoPushToken.startsWith('ExponentPushToken[')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Expo push token format',
            });
        }

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Title and body are required',
            });
        }

        // Send notification via Expo Push API
        const message = {
            to: expoPushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        const response = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        if (result.data?.status === 'error') {
            return res.status(400).json({
                success: false,
                error: result.data.message || 'Failed to send notification',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification sent successfully',
            ticketId: result.data?.id,
        });

    } catch (error) {
        console.error('Push notification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}
