
const jwt = require('jsonwebtoken');


 //Middleware para verificar token JWT
 
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Acceso denegado.'
            });
        }

        
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token invalido'
            });
        }

        // Verificar y decodificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar información del usuario al request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicia sesión nuevamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

module.exports = authMiddleware;