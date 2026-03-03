
const { getConnection, sql } = require('../config/database');

class Habit {
   
 //Crear un nuevo hábito
static async create(habitData) {
    try {
        const pool = await getConnection();
        const { userId, categoryId, name, description, frequency, reminderTime } = habitData;
        
        // Construir la consulta dinámicamente según si hay reminderTime
        let query;
        let request = pool.request()
            .input('user_id', sql.Int, userId)
            .input('category_id', sql.Int, categoryId || null)
            .input('name', sql.NVarChar, name.trim())
            .input('description', sql.NVarChar, description ? description.trim() : null)
            .input('frequency', sql.NVarChar, frequency || 'daily');
        
        if (reminderTime) {
            // Si hay reminderTime que se agregue como string
            request.input('reminder_time', sql.VarChar, reminderTime);
            query = `
                INSERT INTO Habits (user_id, category_id, name, description, frequency, reminder_time)
                OUTPUT INSERTED.*
                VALUES (@user_id, @category_id, @name, @description, @frequency, CAST(@reminder_time AS TIME))
            `;
        } else {
            // Si no hay reminderTime que se insierte NULL
            query = `
                INSERT INTO Habits (user_id, category_id, name, description, frequency, reminder_time)
                OUTPUT INSERTED.*
                VALUES (@user_id, @category_id, @name, @description, @frequency, NULL)
            `;
        }
        
        const result = await request.query(query);
        
        return result.recordset[0];
    } catch (error) {
        console.error('Error en Habit.create:', error);
        throw error;
    }
}

    
     //Obtener todos los hábitos de un usuario
     
    static async findByUserId(userId) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT h.*, 
                           c.name as category_name, 
                           c.color as category_color,
                           c.icon as category_icon
                    FROM Habits h
                    LEFT JOIN Categories c ON h.category_id = c.id
                    WHERE h.user_id = @user_id AND h.is_active = 1
                    ORDER BY h.created_at DESC
                `);
            
            return result.recordset;
        } catch (error) {
            console.error('Error en Habit.findByUserId:', error);
            throw error;
        }
    }

    /**
     * Obtener un hábito por ID
     */
    static async findById(id, userId) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT h.*, 
                           c.name as category_name, 
                           c.color as category_color,
                           c.icon as category_icon
                    FROM Habits h
                    LEFT JOIN Categories c ON h.category_id = c.id
                    WHERE h.id = @id AND h.user_id = @user_id
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error en Habit.findById:', error);
            throw error;
        }
    }

   /**
 * Actualizar un hábito
 */
static async update(id, userId, updates) {
    try {
        const pool = await getConnection();
        const { name, description, categoryId, frequency, reminderTime } = updates;
        
        let request = pool.request()
            .input('id', sql.Int, id)
            .input('user_id', sql.Int, userId)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || null)
            .input('category_id', sql.Int, categoryId || null)
            .input('frequency', sql.NVarChar, frequency);
        
        let query;
        
        if (reminderTime) {
            request.input('reminder_time', sql.VarChar, reminderTime);
            query = `
                UPDATE Habits
                SET name = @name,
                    description = @description,
                    category_id = @category_id,
                    frequency = @frequency,
                    reminder_time = CAST(@reminder_time AS TIME)
                OUTPUT INSERTED.*
                WHERE id = @id AND user_id = @user_id
            `;
        } else {
            query = `
                UPDATE Habits
                SET name = @name,
                    description = @description,
                    category_id = @category_id,
                    frequency = @frequency,
                    reminder_time = NULL
                OUTPUT INSERTED.*
                WHERE id = @id AND user_id = @user_id
            `;
        }
        
        const result = await request.query(query);
        
        return result.recordset[0];
    } catch (error) {
        console.error('Error en Habit.update:', error);
        throw error;
    }
}

    /**
     * Eliminar un hábito (eliminación lógica)
     */
    static async delete(id, userId) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    UPDATE Habits 
                    SET is_active = 0 
                    WHERE id = @id AND user_id = @user_id
                `);
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error en Habit.delete:', error);
            throw error;
        }
    }

    /**
     * Contar hábitos activos de un usuario
     */
    static async countByUserId(userId) {
        try {
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT COUNT(*) as total
                    FROM Habits
                    WHERE user_id = @user_id AND is_active = 1
                `);
            
            return result.recordset[0].total;
        } catch (error) {
            console.error('Error en Habit.countByUserId:', error);
            throw error;
        }
    }
}

module.exports = Habit;