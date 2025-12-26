const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware CORS — для Render и Swagger
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Разрешаем preflight-запросы
app.options('*', cors());

// JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger документація
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/pets', require('./routes/pet.routes'));
app.use('/api/policies', require('./routes/policy.routes'));
app.use('/api/claims', require('./routes/claim.routes'));
app.use('/api/clinics', require('./routes/clinic.routes'));
app.use('/api/medical-records', require('./routes/medicalRecord.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/iot', require('./routes/iot.routes'));

// Головний маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Pet Insurance System API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Обробка 404
app.use((req, res) => res.status(404).json({ message: 'Маршрут не знайдено' }));

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Внутрішня помилка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
