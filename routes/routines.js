const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const routineController = require('../controllers/routineController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// VALIDACIONES

const routineValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la rutina es requerido')
        .isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
    body('timeSchedule')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Formato de hora inválido. Use HH:MM o HH:MM:SS')
];

const addHabitValidation = [
    body('habitId')
        .notEmpty().withMessage('El ID del hábito es requerido')
        .isInt().withMessage('El ID del hábito debe ser un número'),
    body('orderIndex')
        .optional()
        .isInt({ min: 0 }).withMessage('El orden debe ser un número positivo')
];

router.use(authMiddleware);

// RUTAS

// GET /api/routines - Obtener todas las rutinas
router.get('/', routineController.getAll);

// GET /api/routines/:id - Obtener una rutina por ID
router.get('/:id', routineController.getById);

// POST /api/routines - Crear rutina
router.post('/', routineValidation, validate, routineController.create);

// PUT /api/routines/:id - Actualizar rutina
router.put('/:id', routineValidation, validate, routineController.update);

// DELETE /api/routines/:id - Eliminar rutina
router.delete('/:id', routineController.delete);

// POST /api/routines/:id/habits - Agregar hábito a rutina
router.post('/:id/habits', addHabitValidation, validate, routineController.addHabit);

// DELETE /api/routines/:id/habits/:habitId - Eliminar hábito de rutina
router.delete('/:id/habits/:habitId', routineController.removeHabit);

// PATCH /api/routines/:id/toggle - Activar/desactivar rutina
router.patch('/:id/toggle', routineController.toggleActive);

module.exports = router;