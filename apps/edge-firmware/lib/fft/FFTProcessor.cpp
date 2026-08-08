#include "FFTProcessor.h"
#include <Arduino.h>
#include <math.h>

FFTProcessor::FFTProcessor(int sample_count) : _sample_count(sample_count) {}

void FFTProcessor::compute(const float* samples, float* magnitudes) {
  for (int i = 0; i < _sample_count; ++i) {
    float real = samples[i];
    float imag = 0.0f;
    for (int j = 0; j < _sample_count; ++j) {
      float angle = 2.0f * PI * i * j / _sample_count;
      real += samples[j] * cos(angle);
      imag += samples[j] * sin(angle);
    }
    magnitudes[i] = sqrt(real * real + imag * imag);
  }
}
