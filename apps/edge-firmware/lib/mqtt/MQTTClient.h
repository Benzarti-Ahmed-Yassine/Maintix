#pragma once

#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

class MQTTClientWrapper {
 public:
  MQTTClientWrapper(const char* server, int port, const char* client_id);
  void begin();
  bool publish(const char* topic, const char* payload);
  bool connected();
  void loop();

 private:
  WiFiClient _wifi_client;
  PubSubClient _mqtt_client;
  const char* _server;
  int _port;
  const char* _client_id;
};
