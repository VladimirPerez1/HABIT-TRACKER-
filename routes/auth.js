const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');


// VALIDACIONES


const registerValidation = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
    body('fullName')
        .trim()
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
];

const updateProfileValidation = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('email')
        .optional()
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail()
];

const forgotPasswordValidation = [
    body('email')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .normalizeEmail()
];

const resetPasswordValidation = [
    body('token')
        .notEmpty().withMessage('Token es requerido'),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
];


// RUTAS PÚBLICAS

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', registerValidation, validate, authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', loginValidation, validate, authController.login);

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);

// POST /api/auth/reset-password - Restablecer contraseña
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);


// RUTAS PROTEGIDAS (requieren autenticación)

// GET /api/auth/profile - Obtener perfil del usuario
router.get('/profile', authMiddleware, authController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', authMiddleware, updateProfileValidation, validate, authController.updateProfile);

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authMiddleware, changePasswordValidation, validate, authController.changePassword);

module.exports = router;