const express = require('express');
const router = express.Router();
const {
  getAllClinics,
  getClinicById
} = require('../controllers/clinic.controller');

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     summary: Отримати всі клініки
 *     tags: [Clinics]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Фільтр за містом
 *     responses:
 *       200:
 *         description: Список клінік
 */
router.get('/', getAllClinics);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     summary: Отримати клініку за ID
 *     tags: [Clinics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Дані клініки
 */
router.get('/:id', getClinicById);

module.exports = router;
