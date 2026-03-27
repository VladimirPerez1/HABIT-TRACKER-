// models/Tracking.js
const { getConnection, sql } = require('../config/database');
const { getToday } = require('../utils/dateHelper');

class Tracking {

    // Marcar hábito como completado
    static async complete(habitId, date, moodRating) {
        try {
            const pool = await getConnection();
            const trackingDate = date || getToday();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .input('completed_date', sql.Date, trackingDate)
                .input('completed', sql.Bit, 1)
                .input('mood_rating', sql.Int, moodRating || null)
                .query(`
                    IF EXISTS (
                        SELECT 1 FROM HabitTracking 
                        WHERE habit_id = @habit_id AND completed_date = @completed_date
                    )
                        UPDATE HabitTracking
                        SET completed = @completed,
                            mood_rating = @mood_rating
                        OUTPUT INSERTED.*
                        WHERE habit_id = @habit_id AND completed_date = @completed_date
                    ELSE
                        INSERT INTO HabitTracking (habit_id, completed_date, completed, mood_rating)
                        OUTPUT INSERTED.*
                        VALUES (@habit_id, @completed_date, @completed, @mood_rating)
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Tracking.complete:', error);
            throw error;
        }
    }

    // Desmarcar hábito (marcar como no completado)
    static async uncomplete(habitId, date) {
        try {
            const pool = await getConnection();
            const trackingDate = date || getToday();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .input('completed_date', sql.Date, trackingDate)
                .query(`
                    UPDATE HabitTracking
                    SET completed = 0
                    OUTPUT INSERTED.*
                    WHERE habit_id = @habit_id AND completed_date = @completed_date
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Tracking.uncomplete:', error);
            throw error;
        }
    }

    // Obtener tracking de un hábito en un rango de fechas
    static async findByHabitAndRange(habitId, startDate, endDate) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .input('start_date', sql.Date, startDate)
                .input('end_date', sql.Date, endDate)
                .query(`
                    SELECT *
                    FROM HabitTracking
                    WHERE habit_id = @habit_id
                    AND completed_date BETWEEN @start_date AND @end_date
                    ORDER BY completed_date DESC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Tracking.findByHabitAndRange:', error);
            throw error;
        }
    }

    // Obtener todos los hábitos del usuario con su estado de hoy
    static async findTodayByUserId(userId) {
        try {
            const pool = await getConnection();
            const today = getToday();

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('today', sql.Date, today)
                .query(`
                    SELECT 
                        h.id,
                        h.name,
                        h.description,
                        h.frequency,
                        h.reminder_time,
                        c.name as category_name,
                        c.color as category_color,
                        c.icon as category_icon,
                        CASE 
                            WHEN ht.completed = 1 THEN 1 
                            ELSE 0 
                        END as completed_today,
                        ht.mood_rating,
                        ht.id as tracking_id
                    FROM Habits h
                    LEFT JOIN Categories c ON h.category_id = c.id
                    LEFT JOIN HabitTracking ht 
                        ON h.id = ht.habit_id 
                        AND ht.completed_date = @today
                    WHERE h.user_id = @user_id AND h.is_active = 1
                    ORDER BY completed_today ASC, h.name ASC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Tracking.findTodayByUserId:', error);
            throw error;
        }
    }

    // Obtener tracking del mes actual para calendario
    static async findMonthByUserId(userId, year, month) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('year', sql.Int, year)
                .input('month', sql.Int, month)
                .query(`
                    SELECT 
                        ht.completed_date,
                        COUNT(ht.habit_id) as completed_count,
                        (SELECT COUNT(*) FROM Habits 
                         WHERE user_id = @user_id AND is_active = 1) as total_habits
                    FROM HabitTracking ht
                    INNER JOIN Habits h ON ht.habit_id = h.id
                    WHERE h.user_id = @user_id 
                    AND ht.completed = 1
                    AND YEAR(ht.completed_date) = @year
                    AND MONTH(ht.completed_date) = @month
                    GROUP BY ht.completed_date
                    ORDER BY ht.completed_date ASC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Tracking.findMonthByUserId:', error);
            throw error;
        }
    }

    // Verificar si un hábito fue completado en una fecha
    static async findByHabitAndDate(habitId, date) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .input('date', sql.Date, date)
                .query(`
                    SELECT * FROM HabitTracking
                    WHERE habit_id = @habit_id 
                    AND completed_date = @date
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Tracking.findByHabitAndDate:', error);
            throw error;
        }
    }

    // Obtener notas de un tracking
    static async addNote(habitId, trackingId, noteText) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .input('tracking_id', sql.Int, trackingId || null)
                .input('note_text', sql.NVarChar, noteText)
                .query(`
                    INSERT INTO HabitNotes (habit_id, tracking_id, note_text)
                    OUTPUT INSERTED.*
                    VALUES (@habit_id, @tracking_id, @note_text)
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error en Tracking.addNote:', error);
            throw error;
        }
    }

    // Obtener notas de un hábito
    static async getNotes(habitId) {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input('habit_id', sql.Int, habitId)
                .query(`
                    SELECT * FROM HabitNotes
                    WHERE habit_id = @habit_id
                    ORDER BY created_at DESC
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error en Tracking.getNotes:', error);
            throw error;
        }
    }
}

module.exports = Tracking;