#include "SignalProcessing.h"
#include <math.h>

float SignalProcessing::computeRMS(const float* samples, int count) {
  if (count <= 0) return 0.0f;
  float sum = 0.0f;
  for (int i = 0; i < count; ++i) {
    sum += samples[i] * samples[i];
  }
  return sqrt(sum / count);
}

float SignalProcessing::computeKurtosis(const float* samples, int count) {
  if (count <= 1) return 0.0f;
  float mean = 0.0f;
  for (int i = 0; i < count; ++i) mean += samples[i];
  mean /= count;

  float m2 = 0.0f;
  float m4 = 0.0f;
  for (int i = 0; i < count; ++i) {
    float d = samples[i] - mean;
    m2 += d * d;
    m4 += d * d * d * d;
  }
  if (m2 == 0.0f) return 0.0f;
  float kurtosis = (m4 / count) / ((m2 / count) * (m2 / count));
  return kurtosis - 3.0f;
}

float SignalProcessing::computeSkewness(const float* samples, int count) {
  if (count <= 1) return 0.0f;
  float mean = 0.0f;
  for (int i = 0; i < count; ++i) mean += samples[i];
  mean /= count;

  float m2 = 0.0f;
  float m3 = 0.0f;
  for (int i = 0; i < count; ++i) {
    float d = samples[i] - mean;
    m2 += d * d;
    m3 += d * d * d;
  }
  if (m2 == 0.0f) return 0.0f;
  float skewness = (m3 / count) / pow(m2 / count, 1.5f);
  return skewness;
}
