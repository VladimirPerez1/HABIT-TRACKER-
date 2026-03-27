const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// VALIDACIONES
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la categoría es requerido')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color debe ser un código hexadecimal válido. Ej: #ff0000'),
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('El icono no puede exceder 50 caracteres')
];

router.use(authMiddleware);

// RUTAS

// GET /api/categories - Obtener todas las categorías
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Obtener una categoría por ID
router.get('/:id', categoryController.getById);

// POST /api/categories - Crear categoría personalizada
router.post('/', categoryValidation, validate, categoryController.create);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', categoryValidation, validate, categoryController.update);

// DELETE /api/categories/:id - Eliminar categoría
router.delete('/:id', categoryController.delete);

module.exports = router;