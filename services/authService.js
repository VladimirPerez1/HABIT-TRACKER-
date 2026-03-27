const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const { isValidEmail, isValidPassword } = require('../utils/validators');

//Registrar un nuevo usuario
 
const registerUser = async (email, password, fullName) => {
    if (!isValidEmail(email)) {
        throw new Error('Email inválido');
    }

    if (!isValidPassword(password)) {
        throw new Error('La contraseña debe tener al menos 6 caracteres y un número');
    }

    const exists = await User.emailExists(email);
    if (exists) {
        throw new Error('El email ya está registrado');
    }

    const user = await User.create(email, password, fullName);
    const token = generateToken({ userId: user.id, email: user.email });

    return { user, token };
};

//Autenticar usuario

const loginUser = async (email, password) => {
    if (!isValidEmail(email)) {
        throw new Error('Email inválido');
    }

    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('Credenciales inválidas');
    }

    const isValid = await User.comparePassword(password, user.password_hash);
    if (!isValid) {
        throw new Error('Credenciales inválidas');
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return { user, token };
};

//Obtener perfil de usuario sin datos sensibles

const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const { password_hash, ...profile } = user;
    return profile;
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};