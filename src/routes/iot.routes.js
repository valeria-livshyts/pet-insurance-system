const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iot.controller');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     IoTHealthData:
 *       type: object
 *       required:
 *         - deviceId
 *         - petId
 *         - sensors
 *       properties:
 *         deviceId:
 *           type: string
 *           description: Унікальний ідентифікатор IoT пристрою
 *         petId:
 *           type: string
 *           description: MongoDB ObjectId тварини
 *         timestamp:
 *           type: integer
 *           description: Час вимірювання (мілісекунди)
 *         sensors:
 *           type: object
 *           properties:
 *             temperature:
 *               type: number
 *               description: Температура тіла (°C)
 *             heartRate:
 *               type: integer
 *               description: Пульс (bpm)
 *             activityLevel:
 *               type: integer
 *               description: Рівень активності (0-100%)
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         health:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [normal, warning, critical]
 *             healthIndex:
 *               type: number
 *             anomalyCount:
 *               type: integer
 *             vetRecommendation:
 *               type: string
 *               enum: [OK, MONITOR, CONSULT, URGENT]
 *             alertMessage:
 *               type: string
 *         statistics:
 *           type: object
 *           properties:
 *             avgTemperature:
 *               type: number
 *             avgHeartRate:
 *               type: number
 *             avgActivity:
 *               type: number
 *             measurementCount:
 *               type: integer
 *             totalAnomalies:
 *               type: integer
 */

/**
 * @swagger
 * /api/iot/health-data:
 *   post:
 *     summary: Отримання даних від IoT пристрою
 *     tags: [IoT]
 *     description: Ендпоінт для прийому даних моніторингу здоров'я від носимого пристрою
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IoTHealthData'
 *     responses:
 *       201:
 *         description: Дані успішно отримано
 *       400:
 *         description: Невалідні дані
 *       404:
 *         description: Тварину не знайдено
 */
router.post('/health-data', iotController.receiveHealthData);

/**
 * @swagger
 * /api/iot/pet/{petId}/latest:
 *   get:
 *     summary: Останні дані моніторингу
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Останні дані моніторингу
 *       404:
 *         description: Дані не знайдено
 */
router.get('/pet/:petId/latest', protect, iotController.getLatestData);

/**
 * @swagger
 * /api/iot/pet/{petId}/history:
 *   get:
 *     summary: Історія моніторингу
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Історія вимірювань
 */
router.get('/pet/:petId/history', protect, iotController.getHistory);

/**
 * @swagger
 * /api/iot/pet/{petId}/critical:
 *   get:
 *     summary: Критичні події
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Список критичних подій
 */
router.get('/pet/:petId/critical', protect, iotController.getCriticalEvents);

/**
 * @swagger
 * /api/iot/pet/{petId}/statistics:
 *   get:
 *     summary: Статистика здоров'я
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Статистика за період
 */
router.get('/pet/:petId/statistics', protect, iotController.getHealthStatistics);


/**
 * @swagger
 * /api/iot/pet/{petId}/location:
 *   get:
 *     summary: Поточне місцезнаходження тварини
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: GPS координати тварини
 *       404:
 *         description: Дані про місцезнаходження не знайдено
 */
router.get('/pet/:petId/location', protect, iotController.getLocation);

module.exports = router;
