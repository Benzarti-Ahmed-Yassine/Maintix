#include "SensorReader.h"

SensorReader::SensorReader() {}

void SensorReader::begin() {
  // Initialize analog/digital sensors and I2C devices
}

SensorSample SensorReader::read() {
  SensorSample sample;
  sample.temperature_motor = analogRead(34) * 0.1f;
  sample.temperature_bearing = analogRead(35) * 0.1f;
  sample.temperature_gearbox = analogRead(32) * 0.1f;
  sample.temperature_ambient = analogRead(33) * 0.1f;
  sample.vibration_x = analogRead(36) * 0.01f;
  sample.vibration_y = analogRead(39) * 0.01f;
  sample.vibration_z = analogRead(34) * 0.01f;
  sample.voltage = analogRead(35) * 0.1f;
  sample.current = analogRead(32) * 0.01f;
  sample.power_active = analogRead(33) * 0.1f;
  sample.power_reactive = analogRead(36) * 0.1f;
  sample.power_apparent = analogRead(39) * 0.1f;
  sample.power_factor = 0.95f;
  sample.rotation_speed = analogRead(34) * 0.5f;
  sample.torque = analogRead(35) * 0.2f;
  sample.air_pressure = analogRead(32) * 0.1f;
  sample.humidity = analogRead(33) * 0.5f;
  sample.dust_level = analogRead(36) * 0.05f;
  sample.production_speed = analogRead(39) * 0.5f;
  sample.cycle_time = 1.5f;
  sample.downtime = 0.0f;
  return sample;
}
