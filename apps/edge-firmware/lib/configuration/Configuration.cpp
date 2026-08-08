#include "Configuration.h"

Configuration::Configuration() {}

void Configuration::begin() {
  _preferences.begin("maintix_cfg", false);
}

DeviceConfiguration Configuration::load() {
  DeviceConfiguration config;
  config.machine_id = _preferences.getString("machine_id", "UNKNOWN");
  config.machine_name = _preferences.getString("machine_name", "MaintixDevice");
  config.machine_type = _preferences.getString("machine_type", "Unknown");
  config.production_line = _preferences.getString("production_line", "Line-1");
  config.operating_mode = _preferences.getString("operating_mode", "Auto");
  config.maintenance_type = _preferences.getString("maintenance_type", "Preventive");
  config.days_since_maintenance = _preferences.getInt("days_since_maintenance", 0);
  config.alarm_code = _preferences.getString("alarm_code", "000");
  return config;
}

void Configuration::save(const DeviceConfiguration& config) {
  _preferences.putString("machine_id", config.machine_id);
  _preferences.putString("machine_name", config.machine_name);
  _preferences.putString("machine_type", config.machine_type);
  _preferences.putString("production_line", config.production_line);
  _preferences.putString("operating_mode", config.operating_mode);
  _preferences.putString("maintenance_type", config.maintenance_type);
  _preferences.putInt("days_since_maintenance", config.days_since_maintenance);
  _preferences.putString("alarm_code", config.alarm_code);
}
