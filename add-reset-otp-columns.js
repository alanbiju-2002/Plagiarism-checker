const pool = require('./config/database');

async function addResetOtpColumns() {
  try {
    console.log('Adding reset_otp and reset_otp_expires columns to users table...');
    
    // Check if columns exist first
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('reset_otp', 'reset_otp_expires')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('reset_otp')) {
      await pool.query('ALTER TABLE users ADD COLUMN reset_otp VARCHAR(10) NULL');
      console.log('- Added reset_otp column');
    } else {
      console.log('- reset_otp column already exists');
    }
    
    if (!existingColumns.includes('reset_otp_expires')) {
      await pool.query('ALTER TABLE users ADD COLUMN reset_otp_expires DATETIME NULL');
      console.log('- Added reset_otp_expires column');
    } else {
      console.log('- reset_otp_expires column already exists');
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

addResetOtpColumns();
