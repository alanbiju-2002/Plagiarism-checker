const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'plagi_db'
};

async function setupChatTables() {
    let connection;
    try {
        console.log('Connecting to database:', dbConfig.database);
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        console.log('Creating chat_rooms table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        console.log('Creating messages table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NULL,
                class_id INT NULL,
                content TEXT,
                file_path VARCHAR(255) NULL,
                file_name VARCHAR(255) NULL,
                message_type ENUM('text', 'file', 'announcement') DEFAULT 'text',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        console.log('Chat tables created successfully.');
        
        // Check if any classes exist to create default rooms
        const [classes] = await connection.execute('SELECT id, class_name FROM classes');
        console.log(`Found ${classes.length} classes. Ensuring chat rooms exist...`);
        
        for (const cls of classes) {
            const [existing] = await connection.execute('SELECT id FROM chat_rooms WHERE class_id = ?', [cls.id]);
            if (existing.length === 0) {
                await connection.execute('INSERT INTO chat_rooms (class_id, name) VALUES (?, ?)', [cls.id, `${cls.class_name} General`]);
                console.log(`Created room for class: ${cls.class_name}`);
            }
        }

    } catch (error) {
        console.error('Error setting up chat tables:', error);
    } finally {
        if (connection) await connection.end();
    }
}

setupChatTables();
