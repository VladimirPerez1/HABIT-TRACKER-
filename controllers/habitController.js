
const Habit = require('../models/Habit');


 //Crear un nuevo hábito
exports.create = async (req, res, next) => {
    try {
        const { name, description, categoryId, frequency, reminderTime } = req.body;

        // Verificar límite de hábitos (máximo 50)
        const habitCount = await Habit.countByUserId(req.userId);
        if (habitCount >= 50) {
            return res.status(400).json({
                success: false,
                message: 'Has alcanzado el límite máximo de 50 hábitos activos'
            });
        }

        const habitData = {
            userId: req.userId,
            categoryId,
            name,
            description,
            frequency,
            reminderTime
        };

        const habit = await Habit.create(habitData);

        res.status(201).json({
            success: true,
            message: 'Hábito creado exitosamente',
            data: habit
        });

    } catch (error) {
        console.error('Error creando hábito:', error);
        next(error);
    }
};


//Obtener todos los hábitos del usuario
 
exports.getAll = async (req, res, next) => {
    try {
        const habits = await Habit.findByUserId(req.userId);

        res.json({
            success: true,
            count: habits.length,
            data: habits
        });

    } catch (error) {
        console.error('Error obteniendo hábitos:', error);
        next(error);
    }
};

 //Obtener un hábito por ID
 
exports.getById = async (req, res, next) => {
    try {
        const habit = await Habit.findById(req.params.id, req.userId);

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        res.json({
            success: true,
            data: habit
        });

    } catch (error) {
        console.error('Error obteniendo hábito:', error);
        next(error);
    }
};


 //Actualizar un hábito
 
exports.update = async (req, res, next) => {
    try {
        const { name, description, categoryId, frequency, reminderTime } = req.body;

        const habit = await Habit.update(req.params.id, req.userId, {
            name,
            description,
            categoryId,
            frequency,
            reminderTime
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Hábito actualizado exitosamente',
            data: habit
        });

    } catch (error) {
        console.error('Error actualizando hábito:', error);
        next(error);
    }
};


//Eliminar un hábito
 
exports.delete = async (req, res, next) => {
    try {
        const deleted = await Habit.delete(req.params.id, req.userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Hábito no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Hábito eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando hábito:', error);
        next(error);
    }
};