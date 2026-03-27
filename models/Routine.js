// models/Routine.js
const { getConnection, sql } = require('../config/database');

class Routine {

    // Crear una nueva rutina
    static async create(userId, name, description, timeSchedule) {
        try {
            const pool = await getConnection();

            let request = pool.request()
                .input('user_id', sql.Int, userId)
                .input('name', sql.NVarChar, name.trim())
                .input('description', sql.NVarChar, description ? description.trim() : null);

            let query;
            if (timeSchedule) {
                request.input('time_schedule', sql.VarChar, timeSchedule);
                query = `
                    INSERT INTO Routines (user_id, name, description, time_schedule)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @name, @description, CAST(@time_schedule AS TIME))
                `;
            } else {
                query = `
                    INSERT INTO Routines (user_id, name, description, time_schedule)
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @name, @description, NULL)
                `;
            }

            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en Routine.create:', error);
            throw error;
        }
    }

    // Obtener todas las rutinas de un usuario
    static async findByUserId(userId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT r.*,
                        COUNT(rh.habit_id) as habit_count
                    FROM Routines r
                    LEFT JOIN RoutineHabits rh ON r.id = rh.routine_id
                    WHERE r.user_id = @user_id AND r.is_active = 1
                    GROUP BY r.id, r.user_id, r.name, r.description, 
                             r.time_schedule, r.is_active, r.created_at
                    ORDER BY r.created_at DESC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Routine.findByUserId:', error);
            throw error;
        }
    }

    // Obtener una rutina por ID con sus hábitos
    static async findById(id, userId) {
        try {
            const pool = await getConnection();

            // Obtener rutina
            const routineResult = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    SELECT * FROM Routines
                    WHERE id = @id AND user_id = @user_id
                `);

            const routine = routineResult.recordset[0];
            if (!routine) return null;

            // Obtener hábitos de la rutina
            const habitsResult = await pool.request()
                .input('routine_id', sql.Int, id)
                .query(`
                    SELECT h.*, rh.order_index,
                           c.name as category_name,
                           c.color as category_color,
                           c.icon as category_icon
                    FROM RoutineHabits rh
                    INNER JOIN Habits h ON rh.habit_id = h.id
                    LEFT JOIN Categories c ON h.category_id = c.id
                    WHERE rh.routine_id = @routine_id
                    ORDER BY rh.order_index ASC
                `);

            routine.habits = habitsResult.recordset;
            return routine;
        } catch (error) {
            console.error('Error en Routine.findById:', error);
            throw error;
        }
    }

    // Actualizar rutina
    static async update(id, userId, name, description, timeSchedule) {
        try {
            const pool = await getConnection();

            let request = pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .input('name', sql.NVarChar, name.trim())
                .input('description', sql.NVarChar, description ? description.trim() : null);

            let query;
            if (timeSchedule) {
                request.input('time_schedule', sql.VarChar, timeSchedule);
                query = `
                    UPDATE Routines
                    SET name = @name,
                        description = @description,
                        time_schedule = CAST(@time_schedule AS TIME)
                    OUTPUT INSERTED.*
                    WHERE id = @id AND user_id = @user_id
                `;
            } else {
                query = `
                    UPDATE Routines
                    SET name = @name,
                        description = @description,
                        time_schedule = NULL
                    OUTPUT INSERTED.*
                    WHERE id = @id AND user_id = @user_id
                `;
            }

            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en Routine.update:', error);
            throw error;
        }
    }

    // Eliminar rutina (lógica)
    static async delete(id, userId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    UPDATE Routines
                    SET is_active = 0
                    WHERE id = @id AND user_id = @user_id
                `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error en Routine.delete:', error);
            throw error;
        }
    }

    // Agregar hábito a rutina
    static async addHabit(routineId, habitId, orderIndex) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('routine_id', sql.Int, routineId)
                .input('habit_id', sql.Int, habitId)
                .input('order_index', sql.Int, orderIndex || 0)
                .query(`
                    INSERT INTO RoutineHabits (routine_id, habit_id, order_index)
                    OUTPUT INSERTED.*
                    VALUES (@routine_id, @habit_id, @order_index)
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Routine.addHabit:', error);
            throw error;
        }
    }

    // Eliminar hábito de rutina
    static async removeHabit(routineId, habitId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('routine_id', sql.Int, routineId)
                .input('habit_id', sql.Int, habitId)
                .query(`
                    DELETE FROM RoutineHabits
                    WHERE routine_id = @routine_id AND habit_id = @habit_id
                `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error en Routine.removeHabit:', error);
            throw error;
        }
    }

    // Activar/desactivar rutina
    static async toggleActive(id, userId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .input('user_id', sql.Int, userId)
                .query(`
                    UPDATE Routines
                    SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
                    OUTPUT INSERTED.*
                    WHERE id = @id AND user_id = @user_id
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Routine.toggleActive:', error);
            throw error;
        }
    }
}

module.exports = Routine;