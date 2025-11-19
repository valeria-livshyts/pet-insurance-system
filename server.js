require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Підключення до бази даних
connectDB();

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT} в режимі ${process.env.NODE_ENV}`);
  console.log(`API документація доступна на http://localhost:${PORT}/api-docs`);
});

// Обробка помилок
process.on('unhandledRejection', (err) => {
  console.error('Необроблена помилка:', err.message);
  server.close(() => process.exit(1));
});
