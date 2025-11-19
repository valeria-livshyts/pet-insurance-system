const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getPetMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecord.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Створити новий медичний запис (тільки ветеринар)
 *     tags: [Medical Records]
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
 *               - clinic
 *               - visitDate
 *               - recordType
 *             properties:
 *               pet:
 *                 type: string
 *                 description: ID тварини
 *               clinic:
 *                 type: string
 *                 description: ID клініки
 *               visitDate:
 *                 type: string
 *                 format: date
 *               recordType:
 *                 type: string
 *                 enum: [checkup, vaccination, surgery, diagnosis, treatment, test]
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               veterinarian:
 *                 type: string
 *                 description: ID ветеринара (опціонально, для тестування)
 *     responses:
 *       201:
 *         description: Медичний запис створено
 */
router.post('/', protect, authorize('veterinarian'), createMedicalRecord);

/**
 * @swagger
 * /api/medical-records/pet/{petId}:
 *   get:
 *     summary: Отримати медичні записи тварини
 *     tags: [Medical Records]
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
 *         description: Список медичних записів
 */
router.get('/pet/:petId', protect, getPetMedicalRecords);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     summary: Отримати медичний запис за ID
 *     tags: [Medical Records]
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
 *         description: Медичний запис
 */
router.get('/:id', protect, getMedicalRecordById);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   put:
 *     summary: Оновити медичний запис
 *     tags: [Medical Records]
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
 *         description: Запис оновлено
 */
router.put('/:id', protect, authorize('veterinarian'), updateMedicalRecord);

module.exports = router;
