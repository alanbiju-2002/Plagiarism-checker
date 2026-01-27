const pool = require('./config/database');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        const username = 'debug_user_' + Date.now();
        const email = `debug_${Date.now()}@example.com`;
        const password = 'password123';
        const full_name = 'Debug User';
        const role = 'student';
        const status = 'pending';

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Attempting INSERT...');
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, role, status]
        );
        console.log('Insert successful:', result);
        process.exit(0);

    } catch (error) {
        console.error('INSERT failed:', error);
        process.exit(1);
    }
})();
