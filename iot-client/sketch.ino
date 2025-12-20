/*
 * IoT Pet Health Monitor
 * Носимий пристрій для моніторингу здоров'я тварин
 * Система медичного страхування тварин
 *
 * Платформа: ESP32 (Wokwi Simulator)
 */

// ==================== ПІНИ ====================
#define POT1_PIN 34    // Потенціометр 1 - пульс
#define POT2_PIN 35    // Потенціометр 2 - активність
#define LED_PIN 2      // LED для сповіщень

// ==================== НАЛАШТУВАННЯ ====================
// Норми показників для собаки
const float TEMP_MIN = 37.5;   // Мінімальна температура (°C)
const float TEMP_MAX = 39.2;   // Максимальна температура (°C)
const int HR_MIN = 60;         // Мінімальний пульс (bpm)
const int HR_MAX = 140;        // Максимальний пульс (bpm)
const int ACT_MIN = 20;        // Мінімальна активність (%)
const int ACT_MAX = 80;        // Максимальна активність (%)

// ==================== ЗМІННІ ====================
float temperature;
int heartRate;
int activity;
String healthStatus;
String recommendation;
String alerts;
float healthIndex;

// Статистика
float avgTemp = 0;
float avgHR = 0;
float avgAct = 0;
int measureCount = 0;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  Serial.println("==========================================");
  Serial.println("  IoT Pet Health Monitor");
  Serial.println("  Система моніторингу здоров'я тварин");
  Serial.println("==========================================");
  Serial.println("Налаштування (собака):");
  Serial.printf("  Температура: %.1f - %.1f C\n", TEMP_MIN, TEMP_MAX);
  Serial.printf("  Пульс: %d - %d bpm\n", HR_MIN, HR_MAX);
  Serial.printf("  Активність: %d - %d %%\n", ACT_MIN, ACT_MAX);
  Serial.println("==========================================\n");
}

// ==================== LOOP ====================
void loop() {
  collectSensorData();      // Збір даних
  analyzeHealth();          // Аналіз здоров'я
  calculateHealthIndex();   // Індекс здоров'я
  determineRecommendation(); // Рекомендація
  updateStatistics();       // Статистика
  printResults();           // Вивід
  handleAlerts();           // Сповіщення

  delay(5000);  // Оновлення кожні 5 секунд
}

// ==================== ЗБІР ДАНИХ ====================
void collectSensorData() {
  // Пульс з потенціометра 1 (40-200 bpm)
  heartRate = map(analogRead(POT1_PIN), 0, 4095, 40, 200);

  // Активність з потенціометра 2 (0-100%)
  activity = map(analogRead(POT2_PIN), 0, 4095, 0, 100);

  // Температура (симуляція на основі пульсу)
  temperature = 37.0 + (heartRate - 40) / 40.0;
}

// ==================== АНАЛІЗ ЗДОРОВ'Я ====================
void analyzeHealth() {
  int anomalyCount = 0;
  alerts = "";

  // Перевірка температури
  if (temperature < TEMP_MIN) {
    anomalyCount++;
    alerts += "Гіпотермія! ";
  } else if (temperature > TEMP_MAX) {
    anomalyCount++;
    alerts += "Гіпертермія! ";
  }

  // Перевірка пульсу
  if (heartRate < HR_MIN) {
    anomalyCount++;
    alerts += "Брадикардія! ";
  } else if (heartRate > HR_MAX) {
    anomalyCount++;
    alerts += "Тахікардія! ";
  }

  // Перевірка активності
  if (activity < ACT_MIN) {
    anomalyCount++;
    alerts += "Низька активність! ";
  } else if (activity > ACT_MAX) {
    anomalyCount++;
    alerts += "Гіперактивність! ";
  }

  // Статус на основі кількості аномалій
  if (anomalyCount == 0) healthStatus = "NORMAL";
  else if (anomalyCount == 1) healthStatus = "WARNING";
  else healthStatus = "CRITICAL";
}

// ==================== ІНДЕКС ЗДОРОВ'Я ====================
void calculateHealthIndex() {
  /*
   * Формула розрахунку індексу здоров'я:
   * - Температура: 40 балів
   * - Пульс: 35 балів
   * - Активність: 25 балів
   * Максимум: 100 балів
   */

  // Оцінка температури
  float tempCenter = (TEMP_MIN + TEMP_MAX) / 2.0;
  float tempRange = (TEMP_MAX - TEMP_MIN) / 2.0;
  float tempDev = abs(temperature - tempCenter) / tempRange;
  float tempScore = max(0.0, 40.0 * (1.0 - tempDev));

  // Оцінка пульсу
  float hrCenter = (HR_MIN + HR_MAX) / 2.0;
  float hrRange = (HR_MAX - HR_MIN) / 2.0;
  float hrDev = abs(heartRate - hrCenter) / hrRange;
  float hrScore = max(0.0, 35.0 * (1.0 - hrDev));

  // Оцінка активності
  float actCenter = (ACT_MIN + ACT_MAX) / 2.0;
  float actRange = (ACT_MAX - ACT_MIN) / 2.0;
  float actDev = abs(activity - actCenter) / actRange;
  float actScore = max(0.0, 25.0 * (1.0 - actDev));

  healthIndex = tempScore + hrScore + actScore;
}

// ==================== РЕКОМЕНДАЦІЯ ====================
void determineRecommendation() {
  if (healthIndex >= 80) recommendation = "OK";
  else if (healthIndex >= 60) recommendation = "MONITOR";
  else if (healthIndex >= 40) recommendation = "CONSULT";
  else recommendation = "URGENT";
}

// ==================== СТАТИСТИКА ====================
void updateStatistics() {
  measureCount++;
  // Ковзне середнє
  avgTemp = avgTemp + (temperature - avgTemp) / measureCount;
  avgHR = avgHR + (heartRate - avgHR) / measureCount;
  avgAct = avgAct + (activity - avgAct) / measureCount;
}

// ==================== ВИВІД ====================
void printResults() {
  Serial.println("---------- МОНІТОРИНГ ----------");
  Serial.printf("Температура: %.1f C %s\n", temperature,
    (temperature >= TEMP_MIN && temperature <= TEMP_MAX) ? "[OK]" : "[!]");
  Serial.printf("Пульс: %d bpm %s\n", heartRate,
    (heartRate >= HR_MIN && heartRate <= HR_MAX) ? "[OK]" : "[!]");
  Serial.printf("Активність: %d%% %s\n", activity,
    (activity >= ACT_MIN && activity <= ACT_MAX) ? "[OK]" : "[!]");
  Serial.println("---------- АНАЛІЗ ----------");
  Serial.printf("Статус: %s\n", healthStatus.c_str());
  Serial.printf("Індекс здоров'я: %.1f/100\n", healthIndex);
  Serial.printf("Рекомендація: %s\n", recommendation.c_str());
  if (alerts.length() > 0) {
    Serial.printf(">>> УВАГА: %s\n", alerts.c_str());
  }
  Serial.println("---------- СТАТИСТИКА ----------");
  Serial.printf("Вимірювань: %d\n", measureCount);
  Serial.printf("Середнє: T=%.1f HR=%.0f Act=%.0f%%\n", avgTemp, avgHR, avgAct);
  Serial.println("================================\n");
}

// ==================== СПОВІЩЕННЯ ====================
void handleAlerts() {
  if (healthStatus == "CRITICAL") {
    digitalWrite(LED_PIN, HIGH);
  } else if (healthStatus == "WARNING") {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}
