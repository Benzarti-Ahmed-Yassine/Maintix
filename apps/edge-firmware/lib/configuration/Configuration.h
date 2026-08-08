#pragma once

#include <ArduinoJson.h>
#include <Preferences.h>
#include <String.h>

struct DeviceConfiguration {
  String machine_id;
  String machine_name;
  String machine_type;
  String production_line;
  String operating_mode;
  String maintenance_type;
  int days_since_maintenance;
  String alarm_code;
};

class Configuration {
 public:
  Configuration();
  void begin();
  DeviceConfiguration load();
  void save(const DeviceConfiguration& config);

 private:
  Preferences _preferences;
};
