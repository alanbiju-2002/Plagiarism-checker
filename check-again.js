const pool = require('./config/database');

async function check() {
    try {
        const [cols] = await pool.query('DESCRIBE submissions');
        console.log('Submissions columns:', cols.map(c => c.Field).join(', '));

        const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM submissions) as subs_count
    `);
        console.log('Stats:', stats);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
