#pragma once

#include <Arduino.h>

struct FeatureVector {
  float vibration_rms;
  float vibration_peak;
  float crest_factor;
  float kurtosis;
  float skewness;
  float dominant_frequency;
  float health_index;
  float anomaly_score;
};

class FeatureExtractor {
 public:
  FeatureExtractor(int sample_count, float sample_rate);
  FeatureVector extract(const float* vibration_samples);

 private:
  int _sample_count;
  float _sample_rate;
};
