#pragma once

#include <Arduino.h>

struct SensorSample {
  float temperature_motor;
  float temperature_bearing;
  float temperature_gearbox;
  float temperature_ambient;
  float vibration_x;
  float vibration_y;
  float vibration_z;
  float voltage;
  float current;
  float power_active;
  float power_reactive;
  float power_apparent;
  float power_factor;
  float rotation_speed;
  float torque;
  float air_pressure;
  float humidity;
  float dust_level;
  float production_speed;
  float cycle_time;
  float downtime;
};

class SensorReader {
 public:
  SensorReader();
  void begin();
  SensorSample read();
};
