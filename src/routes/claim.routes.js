const express = require('express');
const router = express.Router();
const {
  createClaim,
  getAllClaims,
  getClaimById,
  approveClaim,
  rejectClaim,
  markAsPaid
} = require('../controllers/claim.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Створити новий страховий випадок
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policy
 *               - pet
 *               - incidentDate
 *               - description
 *               - claimType
 *               - claimAmount
 *             properties:
 *               policy:
 *                 type: string
 *                 description: ID полісу
 *               pet:
 *                 type: string
 *                 description: ID тварини
 *               clinic:
 *                 type: string
 *                 description: ID клініки (необов'язково)
 *               incidentDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               claimType:
 *                 type: string
 *                 enum: [illness, accident, surgery, checkup, other]
 *               claimAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Страховий випадок створено
 */
router.post('/', protect, createClaim);

/**
 * @swagger
 * /api/claims:
 *   get:
 *     summary: Отримати всі страхові випадки
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список страхових випадків
 */
router.get('/', protect, getAllClaims);

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Отримати страховий випадок за ID
 *     tags: [Claims]
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
 *         description: Дані страхового випадку
 */
router.get('/:id', protect, getClaimById);

/**
 * @swagger
 * /api/claims/{id}/approve:
 *   put:
 *     summary: Схвалити страховий випадок
 *     tags: [Claims]
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
 *         description: Випадок схвалено
 */
router.put('/:id/approve', protect, authorize('agent'), approveClaim);

/**
 * @swagger
 * /api/claims/{id}/reject:
 *   put:
 *     summary: Відхилити страховий випадок
 *     tags: [Claims]
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
 *         description: Випадок відхилено
 */
router.put('/:id/reject', protect, authorize('agent'), rejectClaim);

/**
 * @swagger
 * /api/claims/{id}/pay:
 *   put:
 *     summary: Позначити як оплачено
 *     tags: [Claims]
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
 *         description: Позначено як оплачено
 */
router.put('/:id/pay', protect, authorize('agent'), markAsPaid);

module.exports = router;
