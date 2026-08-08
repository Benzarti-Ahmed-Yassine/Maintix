#include "OTAUpdate.h"
#include <ArduinoOTA.h>

OTAUpdate::OTAUpdate() {}

void OTAUpdate::begin() {
  ArduinoOTA.onStart([]() {});
  ArduinoOTA.onEnd([]() {});
  ArduinoOTA.onError([](ota_error_t error) {});
  ArduinoOTA.begin();
}
