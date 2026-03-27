const Habit = require('../models/Habit');
const { sanitizeString, isValidFrequency, isValidTime } = require('../utils/validators');

//Crear un hábito con validaciones de negocio

const createHabit = async (userId, habitData) => {
    const { name, description, categoryId, frequency, reminderTime } = habitData;

    // Verificar límite de hábitos
    const count = await Habit.countByUserId(userId);
    if (count >= 50) {
        throw new Error('Has alcanzado el límite máximo de 50 hábitos activos');
    }

    // Validar frecuencia
    if (frequency && !isValidFrequency(frequency)) {
        throw new Error('Frecuencia inválida. Use: daily, weekly o custom');
    }

    // Validar hora de recordatorio
    if (reminderTime && !isValidTime(reminderTime)) {
        throw new Error('Formato de hora inválido. Use HH:MM');
    }

    return await Habit.create({
        userId,
        categoryId,
        name: sanitizeString(name),
        description: description ? sanitizeString(description) : null,
        frequency: frequency || 'daily',
        reminderTime
    });
};

//Actualizar un hábito con validaciones

const updateHabit = async (id, userId, updates) => {
    const { name, description, categoryId, frequency, reminderTime } = updates;

    if (frequency && !isValidFrequency(frequency)) {
        throw new Error('Frecuencia inválida');
    }

    if (reminderTime && !isValidTime(reminderTime)) {
        throw new Error('Formato de hora inválido');
    }

    const habit = await Habit.update(id, userId, {
        name: sanitizeString(name),
        description: description ? sanitizeString(description) : null,
        categoryId,
        frequency,
        reminderTime
    });

    if (!habit) throw new Error('Hábito no encontrado');
    return habit;
};

//Obtener todos los hábitos de un usuario

const getUserHabits = async (userId) => {
    return await Habit.findByUserId(userId);
};

//Eliminar un hábito

const deleteHabit = async (id, userId) => {
    const deleted = await Habit.delete(id, userId);
    if (!deleted) throw new Error('Hábito no encontrado');
    return deleted;
};

module.exports = {
    createHabit,
    updateHabit,
    getUserHabits,
    deleteHabit
};