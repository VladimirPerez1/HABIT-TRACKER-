const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// RUTAS

// GET /api/stats/dashboard - Resumen completo para el dashboard
router.get('/dashboard', statsController.getDashboard);

// GET /api/stats/general - Estadísticas generales
router.get('/general', statsController.getGeneral);

// GET /api/stats/weekly - Estadísticas semanales
router.get('/weekly', statsController.getWeekly);

// GET /api/stats/monthly - Estadísticas mensuales
router.get('/monthly', statsController.getMonthly);

// GET /api/stats/success-rate - Porcentaje de éxito por hábito
router.get('/success-rate', statsController.getSuccessRate);

// GET /api/stats/top-habits - Hábitos más consistentes
router.get('/top-habits', statsController.getTopHabits);

// GET /api/stats/mood - Estadísticas de estado de ánimo
router.get('/mood', statsController.getMood);

module.exports = router;