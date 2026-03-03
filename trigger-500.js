const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';
const student = { id: 3, role: 'student', username: 'akhils' };
const token = jwt.sign(student, JWT_SECRET, { expiresIn: '1h' });

async function trigger() {
    console.log('Using Token:', token);

    const form = new FormData();
    const filePath = path.join(__dirname, 'uploads', 'test-trigger.txt');
    fs.writeFileSync(filePath, 'Some content for testing 500 error.');

    form.append('file', fs.createReadStream(filePath));

    try {
        console.log('Sending request to http://localhost:5000/api/assignments/1/submit');
        const response = await axios.post('http://localhost:5000/api/assignments/1/submit', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Response:', response.status, response.data);
    } catch (err) {
        if (err.response) {
            console.error('Error Response:', err.response.status, err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        fs.unlinkSync(filePath);
    }
}

trigger();
