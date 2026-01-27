const axios = require('axios');

(async () => {
    try {
        console.log('Attempting to register user...');
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_' + Date.now(),
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            full_name: 'Test User',
            role: 'student'
        });
        console.log('Registration successful:', response.data);
    } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 500) {
            console.log('Is the server log showing anything?');
        }
    }
})();
