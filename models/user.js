const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(email, password, fullName) {
        try {
            const pool = await getConnection();
            
            const hashedPassword = await bcrypt.hash(
                password, 
                parseInt(process.env.BCRYPT_ROUNDS)
            );
            
            const result = await pool.request()
                .input('email', sql.NVarChar, email.toLowerCase().trim())
                .input('password_hash', sql.NVarChar, hashedPassword)
                .input('full_name', sql.NVarChar, fullName.trim())
                .query(`
                    INSERT INTO Users (email, password_hash, full_name)
                    OUTPUT INSERTED.id, INSERTED.email, INSERTED.full_name, 
                           INSERTED.created_at
                    VALUES (@email, @password_hash, @full_name)
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en User.create:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('email', sql.NVarChar, email.toLowerCase().trim())
                .query('SELECT * FROM Users WHERE email = @email');
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en User.findByEmail:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT id, email, full_name, password_hash, created_at, updated_at 
                    FROM Users 
                    WHERE id = @id
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en User.findById:', error);
            throw error;
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error en User.comparePassword:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const pool = await getConnection();
            const { fullName, email } = updates;
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('full_name', sql.NVarChar, fullName)
                .input('email', sql.NVarChar, email.toLowerCase().trim())
                .query(`
                    UPDATE Users
                    SET full_name = @full_name,
                        email = @email,
                        updated_at = GETDATE()
                    OUTPUT INSERTED.id, INSERTED.email, INSERTED.full_name, 
                           INSERTED.updated_at
                    WHERE id = @id
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en User.update:', error);
            throw error;
        }
    }

    static async emailExists(email) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('email', sql.NVarChar, email.toLowerCase().trim())
                .query('SELECT COUNT(*) as count FROM Users WHERE email = @email');
            
            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error en User.emailExists:', error);
            throw error;
        }
    }
}

module.exports = User;