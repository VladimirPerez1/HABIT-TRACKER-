// models/Category.js
const { getConnection, sql } = require('../config/database');

class Category {

    // Obtener todas las categorías (predefinidas + las del usuario)
    static async findByUserId(userId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT * FROM Categories
                    WHERE user_id = @user_id OR user_id IS NULL
                    ORDER BY user_id ASC, name ASC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Category.findByUserId:', error);
            throw error;
        }
    }

    // Obtener una categoría por ID
    static async findById(id) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Categories WHERE id = @id');

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Category.findById:', error);
            throw error;
        }
    }

    // Crear categoría personalizada
    static async create(userId, name, color, icon) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('name', sql.NVarChar, name.trim())
                .input('color', sql.NVarChar, color || '#6366f1')
                .input('icon', sql.NVarChar, icon || 'star')
                .query(`
                    INSERT INTO Categories (user_id, name, color, icon)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @name, @color, @icon)
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Category.create:', error);
            throw error;
        }
    }

    // Actualizar categoría
    static async update(id, userId, name, color, icon) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .input('name', sql.NVarChar, name.trim())
                .input('color', sql.NVarChar, color || '#6366f1')
                .input('icon', sql.NVarChar, icon || 'star')
                .query(`
                    UPDATE Categories
                    SET name = @name,
                        color = @color,
                        icon = @icon
                    OUTPUT INSERTED.*
                    WHERE id = @id AND user_id = @user_id
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Category.update:', error);
            throw error;
        }
    }

    // Eliminar categoría (solo las del usuario, no las predefinidas)
    static async delete(id, userId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    DELETE FROM Categories
                    WHERE id = @id AND user_id = @user_id
                `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error en Category.delete:', error);
            throw error;
        }
    }

    // Insertar categorías predefinidas si no existen
    static async seedDefaultCategories() {
        try {
            const pool = await getConnection();

            const existing = await pool.request()
                .query('SELECT COUNT(*) as count FROM Categories WHERE user_id IS NULL');

            if (existing.recordset[0].count === 0) {
                await pool.request().query(`
                    INSERT INTO Categories (name, color, icon, user_id) VALUES
                    ('Salud', '#10b981', 'heart', NULL),
                    ('Fitness', '#f59e0b', 'dumbbell', NULL),
                    ('Productividad', '#3b82f6', 'briefcase', NULL),
                    ('Mindfulness', '#8b5cf6', 'brain', NULL),
                    ('Social', '#ec4899', 'users', NULL),
                    ('Educación', '#06b6d4', 'book', NULL),
                    ('Finanzas', '#84cc16', 'dollar-sign', NULL)
                `);
                console.log('✅ Categorías predefinidas insertadas');
            }
        } catch (error) {
            console.error('Error en Category.seedDefaultCategories:', error);
            throw error;
        }
    }
}

module.exports = Category;