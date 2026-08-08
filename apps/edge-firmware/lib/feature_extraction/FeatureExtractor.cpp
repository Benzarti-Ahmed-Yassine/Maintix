#include "FeatureExtractor.h"
#include "SignalProcessing.h"
#include "FFTProcessor.h"
#include <Arduino.h>

FeatureExtractor::FeatureExtractor(int sample_count, float sample_rate)
    : _sample_count(sample_count), _sample_rate(sample_rate) {}

FeatureVector FeatureExtractor::extract(const float* vibration_samples) {
  FeatureVector features;
  features.vibration_rms = SignalProcessing::computeRMS(vibration_samples, _sample_count);
  features.kurtosis = SignalProcessing::computeKurtosis(vibration_samples, _sample_count);
  features.skewness = SignalProcessing::computeSkewness(vibration_samples, _sample_count);

  float magnitudes[_sample_count];
  FFTProcessor fft(_sample_count);
  fft.compute(vibration_samples, magnitudes);

  float peak = 0.0f;
  int dominant_index = 0;
  for (int i = 1; i < _sample_count / 2; ++i) {
    if (magnitudes[i] > peak) {
      peak = magnitudes[i];
      dominant_index = i;
    }
  }

  features.vibration_peak = peak;
  features.dominant_frequency = dominant_index * (_sample_rate / _sample_count);
  features.crest_factor = peak / max(features.vibration_rms, 0.0001f);
  features.health_index = 100.0f - min(max(features.kurtosis * 5.0f, 0.0f), 100.0f);
  features.anomaly_score = features.crest_factor * 0.5f + abs(features.skewness) * 0.2f;
  return features;
}
