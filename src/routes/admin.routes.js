const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// Всі маршрути потребують авторизації адміністратора
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Отримати список користувачів
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [owner, veterinarian, agent, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список користувачів
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   put:
 *     summary: Змінити роль користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [owner, veterinarian, agent, admin]
 *     responses:
 *       200:
 *         description: Роль змінено
 */
router.put('/users/:userId/role', adminController.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Заблокувати/розблокувати користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Статус змінено
 */
router.put('/users/:userId/status', adminController.toggleUserStatus);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Статистика системи
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Фінансовий звіт
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Звіт
 */
router.get('/reports', adminController.generateReport);

/**
 * @swagger
 * /api/admin/clinics:
 *   post:
 *     summary: Створити клініку
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - licenseNumber
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Клініку створено
 */
router.post('/clinics', adminController.createClinic);

/**
 * @swagger
 * /api/admin/clinics/{clinicId}:
 *   put:
 *     summary: Оновити клініку
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Клініку оновлено
 */
router.put('/clinics/:clinicId', adminController.updateClinic);

/**
 * @swagger
 * /api/admin/system/health:
 *   get:
 *     summary: Стан системи
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Стан системи
 */
router.get('/system/health', adminController.getSystemHealth);

module.exports = router;
