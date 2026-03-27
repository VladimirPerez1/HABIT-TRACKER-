const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// VALIDACIONES

const completeValidation = [
    body('date')
        .optional()
        .isDate().withMessage('Formato de fecha inválido. Use YYYY-MM-DD'),
    body('moodRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('El estado de ánimo debe ser entre 1 y 5')
];

const noteValidation = [
    body('noteText')
        .trim()
        .notEmpty().withMessage('El texto de la nota es requerido')
        .isLength({ max: 1000 }).withMessage('La nota no puede exceder 1000 caracteres'),
    body('trackingId')
        .optional()
        .isInt().withMessage('El ID de tracking debe ser un número')
];

const rangeValidation = [
    query('startDate')
        .notEmpty().withMessage('startDate es requerido')
        .isDate().withMessage('Formato de fecha inválido. Use YYYY-MM-DD'),
    query('endDate')
        .notEmpty().withMessage('endDate es requerido')
        .isDate().withMessage('Formato de fecha inválido. Use YYYY-MM-DD')
];

router.use(authMiddleware);

// RUTAS

// GET /api/tracking/today - Hábitos de hoy con su estado
router.get('/today', trackingController.getToday);

// GET /api/tracking/calendar - Tracking del mes para calendario
router.get('/calendar', trackingController.getMonthCalendar);

// POST /api/tracking/:habitId/complete - Marcar hábito como completado
router.post('/:habitId/complete', completeValidation, validate, trackingController.complete);

// POST /api/tracking/:habitId/uncomplete - Desmarcar hábito
router.post('/:habitId/uncomplete', trackingController.uncomplete);

// GET /api/tracking/:habitId/range - Tracking en rango de fechas
router.get('/:habitId/range', rangeValidation, validate, trackingController.getByRange);

// GET /api/tracking/:habitId/streak - Racha de un hábito
router.get('/:habitId/streak', trackingController.getStreak);

// POST /api/tracking/:habitId/notes - Agregar nota
router.post('/:habitId/notes', noteValidation, validate, trackingController.addNote);

// GET /api/tracking/:habitId/notes - Obtener notas
router.get('/:habitId/notes', trackingController.getNotes);

module.exports = router;