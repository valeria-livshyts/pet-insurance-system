const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pet Insurance System API',
      version: '1.0.0',
      description: 'API для системи медичного страхування тварин',
      contact: { name: 'API Support' },
    },
    // Добавляем серверы для локали и для Render
    servers: [
      {
        url: 'http://localhost:5000', // для локального теста
        description: 'Local server',
      },
      {
        url: 'https://pet-insurance-system.onrender.com', // production
        description: 'Render production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
