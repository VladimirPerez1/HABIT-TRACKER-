// controllers/routineController.js
const Routine = require('../models/Routine');
const Habit = require('../models/Habit');

// Obtener todas las rutinas del usuario
exports.getAll = async (req, res, next) => {
    try {
        const routines = await Routine.findByUserId(req.userId);

        res.json({
            success: true,
            count: routines.length,
            data: routines
        });

    } catch (error) {
        console.error('Error obteniendo rutinas:', error);
        next(error);
    }
};

// Obtener una rutina por ID
exports.getById = async (req, res, next) => {
    try {
        const routine = await Routine.findById(req.params.id, req.userId);

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        res.json({
            success: true,
            data: routine
        });

    } catch (error) {
        console.error('Error obteniendo rutina:', error);
        next(error);
    }
};

// Crear rutina
exports.create = async (req, res, next) => {
    try {
        const { name, description, timeSchedule } = req.body;

        const routine = await Routine.create(
            req.userId,
            name,
            description,
            timeSchedule
        );

        res.status(201).json({
            success: true,
            message: 'Rutina creada exitosamente',
            data: routine
        });

    } catch (error) {
        console.error('Error creando rutina:', error);
        next(error);
    }
};

// Actualizar rutina
exports.update = async (req, res, next) => {
    try {
        const { name, description, timeSchedule } = req.body;

        const routine = await Routine.update(
            req.params.id,
            req.userId,
            name,
            description,
            timeSchedule
        );

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Rutina actualizada exitosamente',
            data: routine
        });

    } catch (error) {
        console.error('Error actualizando rutina:', error);
        next(error);
    }
};

// Eliminar rutina
exports.delete = async (req, res, next) => {
    try {
        const deleted = await Routine.delete(req.params.id, req.userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Rutina eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando rutina:', error);
        next(error);
    }
};

// Agregar hábito a rutina
exports.addHabit = async (req, res, next) => {
    try {
        const { habitId, orderIndex } = req.body;

        // Verificar que la rutina pertenece al usuario
        const routine = await Routine.findById(req.params.id, req.userId);
        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        // Verificar que el hábito pertenece al usuario
        const habit = await Habit.findById(habitId, req.userId);
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        // Verificar que el hábito no está ya en la rutina
        const habitExists = routine.habits.find(h => h.id === habitId);
        if (habitExists) {
            return res.status(400).json({
                success: false,
                message: 'El hábito ya está en esta rutina'
            });
        }

        const result = await Routine.addHabit(req.params.id, habitId, orderIndex);

        res.status(201).json({
            success: true,
            message: 'Hábito agregado a la rutina exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error agregando hábito a rutina:', error);
        next(error);
    }
};

// Eliminar hábito de rutina
exports.removeHabit = async (req, res, next) => {
    try {
        const { habitId } = req.params;

        // Verificar que la rutina pertenece al usuario
        const routine = await Routine.findById(req.params.id, req.userId);
        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        const removed = await Routine.removeHabit(req.params.id, habitId);

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado en esta rutina'
            });
        }

        res.json({
            success: true,
            message: 'Hábito eliminado de la rutina exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando hábito de rutina:', error);
        next(error);
    }
};

// Activar/desactivar rutina
exports.toggleActive = async (req, res, next) => {
    try {
        const routine = await Routine.toggleActive(req.params.id, req.userId);

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Rutina no encontrada'
            });
        }

        res.json({
            success: true,
            message: `Rutina ${routine.is_active ? 'activada' : 'desactivada'} exitosamente`,
            data: routine
        });

    } catch (error) {
        console.error('Error toggling rutina:', error);
        next(error);
    }
};