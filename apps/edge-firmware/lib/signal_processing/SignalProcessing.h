#pragma once

#include <Arduino.h>

class SignalProcessing {
 public:
  static float computeRMS(const float* samples, int count);
  static float computeKurtosis(const float* samples, int count);
  static float computeSkewness(const float* samples, int count);
};
