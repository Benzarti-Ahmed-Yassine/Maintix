#pragma once

#include <Arduino.h>

class WiFiManager {
 public:
  WiFiManager(const char* ssid, const char* password);
  void begin();
  bool connected() const;

 private:
  const char* _ssid;
  const char* _password;
};
