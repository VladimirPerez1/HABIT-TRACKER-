const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

const getConnection = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Conexion a SQL satisfactoriamente');
        }
        return pool;
    } catch (error) {
        console.error('Error conectando', error.message);
        throw error;
    }
};

// Cerrar conexion al terminar la aplicacion
const closeConnection = async () => {
    try {
        if (pool) {
            await pool.close();
            console.log('Conexion a SQL cerrada');
        }
    } catch (error) {
        console.error('Error cerrando conexin:', error);
    }
};

module.exports = {
    getConnection,
    closeConnection,
    sql
};