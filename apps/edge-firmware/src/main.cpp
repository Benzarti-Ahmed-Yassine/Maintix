#include <Arduino.h>
#include <ArduinoOTA.h>
#include "configuration/Configuration.h"
#include "sensors/SensorReader.h"
#include "feature_extraction/FeatureExtractor.h"
#include "wifi/WiFiManager.h"
#include "mqtt/MQTTClient.h"
#include "ota/OTAUpdate.h"

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* mqtt_server = "broker.local";
const int mqtt_port = 1883;
const char* mqtt_client_id = "maintix_esp32";

Configuration config;
SensorReader sensor_reader;
WiFiManager wifi_manager(ssid, password);
MQTTClientWrapper mqtt_client(mqtt_server, mqtt_port, mqtt_client_id);
OTAUpdate ota_update;

float vibration_buffer[128];

void setup() {
  Serial.begin(115200);
  config.begin();
  wifi_manager.begin();
  mqtt_client.begin();
  ota_update.begin();
  sensor_reader.begin();
}

void loop() {
  if (!wifi_manager.connected()) {
    wifi_manager.begin();
  }

  mqtt_client.loop();
  ArduinoOTA.handle();

  static unsigned long last_publish = 0;
  unsigned long now = millis();
  if (now - last_publish > 5000) {
    SensorSample sample = sensor_reader.read();
    for (int i = 0; i < 128; ++i) {
      vibration_buffer[i] = sample.vibration_x;
    }

    FeatureExtractor extractor(128, 1000.0f);
    FeatureVector features = extractor.extract(vibration_buffer);

    String payload = "{";
    payload += "\"machineId\":\"" + config.load().machine_id + "\",";
    payload += "\"timestamp\":" + String(millis()) + ",";
    payload += "\"vibRMS\":" + String(features.vibration_rms) + ",";
    payload += "\"vibPeak\":" + String(features.vibration_peak) + ",";
    payload += "\"vibX\":" + String(sample.vibration_x) + ",";
    payload += "\"vibY\":" + String(sample.vibration_y) + ",";
    payload += "\"vibZ\":" + String(sample.vibration_z) + ",";
    payload += "\"crestFactor\":" + String(features.crest_factor) + ",";
    payload += "\"kurtosis\":" + String(features.kurtosis) + ",";
    payload += "\"skewness\":" + String(features.skewness) + ",";
    payload += "\"domFreq\":" + String(features.dominant_frequency) + ",";
    payload += "\"tempMotor\":" + String(sample.temperature_motor) + ",";
    payload += "\"tempBearing\":" + String(sample.temperature_bearing) + ",";
    payload += "\"tempGearbox\":" + String(sample.temperature_gearbox) + ",";
    payload += "\"tempAmbient\":" + String(sample.temperature_ambient) + ",";
    payload += "\"voltage\":" + String(sample.voltage) + ",";
    payload += "\"current\":" + String(sample.current) + ",";
    payload += "\"activePower\":" + String(sample.power_active) + ",";
    payload += "\"speedRpm\":" + String(sample.rotation_speed) + ",";
    payload += "\"torque\":" + String(sample.torque) + ",";
    payload += "\"airPressure\":" + String(sample.air_pressure) + ",";
    payload += "\"humidity\":" + String(sample.humidity) + ",";
    payload += "\"dustLevel\":" + String(sample.dust_level) + ",";
    payload += "\"sourceType\":\"REAL_SENSOR\"";
    payload += "}";

    if (mqtt_client.connected()) {
      mqtt_client.publish("maintix/telemetry", payload.c_str());
      String machineTopic = "maintix/machines/" + config.load().machine_id + "/telemetry";
      mqtt_client.publish(machineTopic.c_str(), payload.c_str());
    }
    last_publish = now;
  }
}

