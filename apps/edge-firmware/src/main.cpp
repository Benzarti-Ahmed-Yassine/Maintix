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
    payload += "\"Horodatage\":" + String(millis()) + ",";
    payload += "\"ID_Machine\":\"" + config.load().machine_id + "\",";
    payload += "\"Nom_Machine\":\"" + config.load().machine_name + "\",";
    payload += "\"Mode_Fonctionnement\":\"" + config.load().operating_mode + "\",";
    payload += "\"Température_Moteur\":" + String(sample.temperature_motor) + ",";
    payload += "\"Température_Roulement\":" + String(sample.temperature_bearing) + ",";
    payload += "\"Température_Réducteur\":" + String(sample.temperature_gearbox) + ",";
    payload += "\"Température_Ambiante\":" + String(sample.temperature_ambient) + ",";
    payload += "\"Vibration_RMS\":" + String(features.vibration_rms) + ",";
    payload += "\"Vibration_Crête\":" + String(features.vibration_peak) + ",";
    payload += "\"Facteur_de_Crête\":" + String(features.crest_factor) + ",";
    payload += "\"Kurtosis\":" + String(features.kurtosis) + ",";
    payload += "\"Asymétrie\":" + String(features.skewness) + ",";
    payload += "\"Fréquence_Dominante\":" + String(features.dominant_frequency) + ",";
    payload += "\"Tension\":" + String(sample.voltage) + ",";
    payload += "\"Courant\":" + String(sample.current) + ",";
    payload += "\"Puissance_Active\":" + String(sample.power_active) + ",";
    payload += "\"Puissance_Réactive\":" + String(sample.power_reactive) + ",";
    payload += "\"Puissance_Apparente\":" + String(sample.power_apparent) + ",";
    payload += "\"Facteur_de_Puissance\":" + String(sample.power_factor) + ",";
    payload += "\"Vitesse_Rotation\":" + String(sample.rotation_speed) + ",";
    payload += "\"Couple\":" + String(sample.torque) + ",";
    payload += "\"Pression_Air\":" + String(sample.air_pressure) + ",";
    payload += "\"Humidité\":" + String(sample.humidity) + ",";
    payload += "\"Niveau_Poussière\":" + String(sample.dust_level) + ",";
    payload += "\"Score_Anomalie\":" + String(features.anomaly_score) + ",";
    payload += "\"Indice_Santé\":" + String(features.health_index);
    payload += "}";

    if (mqtt_client.connected()) {
      mqtt_client.publish("maintix/telemetry", payload.c_str());
    }
    last_publish = now;
  }
}
