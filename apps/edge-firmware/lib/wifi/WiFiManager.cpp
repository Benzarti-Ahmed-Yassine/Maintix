#include "WiFiManager.h"
#include <WiFi.h>

WiFiManager::WiFiManager(const char* ssid, const char* password)
    : _ssid(ssid), _password(password) {}

void WiFiManager::begin() {
  WiFi.begin(_ssid, _password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry++ < 20) {
    delay(500);
  }
}

bool WiFiManager::connected() const {
  return WiFi.status() == WL_CONNECTED;
}
