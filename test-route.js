const axios = require('axios');

async function testRoute() {
    try {
        // Try to hit the test route first
        try {
            const testRes = await axios.get('http://localhost:5000/api/test');
            console.log('Test route status:', testRes.status);
            console.log('Test route data:', testRes.data);
        } catch (e) {
            console.log('Test route failed:', e.message);
        }

        // Try to hit the student route directly (will fail with 401, but should NOT be 404)
        try {
            const studentRes = await axios.post('http://localhost:5000/api/student/classes/join');
            console.log('Student route status (with no auth):', studentRes.status);
        } catch (e) {
            console.log('Student route error code (expected 401, NOT 404):', e.response?.status);
            if (e.response?.status === 404) {
                console.error('CRITICAL: Route /api/student/classes/join is indeed returning 404');
            } else {
                console.log('Route is reachable (returned ' + e.response?.status + ')');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testRoute();
