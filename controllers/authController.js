const User = require('../models/user');
const { generateToken } = require('../utils/jwtHelper');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../config/database');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../services/emailService');

exports.register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;

        const existingUser = await User.emailExists(email);
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const user = await User.create(email, password, fullName);
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    createdAt: user.created_at
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en register:', error);
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isValidPassword = await User.comparePassword(
            password, 
            user.password_hash
        );
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar password_hash de la respuesta
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });

    } catch (error) {
        console.error('Error en getProfile:', error);
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { fullName, email } = req.body;

        if (email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== req.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso por otro usuario'
                });
            }
        }

        const updatedUser = await User.update(req.userId, { fullName, email });

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error en updateProfile:', error);
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);

        if (!user) {
            return res.json({
                success: true,
                message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña'
            });
        }

        const resetToken = jwt.sign(
            { userId: user.id, email: user.email, type: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await sendPasswordResetEmail(email, resetToken);
        
        console.log(`✅ Email de recuperación enviado a: ${email}`);

        res.json({
            success: true,
            message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña'
        });

    } catch (error) {
        console.error('❌ Error en forgotPassword:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error al enviar el correo. Por favor verifica tu configuración de email o inténtalo más tarde.'
        });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.type !== 'password-reset') {
                throw new Error('Token inválido');
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
        
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, user.id)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET password_hash = @password_hash WHERE id = @id');

        try {
            await sendPasswordChangedEmail(user.email, user.full_name);
            console.log(`✅ Email de confirmación enviado a: ${user.email}`);
        } catch (emailError) {
            console.error('⚠️ Error enviando email de confirmación (no crítico):', emailError.message);
        }

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const isValidPassword = await User.comparePassword(
            currentPassword,
            user.password_hash
        );

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
        
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, userId)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET password_hash = @password_hash WHERE id = @id');

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error en changePassword:', error);
        next(error);
    }
};