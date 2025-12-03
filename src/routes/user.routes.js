const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUser,
  getDashboard,
  getPetMedicalHistory
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/dashboard:
 *   get:
 *     summary: Кабінет власника тварини
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані кабінету (тварини, поліси, заявки)
 */
router.get('/dashboard', protect, getDashboard);

/**
 * @swagger
 * /api/users/pets/{petId}/medical-history:
 *   get:
 *     summary: Медична історія тварини
 *     tags: [Users]
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
 *         description: Медичні записи тварини
 */
router.get('/pets/:petId/medical-history', protect, getPetMedicalHistory);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Отримати користувача за ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Дані користувача
 */
router.get('/:id', protect, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Оновити дані користувача
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Користувач оновлений
 */
router.put('/:id', protect, updateUser);

module.exports = router;
