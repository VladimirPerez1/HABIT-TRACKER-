// Obtener fecha de hoy en formato YYYY-MM-DD
const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

// Formatear fecha a YYYY-MM-DD
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

// Obtener fecha de ayer
const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
};

// Diferencia en días entre dos fechas
const diffInDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2 - d1);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Obtener rango de fechas de la semana actual
const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
        start: formatDate(monday),
        end: formatDate(sunday)
    };
};

// Obtener rango de fechas del mes actual
const getCurrentMonthRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
        start: formatDate(start),
        end: formatDate(end)
    };
};

module.exports = {
    getToday,
    formatDate,
    getYesterday,
    diffInDays,
    getCurrentWeekRange,
    getCurrentMonthRange
};