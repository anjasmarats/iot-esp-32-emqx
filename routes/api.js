const express = require('express');
const router = express.Router();

// Simpan data sensor dalam memori (dalam produksi, gunakan database)
let sensorData = [];

// Endpoint untuk mendapatkan data sensor
router.get('/sensor-data', (req, res) => {
  res.json({
    success: true,
    data: sensorData,
    count: sensorData.length
  });
});

// Endpoint untuk mendapatkan data sensor terbaru
router.get('/latest-sensor-data', (req, res) => {
  const latestData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;
  res.json({
    success: true,
    data: latestData
  });
});

// Middleware untuk menerima data sensor dari MQTT (bisa dipanggil dari route MQTT)
router.updateSensorData = (data) => {
  try {
    const parsedData = JSON.parse(data);
    sensorData.push({
      ...parsedData,
      timestamp: new Date().toISOString()
    });
    
    // Simpan hanya 100 data terakhir
    if (sensorData.length > 100) {
      sensorData = sensorData.slice(sensorData.length - 100);
    }
  } catch (err) {
    console.error('Error parsing sensor data:', err);
  }
};

module.exports = router;