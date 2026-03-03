const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { getConnection, closeConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// IMPORTAR RUTAS DE LA API

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES DE SEGURIDAD

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging de peticiones
app.use(morgan('dev'));

// PARSEO DE DATOS

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ARCHIVOS ESTÁTICOS

app.use(express.static(path.join(__dirname, 'public')));

// RUTAS HTML (VISTAS)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});


// RUTAS API

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// RUTA DE HEALTH CHECK

app.get('/api/health', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT 1 as test');
        
        res.json({
            success: true,
            message: 'Servidor y base de datos funcionando correctamente',
            timestamp: new Date().toISOString(),
            database: result.recordset ? 'conectada' : 'error'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en la conexión a la base de datos',
            error: error.message
        });
    }
});

// MANEJO DE RUTAS NO ENCONTRADAS

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.url
    });
});

// MANEJO DE ERRORES GLOBAL

app.use(errorHandler);

// INICIAR SERVIDOR

const startServer = async () => {
    try {
        // Verificar conexión a base de datos
        await getConnection();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('SERVIDOR HABIT TRACKER INICIADO');
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Base de datos: ${process.env.DB_DATABASE}`);
        });
    } catch (error) {
        console.error('Error al iniciar servidor:', error.message);
        process.exit(1);
    }
};

// CERRAR CONEXIONES AL TERMINAR

process.on('SIGINT', async () => {
    console.log('\nCerrando servidor');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nCerrando servidor');
    await closeConnection();
    process.exit(0);
});

// Iniciar
startServer();