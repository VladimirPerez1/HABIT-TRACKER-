const { getConnection, sql } = require('../config/database');
const { getToday, getYesterday, diffInDays } = require('../utils/dateHelper');

/**
 * Calcular la racha actual de un hábito
 * Cuenta los días consecutivos hacia atrás desde hoy o ayer
 */
const calculateCurrentStreak = async (habitId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('habit_id', sql.Int, habitId)
            .query(`
                SELECT completed_date
                FROM HabitTracking
                WHERE habit_id = @habit_id AND completed = 1
                ORDER BY completed_date DESC
            `);

        const dates = result.recordset.map(r => formatDateOnly(r.completed_date));

        if (dates.length === 0) return 0;

        const today = getToday();
        const yesterday = getYesterday();

        // La racha debe empezar desde hoy o ayer
        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const diff = diffInDays(dates[i - 1], dates[i]);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('Error en calculateCurrentStreak:', error);
        throw error;
    }
};


 //Calcular la racha más larga de un hábito
 
const calculateLongestStreak = async (habitId) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('habit_id', sql.Int, habitId)
            .query(`
                SELECT completed_date
                FROM HabitTracking
                WHERE habit_id = @habit_id AND completed = 1
                ORDER BY completed_date ASC
            `);

        const dates = result.recordset.map(r => formatDateOnly(r.completed_date));

        if (dates.length === 0) return 0;
        if (dates.length === 1) return 1;

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const diff = diffInDays(dates[i - 1], dates[i]);
            if (diff === 1) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    } catch (error) {
        console.error('Error en calculateLongestStreak:', error);
        throw error;
    }
};

 //Calcular racha actual de TODOS los hábitos de un usuario
 
const calculateUserStreak = async (userId) => {
    try {
        const pool = await getConnection();

        const today = getToday();
        const yesterday = getYesterday();

        // Obtener fechas donde el usuario completó TODOS sus hábitos activos
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(`
                SELECT 
                    ht.completed_date,
                    COUNT(ht.habit_id) as completed_count,
                    (SELECT COUNT(*) FROM Habits 
                     WHERE user_id = @user_id AND is_active = 1) as total_habits
                FROM HabitTracking ht
                INNER JOIN Habits h ON ht.habit_id = h.id
                WHERE h.user_id = @user_id AND ht.completed = 1
                GROUP BY ht.completed_date
                ORDER BY ht.completed_date DESC
            `);

        const dates = result.recordset
            .filter(r => r.completed_count >= r.total_habits)
            .map(r => formatDateOnly(r.completed_date));

        if (dates.length === 0) return 0;

        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const diff = diffInDays(dates[i - 1], dates[i]);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('Error en calculateUserStreak:', error);
        throw error;
    }
};


//Formatear fecha a YYYY-MM-DD ignorando la hora
 
const formatDateOnly = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

module.exports = {
    calculateCurrentStreak,
    calculateLongestStreak,
    calculateUserStreak
};