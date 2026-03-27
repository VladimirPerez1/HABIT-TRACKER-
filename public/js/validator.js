//Validar formato de email

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validar fortaleza de contraseña
 * Mínimo 6 caracteres y al menos un número
 */
const isValidPassword = (password) => {
    return password.length >= 6 && /\d/.test(password);
};

//Validar formato de hora HH:MM o HH:MM:SS
 
const isValidTime = (time) => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return regex.test(time);
};

//Validar formato de fecha YYYY-MM-DD

const isValidDate = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

//Validar código de color hexadecimal

const isValidHexColor = (color) => {
    const regex = /^#[0-9A-Fa-f]{6}$/;
    return regex.test(color);
};

//Validar que un valor sea un entero positivo
 
const isPositiveInt = (value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
};

const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim();
};

 //Validar rating de ánimo (1-5)
 
const isValidMoodRating = (rating) => {
    const num = parseInt(rating);
    return !isNaN(num) && num >= 1 && num <= 5;
};


//Validar frecuencia de hábito
 
const isValidFrequency = (frequency) => {
    return ['daily', 'weekly', 'custom'].includes(frequency);
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidTime,
    isValidDate,
    isValidHexColor,
    isPositiveInt,
    sanitizeString,
    isValidMoodRating,
    isValidFrequency
};