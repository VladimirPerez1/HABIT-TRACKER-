// controllers/statsController.js
const { 
    getGeneralStats,
    getWeeklyStats,
    getMonthlyStats,
    getHabitSuccessRate,
    getTopHabits,
    getMoodStats
} = require('../services/statsService');
const { calculateUserStreak } = require('../services/streakService');

/**
 * Obtener estadísticas generales del usuario
 */
exports.getGeneral = async (req, res, next) => {
    try {
        const stats = await getGeneralStats(req.userId);
        const userStreak = await calculateUserStreak(req.userId);

        res.json({
            success: true,
            data: {
                ...stats,
                current_streak: userStreak
            }
        });

    } catch (error) {
        console.error('Error en getGeneral:', error);
        next(error);
    }
};

/**
 * Obtener estadísticas semanales
 */
exports.getWeekly = async (req, res, next) => {
    try {
        const stats = await getWeeklyStats(req.userId);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error en getWeekly:', error);
        next(error);
    }
};

/**
 * Obtener estadísticas mensuales
 */
exports.getMonthly = async (req, res, next) => {
    try {
        const stats = await getMonthlyStats(req.userId);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error en getMonthly:', error);
        next(error);
    }
};

/**
 * Obtener porcentaje de éxito por hábito
 */
exports.getSuccessRate = async (req, res, next) => {
    try {
        const stats = await getHabitSuccessRate(req.userId);

        res.json({
            success: true,
            count: stats.length,
            data: stats
        });

    } catch (error) {
        console.error('Error en getSuccessRate:', error);
        next(error);
    }
};

/**
 * Obtener hábitos más consistentes
 */
exports.getTopHabits = async (req, res, next) => {
    try {
        const habits = await getTopHabits(req.userId);

        res.json({
            success: true,
            data: habits
        });

    } catch (error) {
        console.error('Error en getTopHabits:', error);
        next(error);
    }
};

/**
 * Obtener estadísticas de estado de ánimo
 */
exports.getMood = async (req, res, next) => {
    try {
        const mood = await getMoodStats(req.userId);

        res.json({
            success: true,
            data: mood
        });

    } catch (error) {
        console.error('Error en getMood:', error);
        next(error);
    }
};

/**
 * Obtener resumen completo para el dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const [general, weekly, topHabits, successRate, mood] = await Promise.all([
            getGeneralStats(req.userId),
            getWeeklyStats(req.userId),
            getTopHabits(req.userId),
            getHabitSuccessRate(req.userId),
            getMoodStats(req.userId)
        ]);

        const userStreak = await calculateUserStreak(req.userId);

        res.json({
            success: true,
            data: {
                general: {
                    ...general,
                    current_streak: userStreak
                },
                weekly,
                topHabits,
                successRate,
                mood
            }
        });

    } catch (error) {
        console.error('Error en getDashboard:', error);
        next(error);
    }
};