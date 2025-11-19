const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Таймаут 5 секунд
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB підключено: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Помилка підключення до MongoDB:', error.message);
    console.error('Перевірте:');
    console.error('1. Статус кластера на https://cloud.mongodb.com');
    console.error('2. Network Access (0.0.0.0/0)');
    console.error('3. Інтернет з\'єднання');
    process.exit(1);
  }
};

module.exports = connectDB;
