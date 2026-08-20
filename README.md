# HemoNutri AI (VITA-Pulse)

HemoNutri AI is a non-invasive, Android-first React Native mobile application built for early field screening of **Anemia** and **Acute Malnutrition** (SAM/MAM). Powered by advanced digital signal processing (DSP), colorimetry, and anthropometrics, it equips community health workers (like ASHA and Anganwadi workers) with diagnostic triage tools that run entirely offline on standard mobile hardware.

---

## Core Screening Engines

### 1. Non-Invasive Anemia Diagnostics (Capillary PPG + Conjunctiva)
- **Optical Capillary PPG Scanner**: Uses the rear camera lens and LED flash to record capillary transillumination.
- **Signal Quality Index (SQI)**: Employs 3rd-degree Savitzky-Golay polynomial filtering and morphological skewness/kurtosis tracking to verify signal authenticity.
- **Continuous Melanin Calibration**: Calculates the user's **Individual Typology Angle (ITA)** on adjacent facial skin to isolate melanin absorption:
  $$\text{ITA} = \arctan\left(\frac{L^* - 50}{b^*}\right) \times \frac{180}{\pi}$$
- **Bayesian Sensor Fusion**: Combines optical PPG features and palpebral conjunctiva CIE $L^*a^*b^*$ coordinates using Inverse-Variance Bayesian Fusion to derive highly accurate Hemoglobin (Hb) levels.

### 2.  Anthropometric Nutrition Triage (MUAC + Facial Emaciation)
- **Spatial Arm Scanner**: Calibrated camera-based Mid-Upper Arm Circumference (MUAC) estimation based on horizontal projection boundaries and scale-offset geometry.
- **Biometric Facial Scanner**: Auto-segments 4 anatomical facial landmarks (Temporal region, Bilateral Buccal Fat Pads, Jawline, and Orbicularis contour) to calculate a **3D Subcutaneous Muscle & Fat Volume Preservation Score** (0–100).
- **Age/Gender Stratified WHO Classifications**: Calibrated dynamically for infants, children, and adults against WHO growth standards and MSF Emergency Nutrition guidelines.

### 3. Clinical Action & Triage Reporting
- **WHO Guidelines-Compliant Triage**: Renders instant triage decisions (Normal, Mild, Moderate, Severe).
- **Hyper-Local Meal Planner**: Custom-generates nutrient-dense, regional diet plans based on ICMR/NIN (National Institute of Nutrition, India) and WHO CMAM protocols.
- **IFA Supplementation Prescription**: Recommends exact Iron & Folic Acid (IFA) dosages adjusted for age, gender, and pregnancy status.
- **QR-Encoded Digital Health Passport**: Generates an encrypted, offline-scannable QR code storing patient health metrics.

---

## Architecture & Tech Stack

```
hemonutri-ai/
├── src/
│   ├── clinical/       # WHO Classification & IFA Dosage engines
│   ├── components/     # Reusable UI components (Gauge, MUAC band, etc.)
│   ├── modules/
│   │   ├── anemia/     # PPG DSP pipeline & Melanin calibration
│   │   └── nutrition/  # Face emaciation & MUAC calculators
│   ├── screens/        # Screen components (Home, Scans, Passport, Results)
│   ├── storage/        # AsyncStorage database & CSV file managers
│   └── theme/          # Custom theme & typography variables
└── package.json
```

- **Framework**: React Native (Expo SDK 54 / React 19)
- **Programming Language**: TypeScript (100% Type-Safe)
- **UI Framework**: React Native Paper
- **Hardware Integration**: `expo-camera` (Optical frame stream & flash control), `expo-image-manipulator` (Biometric ROI color extraction)

---

## Getting Started

### Prerequisites
Make sure you have Node.js and the Expo CLI installed on your machine.

### Installation
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/hemonutri-ai.git
   cd hemonutri-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the Expo development server:
   ```bash
   npx expo start
   ```
- Scan the QR code displayed in your terminal using the **Expo Go** app on your Android or iOS device to test it instantly!

---

##  Data Synchronization (CSV Import/Export)

To facilitate offline field surveillance and integration with existing government health databases:
- **Exporting Data**: Generates an RFC-4180 compliant CSV file saved to the local cache directory. Launches the native system share sheet to send data via Email, WhatsApp, or cloud storage.
- **Importing Data**: Accepts imported patient rosters in the same CSV format, allowing pre-populated local registration lists to be loaded directly on the field device.
