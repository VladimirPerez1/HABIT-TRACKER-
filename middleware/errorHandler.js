
 //Middleware para manejo de errores
 
const errorHandler = (err, req, res, next) => {
    console.error('='.repeat(50));
    console.error('ERROR CAPTURADO:');
    console.error('Ruta:', req.method, req.path);
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('='.repeat(50));

    // Errores de validacion
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.details || err.message
        });
    }

    // Error de base de datos
    if (err.code === 'EREQUEST') {
        return res.status(500).json({
            success: false,
            message: 'Error en la consulta a la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error de duplicado (clave única)
    if (err.number === 2627) {
        return res.status(400).json({
            success: false,
            message: 'El registro ya existe'
        });
    }

    // Error de clave foránea
    if (err.number === 547) {
        return res.status(400).json({
            success: false,
            message: 'No se puede eliminar porque tiene registros relacionados'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;