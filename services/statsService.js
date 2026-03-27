const { getConnection, sql } = require('../config/database');
const { getCurrentWeekRange, getCurrentMonthRange } = require('../utils/dateHelper');

//Obtener estadísticas generales del usuario

const getGeneralStats = async (userId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT
                    (SELECT COUNT(*) FROM Habits 
                     WHERE user_id = @user_id AND is_active = 1) as total_habits,

                    (SELECT COUNT(*) FROM HabitTracking ht
                     INNER JOIN Habits h ON ht.habit_id = h.id
                     WHERE h.user_id = @user_id AND ht.completed = 1
                     AND CAST(ht.completed_date AS DATE) = CAST(GETDATE() AS DATE)
                    ) as completed_today,

                    (SELECT COUNT(*) FROM Habits 
                     WHERE user_id = @user_id AND is_active = 1) as total_active,

                    (SELECT COUNT(*) FROM Routines
                     WHERE user_id = @user_id AND is_active = 1) as total_routines,

                    (SELECT COUNT(*) FROM Categories
                     WHERE user_id = @user_id) as custom_categories,

                    (SELECT COUNT(*) FROM HabitTracking ht
                     INNER JOIN Habits h ON ht.habit_id = h.id
                     WHERE h.user_id = @user_id AND ht.completed = 1
                    ) as total_completions
            `);

        return result.recordset[0];
    } catch (error) {
        console.error('Error en getGeneralStats:', error);
        throw error;
    }
};

//Obtener estadísticas semanales

const getWeeklyStats = async (userId) => {
    try {
        const pool = await getConnection();
        const { start, end } = getCurrentWeekRange();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('start_date', sql.Date, start)
            .input('end_date', sql.Date, end)
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
                AND ht.completed_date BETWEEN @start_date AND @end_date
                GROUP BY ht.completed_date
                ORDER BY ht.completed_date ASC
            `);

        return {
            range: { start, end },
            data: result.recordset
        };
    } catch (error) {
        console.error('Error en getWeeklyStats:', error);
        throw error;
    }
};

//Obtener estadísticas mensuales

const getMonthlyStats = async (userId) => {
    try {
        const pool = await getConnection();
        const { start, end } = getCurrentMonthRange();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('start_date', sql.Date, start)
            .input('end_date', sql.Date, end)
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
                AND ht.completed_date BETWEEN @start_date AND @end_date
                GROUP BY ht.completed_date
                ORDER BY ht.completed_date ASC
            `);

        return {
            range: { start, end },
            data: result.recordset
        };
    } catch (error) {
        console.error('Error en getMonthlyStats:', error);
        throw error;
    }
};

//Obtener porcentaje de éxito por hábito

const getHabitSuccessRate = async (userId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT 
                    h.id,
                    h.name,
                    c.name as category_name,
                    c.color as category_color,
                    COUNT(ht.id) as total_completions,
                    DATEDIFF(DAY, h.created_at, GETDATE()) + 1 as days_since_created,
                    CASE 
                        WHEN DATEDIFF(DAY, h.created_at, GETDATE()) + 1 = 0 THEN 0
                        ELSE ROUND(
                            (COUNT(ht.id) * 100.0) / (DATEDIFF(DAY, h.created_at, GETDATE()) + 1), 
                            1
                        )
                    END as success_rate
                FROM Habits h
                LEFT JOIN HabitTracking ht 
                    ON h.id = ht.habit_id AND ht.completed = 1
                LEFT JOIN Categories c ON h.category_id = c.id
                WHERE h.user_id = @user_id AND h.is_active = 1
                GROUP BY h.id, h.name, h.created_at, c.name, c.color
                ORDER BY success_rate DESC
            `);

        return result.recordset;
    } catch (error) {
        console.error('Error en getHabitSuccessRate:', error);
        throw error;
    }
};

//Obtener hábitos más consistentes

const getTopHabits = async (userId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT TOP 5
                    h.id,
                    h.name,
                    c.name as category_name,
                    c.color as category_color,
                    COUNT(ht.id) as total_completions
                FROM Habits h
                LEFT JOIN HabitTracking ht 
                    ON h.id = ht.habit_id AND ht.completed = 1
                LEFT JOIN Categories c ON h.category_id = c.id
                WHERE h.user_id = @user_id AND h.is_active = 1
                GROUP BY h.id, h.name, c.name, c.color
                ORDER BY total_completions DESC
            `);

        return result.recordset;
    } catch (error) {
        console.error('Error en getTopHabits:', error);
        throw error;
    }
};

//Obtener promedio de estado de ánimo

const getMoodStats = async (userId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT 
                    AVG(CAST(ht.mood_rating AS FLOAT)) as average_mood,
                    COUNT(ht.mood_rating) as total_mood_entries,
                    SUM(CASE WHEN ht.mood_rating = 5 THEN 1 ELSE 0 END) as excellent,
                    SUM(CASE WHEN ht.mood_rating = 4 THEN 1 ELSE 0 END) as good,
                    SUM(CASE WHEN ht.mood_rating = 3 THEN 1 ELSE 0 END) as neutral,
                    SUM(CASE WHEN ht.mood_rating = 2 THEN 1 ELSE 0 END) as bad,
                    SUM(CASE WHEN ht.mood_rating = 1 THEN 1 ELSE 0 END) as terrible
                FROM HabitTracking ht
                INNER JOIN Habits h ON ht.habit_id = h.id
                WHERE h.user_id = @user_id 
                AND ht.mood_rating IS NOT NULL
            `);

        return result.recordset[0];
    } catch (error) {
        console.error('Error en getMoodStats:', error);
        throw error;
    }
};

module.exports = {
    getGeneralStats,
    getWeeklyStats,
    getMonthlyStats,
    getHabitSuccessRate,
    getTopHabits,
    getMoodStats
};