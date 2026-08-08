#include "MQTTClient.h"

MQTTClientWrapper::MQTTClientWrapper(const char* server, int port, const char* client_id)
    : _wifi_client(), _mqtt_client(_wifi_client), _server(server), _port(port), _client_id(client_id) {
}

void MQTTClientWrapper::begin() {
  _mqtt_client.setServer(_server, _port);
}

bool MQTTClientWrapper::publish(const char* topic, const char* payload) {
  if (!_mqtt_client.connected()) {
    return false;
  }
  return _mqtt_client.publish(topic, payload);
}

bool MQTTClientWrapper::connected() {
  return _mqtt_client.connected();
}

void MQTTClientWrapper::loop() {
  _mqtt_client.loop();
}
