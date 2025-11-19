const express = require('express');
const router = express.Router();
const {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/pet.controller');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Зареєструвати нову тварину
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *               - breed
 *               - dateOfBirth
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *                 enum: [dog, cat, bird, rabbit, other]
 *               breed:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               color:
 *                 type: string
 *               weight:
 *                 type: number
 *               microchipNumber:
 *                 type: string
 *               owner:
 *                 type: string
 *                 description: ID власника (опціонально, для тестування. Автоматично береться з JWT)
 *     responses:
 *       201:
 *         description: Тварина створена
 */
router.post('/', protect, createPet);

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Отримати всіх тварин користувача
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список тварин
 */
router.get('/', protect, getAllPets);

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Отримати тварину за ID
 *     tags: [Pets]
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
 *         description: Дані тварини
 */
router.get('/:id', protect, getPetById);

/**
 * @swagger
 * /api/pets/{id}:
 *   put:
 *     summary: Оновити дані тварини
 *     tags: [Pets]
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
 *         description: Тварина оновлена
 */
router.put('/:id', protect, updatePet);

/**
 * @swagger
 * /api/pets/{id}:
 *   delete:
 *     summary: Видалити тварину
 *     tags: [Pets]
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
 *         description: Тварину видалено
 */
router.delete('/:id', protect, deletePet);

module.exports = router;
