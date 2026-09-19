# MAINTIX — Guide de Téléversement Firmware ESP32 (Arduino IDE)

Ce dossier contient le code Arduino C++ pour téléverser le firmware du nœud capteur industriel IoT **ESP32** directement sur votre microcontrôleur.

---

## 📁 Fichiers Disponibles
* **`maintix_esp32_firmware.ino`** : Sketch Arduino complet prêt à être ouvert dans l'**Arduino IDE**.
* **`README.md`** : Guide de câblage et instructions de téléversement pas-à-pas.

---

## 🔌 Schéma de Câblage des Capteurs (ESP32 DevKit V1)

| Capteur / Module | Fonction | Broche Capteur | Broche ESP32 (GPIO) | Remarques |
| :--- | :--- | :--- | :--- | :--- |
| **MPU6050** | Accéléromètre / Vibration | **SDA** | **GPIO 21** | I2C Data (3.3V) |
| | | **SCL** | **GPIO 22** | I2C Clock (3.3V) |
| | | **VCC / GND** | **3V3 / GND** | Alimentation 3.3V |
| **DS18B20** | Température Roulement / Moteur | **DATA** | **GPIO 4** | Résistance Pull-Up 4.7kΩ entre Data et 3.3V |
| | | **VCC / GND** | **3V3 / GND** | 1-Wire Digital |
| **SCT-013-000** | Pince Ampèremétrique Courant AC | **OUT (+)** | **GPIO 34** | Entrée Analogique ADC1 (pont diviseur 10µF) |
| | | **GND** | **GND** | |
| **Capteur Hall / Optique** | Vitesse Rotation (RPM) | **OUT** | **GPIO 18** | Entrée Interruption matérielle (Pull-Up 10kΩ) |
| **LED Intégrée** | Statut Wi-Fi / MQTT / Envoi | **LED_BUILTIN** | **GPIO 2** | Clignote à l'envoi de télémétrie |

---

## 🛠️ Instructions de Téléversement (Arduino IDE)

### 1. Installer l'Arduino IDE
Si ce n'est pas déjà fait, téléchargez et installez **[Arduino IDE (v2.x)](https://www.arduino.cc/en/software)**.

### 2. Ajouter le Support ESP32 dans l'Arduino IDE
1. Allez dans **Fichier > Préférences** (File > Preferences).
2. Dans le champ **URL de gestionnaire de cartes supplémentaires**, collez :
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Allez dans **Outils > Type de carte > Gestionnaire de cartes** (Tools > Board > Boards Manager), recherchez **esp32** par *Espressif Systems* et cliquez sur **Installer**.

### 3. Installer les Bibliothèques Requises
Allez dans **Outils > Gérer les bibliothèques** (Sketch > Include Library > Manage Libraries), recherchez et installez :
1. `PubSubClient` (par Nick O'Leary)
2. `ArduinoJson` (par Benoit Blanchon)
3. `Adafruit MPU6050` (installez aussi `Adafruit Unified Sensor` et `Adafruit BusIO` si demandé)
4. `OneWire` (par Paul Stoffregen)
5. `DallasTemperature` (par Miles Burton)

### 4. Configurer le Code
Ouvrez le fichier `maintix_esp32_firmware.ino` et modifiez vos paramètres réseau :
```cpp
const char* WIFI_SSID       = "VOTRE_NOM_WIFI";       // Nom du réseau Wi-Fi
const char* WIFI_PASSWORD   = "VOTRE_MOT_DE_PASSE";   // Mot de passe Wi-Fi
const char* MQTT_BROKER_IP  = "192.168.1.100";        // Adresse IP de la machine Maintix
const char* MACHINE_ID      = "TX-1250-A";            // Code de la machine ciblée
```

### 5. Téléverser sur l'ESP32
1. Branchez votre carte **ESP32** à votre PC via un câble Micro-USB ou USB-C (de données).
2. Dans **Outils > Type de carte**, sélectionnez **DOIT ESP32 DEVKIT V1** (ou **ESP32 Dev Module**).
3. Dans **Outils > Port**, sélectionnez le port COM correspondant (ex. `COM3` ou `COM4`).
4. Cliquez sur le bouton **Téléverser (Flèche droite ➔)**.
   *(Note : Si l'ESP32 reste bloqué sur "Connecting......", maintenez appuyé le bouton **BOOT** sur la carte pendant 2 secondes jusqu'au début de l'écriture).*

---

## 📡 Validation & Flux en Temps Réel
1. Ouvrez le **Moniteur Série** (`Ctrl + Maj + M`) configuré à **115200 bauds**.
2. Vous verrez la connexion Wi-Fi s'établir, la détection des capteurs MPU6050/DS18B20, et les paquets JSON publiés vers le broker MQTT :
   ```json
   {
     "machineId": "TX-1250-A",
     "timestamp": 12480,
     "vibRMS": 1.42,
     "vibPeak": 2.15,
     "vibX": 0.82,
     "vibY": 0.91,
     "vibZ": 0.74,
     "crestFactor": 1.51,
     "domFreq": 120.0,
     "tempBearing": 42.1,
     "tempMotor": 45.2,
     "tempGearbox": 40.0,
     "tempAmbient": 24.5,
     "voltage": 400.0,
     "current": 4.18,
     "activePower": 2.82,
     "speedRpm": 1450.0,
     "sourceType": "REAL_SENSOR"
   }
   ```
3. L'application Maintix reçoit instantanément la télémétrie sur les dashboards Technicien, Maintenance, Production et Directeur Industriel via le WebSocket temps réel !
