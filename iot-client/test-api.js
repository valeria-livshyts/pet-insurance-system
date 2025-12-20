/**
 * Тестовий скрипт для перевірки IoT API
 * Симулює відправку даних від IoT пристрою
 *
 * Запуск: node test-api.js
 */

const http = require('http');

// Конфігурація
const config = {
  host: 'localhost',
  port: 5000,
  endpoint: '/api/iot/health-data'
};

// Симуляція даних від IoT пристрою
function generateIoTData(scenario = 'normal') {
  const baseData = {
    deviceId: 'PET-MONITOR-TEST-002',
    petId: '69471e6f8088e82d5e28323e', // Барсик (Лабрадор)
    timestamp: Date.now(),
    sensors: {
      temperature: 38.5,
      heartRate: 80,
      activityLevel: 50
    },
    location: {
      latitude: 50.4501 + (Math.random() - 0.5) * 0.001,
      longitude: 30.5234 + (Math.random() - 0.5) * 0.001
    },
    health: {
      status: 'normal',
      healthIndex: 85,
      anomalyCount: 0,
      vetRecommendation: 'OK',
      alertMessage: ''
    },
    statistics: {
      avgTemperature: 38.4,
      avgHeartRate: 78,
      avgActivity: 48,
      measurementCount: 100,
      totalAnomalies: 0
    }
  };

  switch (scenario) {
    case 'warning':
      baseData.sensors.temperature = 40.0;
      baseData.health.status = 'warning';
      baseData.health.healthIndex = 65;
      baseData.health.anomalyCount = 1;
      baseData.health.vetRecommendation = 'MONITOR';
      baseData.health.alertMessage = 'Висока температура!';
      break;

    case 'critical':
      baseData.sensors.temperature = 41.5;
      baseData.sensors.heartRate = 180;
      baseData.health.status = 'critical';
      baseData.health.healthIndex = 35;
      baseData.health.anomalyCount = 2;
      baseData.health.vetRecommendation = 'URGENT';
      baseData.health.alertMessage = 'Висока температура! Тахікардія!';
      break;

    case 'random':
      baseData.sensors.temperature = 36 + Math.random() * 5;
      baseData.sensors.heartRate = 50 + Math.floor(Math.random() * 150);
      baseData.sensors.activityLevel = Math.floor(Math.random() * 100);
      break;
  }

  return baseData;
}

// Відправка даних на сервер
function sendData(data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);

    const options = {
      hostname: config.host,
      port: config.port,
      path: config.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(responseData)
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

// Головна функція тестування
async function runTests() {
  console.log('='.repeat(50));
  console.log('IoT API Test - Pet Health Monitor');
  console.log('='.repeat(50));
  console.log(`Server: http://${config.host}:${config.port}${config.endpoint}\n`);

  const scenarios = ['normal', 'warning', 'critical', 'random'];

  for (const scenario of scenarios) {
    console.log(`\n--- Тест: ${scenario.toUpperCase()} ---`);

    const data = generateIoTData(scenario);
    console.log('Дані для відправки:');
    console.log(`  Температура: ${data.sensors.temperature.toFixed(1)}°C`);
    console.log(`  Пульс: ${data.sensors.heartRate} bpm`);
    console.log(`  Активність: ${data.sensors.activityLevel}%`);
    console.log(`  Статус: ${data.health.status}`);
    console.log(`  Індекс здоров'я: ${data.health.healthIndex}`);

    try {
      const response = await sendData(data);
      console.log(`\nВідповідь сервера (${response.statusCode}):`);
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(`\nПомилка: ${error.message}`);
      console.log('Переконайтесь, що сервер запущено (npm start)');
    }

    console.log('-'.repeat(50));
  }
}

// Безперервна симуляція (для тестування в реальному часі)
async function continuousSimulation(intervalMs = 5000) {
  console.log('='.repeat(50));
  console.log('IoT Continuous Simulation');
  console.log(`Інтервал: ${intervalMs / 1000} секунд`);
  console.log('Натисніть Ctrl+C для зупинки');
  console.log('='.repeat(50));

  let count = 0;

  const sendContinuous = async () => {
    count++;
    // Випадковий вибір сценарію з більшою ймовірністю "normal"
    const rand = Math.random();
    let scenario;
    if (rand < 0.7) scenario = 'normal';
    else if (rand < 0.9) scenario = 'warning';
    else scenario = 'critical';

    const data = generateIoTData(scenario);

    console.log(`\n[${count}] ${new Date().toLocaleTimeString()} - ${scenario.toUpperCase()}`);
    console.log(`   T: ${data.sensors.temperature.toFixed(1)}°C | HR: ${data.sensors.heartRate} bpm | A: ${data.sensors.activityLevel}%`);

    try {
      const response = await sendData(data);
      console.log(`   -> ${response.statusCode}: ${response.data.message}`);
    } catch (error) {
      console.log(`   -> Помилка: ${error.message}`);
    }
  };

  // Відправка першого запиту
  await sendContinuous();

  // Періодична відправка
  setInterval(sendContinuous, intervalMs);
}

// Запуск
const args = process.argv.slice(2);

if (args.includes('--continuous') || args.includes('-c')) {
  const interval = parseInt(args[1]) || 5000;
  continuousSimulation(interval);
} else {
  runTests().then(() => {
    console.log('\nТестування завершено!');
    process.exit(0);
  });
}
