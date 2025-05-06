const express = require('express');
const mqtt = require('mqtt');
const router = express.Router();
const apiRoutes = require('./api');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost';
const MQTT_OPTIONS = {
  port: process.env.MQTT_PORT || 1883,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
  keepalive: 60,
  reconnectPeriod: 1000,
  clean: true,
  encoding: 'utf8'
};

const client = mqtt.connect(MQTT_BROKER, MQTT_OPTIONS);

// Handle MQTT connection
client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe('esp32/sensor/data', (err) => {
    if (!err) {
      console.log('Subscribed to esp32/sensor/data');
    }
  });
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});

client.on('message', (topic, message) => {
  if (topic === 'esp32/sensor/data') {
    console.log('Received sensor data:', message.toString());
    client.publish('esp32/controll', message.toString(), (err) => {
      if (!err) {
        console.log('Message published');
      }
    });
    // Di sini Anda bisa menyimpan data ke database\
    apiRoutes.updateSensorData(message.toString());
  }
});

// API untuk mengirim perintah ke ESP32
router.post('/send-command', (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  client.publish('esp32/control', command.toString(), (err) => {
    if (err) {
      console.error('Publish error:', err);
      return res.status(500).json({ error: 'Failed to send command' });
    }
    res.json({ success: true, message: 'Command sent successfully' });
  });
});

// API untuk mendapatkan status koneksi MQTT
router.get('/status', (req, res) => {
  res.json({
    connected: client.connected,
    broker: MQTT_BROKER
  });
});

module.exports = router;
