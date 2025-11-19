const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUser
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

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
 *     responses:
 *       200:
 *         description: Користувач оновлений
 */
router.put('/:id', protect, updateUser);

module.exports = router;
