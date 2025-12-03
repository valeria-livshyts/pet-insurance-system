const express = require('express');
const router = express.Router();
const {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  cancelPolicy,
  renewPolicy,
  calculatePremium
} = require('../controllers/policy.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/policies/calculate:
 *   post:
 *     summary: Розрахунок вартості полісу
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverageType
 *               - petSpecies
 *               - petAge
 *             properties:
 *               coverageType:
 *                 type: string
 *                 enum: [basic, standard, premium]
 *                 description: Тип покриття
 *               petSpecies:
 *                 type: string
 *                 enum: [dog, cat, bird, rabbit, other]
 *                 description: Вид тварини
 *               petAge:
 *                 type: number
 *                 description: Вік тварини (років)
 *     responses:
 *       200:
 *         description: Розрахунок премії
 */
router.post('/calculate', protect, calculatePremium);

/**
 * @swagger
 * /api/policies:
 *   post:
 *     summary: Створити новий поліс
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pet
 *               - startDate
 *               - endDate
 *               - premium
 *               - coverageAmount
 *             properties:
 *               pet:
 *                 type: string
 *                 description: ID тварини
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               premium:
 *                 type: number
 *               coverageAmount:
 *                 type: number
 *               deductible:
 *                 type: number
 *               coverageType:
 *                 type: string
 *                 enum: [basic, standard, premium]
 *     responses:
 *       201:
 *         description: Поліс створено
 */
router.post('/', protect, authorize('owner', 'agent'), createPolicy);

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: Отримати всі поліси
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список полісів
 */
router.get('/', protect, getAllPolicies);

/**
 * @swagger
 * /api/policies/{id}:
 *   get:
 *     summary: Отримати поліс за ID
 *     tags: [Policies]
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
 *         description: Дані полісу
 */
router.get('/:id', protect, getPolicyById);

/**
 * @swagger
 * /api/policies/{id}:
 *   put:
 *     summary: Оновити поліс
 *     tags: [Policies]
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
 *         description: Поліс оновлено
 */
router.put('/:id', protect, authorize('agent'), updatePolicy);

/**
 * @swagger
 * /api/policies/{id}:
 *   delete:
 *     summary: Скасувати поліс
 *     tags: [Policies]
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
 *         description: Поліс скасовано
 */
router.delete('/:id', protect, authorize('agent'), cancelPolicy);

/**
 * @swagger
 * /api/policies/{id}/renew:
 *   post:
 *     summary: Продовжити поліс на 1 рік
 *     tags: [Policies]
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
 *         description: Поліс продовжено
 */
router.post('/:id/renew', protect, renewPolicy);

module.exports = router;
