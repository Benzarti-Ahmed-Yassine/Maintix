#pragma once

#include <Arduino.h>

class FFTProcessor {
 public:
  FFTProcessor(int sample_count);
  void compute(const float* samples, float* magnitudes);

 private:
  int _sample_count;
};
