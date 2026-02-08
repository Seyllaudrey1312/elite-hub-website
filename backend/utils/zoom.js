const axios = require('axios');
const jwt = require('jsonwebtoken');

/**
 * Create a short-lived JWT for Zoom API (if API key/secret provided)
 */
function getJwt() {
    const key = process.env.ZOOM_API_KEY;
    const secret = process.env.ZOOM_API_SECRET;
    if (!key || !secret) return null;

    const payload = {
        iss: key,
        exp: Math.floor(Date.now() / 1000) + 60
    };

    return jwt.sign(payload, secret);
}

/**
 * Create a Zoom meeting for the configured user (ZOOM_USER_ID or 'me')
 * options: {topic, start_time (ISO), duration, timezone, password}
 */
async function createMeeting(options = {}) {
    const oauthToken = process.env.ZOOM_OAUTH_TOKEN;
    const jwtToken = getJwt();
    const userId = process.env.ZOOM_USER_ID || 'me';

    const headers = {
        'Content-Type': 'application/json'
    };

    if (oauthToken) {
        headers['Authorization'] = `Bearer ${oauthToken}`;
    } else if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
    } else {
        throw new Error('Zoom credentials not configured (set ZOOM_OAUTH_TOKEN or ZOOM_API_KEY and ZOOM_API_SECRET)');
    }

    const body = {
        topic: options.topic || 'Live Class',
        type: 2, // scheduled meeting
        start_time: options.start_time, // ISO string
        duration: options.duration || 60,
        timezone: options.timezone || process.env.TZ || 'UTC',
        settings: {
            join_before_host: false,
            mute_upon_entry: true,
            approval_type: 0
        }
    };

    if (options.password) body.password = options.password;

    const url = `https://api.zoom.us/v2/users/${encodeURIComponent(userId)}/meetings`;

    const resp = await axios.post(url, body, { headers });
    return resp.data;
}

module.exports = { createMeeting };
