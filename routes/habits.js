
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const habitController = require('../controllers/habitController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');


// VALIDACIONES

const habitValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del hábito es requerido')
        .isLength({ max: 255 }).withMessage('El nombre no puede exceder 255 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
    body('frequency')
        .optional()
        .isIn(['daily', 'weekly', 'custom']).withMessage('Frecuencia inválida. Use: daily, weekly o custom'),
    body('categoryId')
        .optional()
        .isInt().withMessage('El ID de categoría debe ser un número'),
    body('reminderTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Formato de hora inválido. Use HH:MM o HH:MM:SS')
];

// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN

router.use(authMiddleware);

// RUTAS


// POST /api/habits - Crear nuevo hábito
router.post('/', habitValidation, validate, habitController.create);

// GET /api/habits - Obtener todos los hábitos del usuario
router.get('/', habitController.getAll);

// GET /api/habits/:id - Obtener un hábito específico
router.get('/:id', habitController.getById);

// PUT /api/habits/:id - Actualizar un hábito
router.put('/:id', habitValidation, validate, habitController.update);

// DELETE /api/habits/:id - Eliminar un hábito
router.delete('/:id', habitController.delete);

module.exports = router;    