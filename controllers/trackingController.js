// controllers/trackingController.js
const Tracking = require('../models/Tracking');
const Habit = require('../models/Habit');
const { calculateCurrentStreak, calculateLongestStreak } = require('../services/streakService');
const { getToday } = require('../utils/dateHelper');

/**
 * Obtener todos los hábitos del usuario con estado de hoy
 */
exports.getToday = async (req, res, next) => {
    try {
        const habits = await Tracking.findTodayByUserId(req.userId);

        const completed = habits.filter(h => h.completed_today).length;
        const total = habits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        res.json({
            success: true,
            data: {
                habits,
                summary: {
                    completed,
                    total,
                    percentage,
                    date: getToday()
                }
            }
        });

    } catch (error) {
        console.error('Error en getToday:', error);
        next(error);
    }
};

/**
 * Marcar hábito como completado
 */
exports.complete = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);
        const { date, moodRating } = req.body;

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        const tracking = await Tracking.complete(habitId, date, moodRating);

        // Calcular racha actual
        const currentStreak = await calculateCurrentStreak(habitId);
        const longestStreak = await calculateLongestStreak(habitId);

        res.json({
            success: true,
            message: '¡Hábito completado!',
            data: {
                tracking,
                streak: {
                    current: currentStreak,
                    longest: longestStreak
                }
            }
        });

    } catch (error) {
        console.error('Error en complete:', error);
        next(error);
    }
};

/**
 * Desmarcar hábito como completado
 */
exports.uncomplete = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);
        const { date } = req.body;

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        const tracking = await Tracking.uncomplete(habitId, date);

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró registro para esta fecha'
            });
        }

        res.json({
            success: true,
            message: 'Hábito desmarcado',
            data: tracking
        });

    } catch (error) {
        console.error('Error en uncomplete:', error);
        next(error);
    }
};

/**
 * Obtener tracking de un hábito en un rango de fechas
 */
exports.getByRange = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);
        const { startDate, endDate } = req.query;

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren startDate y endDate'
            });
        }

        const tracking = await Tracking.findByHabitAndRange(habitId, startDate, endDate);

        res.json({
            success: true,
            count: tracking.length,
            data: tracking
        });

    } catch (error) {
        console.error('Error en getByRange:', error);
        next(error);
    }
};

/**
 * Obtener tracking del mes para calendario
 */
exports.getMonthCalendar = async (req, res, next) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren year y month'
            });
        }

        const calendar = await Tracking.findMonthByUserId(
            req.userId,
            parseInt(year),
            parseInt(month)
        );

        res.json({
            success: true,
            data: calendar
        });

    } catch (error) {
        console.error('Error en getMonthCalendar:', error);
        next(error);
    }
};

/**
 * Obtener racha de un hábito
 */
exports.getStreak = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        const currentStreak = await calculateCurrentStreak(habitId);
        const longestStreak = await calculateLongestStreak(habitId);

        res.json({
            success: true,
            data: {
                habitId,
                habitName: habit.name,
                currentStreak,
                longestStreak
            }
        });

    } catch (error) {
        console.error('Error en getStreak:', error);
        next(error);
    }
};

/**
 * Agregar nota a un hábito
 */
exports.addNote = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);
        const { trackingId, noteText } = req.body;

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        if (!noteText) {
            return res.status(400).json({
                success: false,
                message: 'El texto de la nota es requerido'
            });
        }

        const note = await Tracking.addNote(habitId, trackingId, noteText);

        res.status(201).json({
            success: true,
            message: 'Nota agregada exitosamente',
            data: note
        });

    } catch (error) {
        console.error('Error en addNote:', error);
        next(error);
    }
};

/**
 * Obtener notas de un hábito
 */
exports.getNotes = async (req, res, next) => {
    try {
        const habitId = parseInt(req.params.habitId);

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        const notes = await Tracking.getNotes(habitId);

        res.json({
            success: true,
            count: notes.length,
            data: notes
        });

    } catch (error) {
        console.error('Error en getNotes:', error);
        next(error);
    }
};