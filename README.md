# MedAi
This is a mobile-style SDK demo for a medical report understanding experience.

## What changed
- The UI now uses a lightweight SDK-style controller in [sdk.js](sdk.js).
- Each file selection starts a fresh analysis lifecycle so old results cannot appear after a new upload.
- The app shows a clear error state for non-medical files and a result state for medical-style uploads.

## How to use it
1. Open the app in a browser.
2. Upload a report file.
3. Click Analyze report.

## SDK usage
You can embed the SDK by loading [sdk.js](sdk.js) and creating a controller:

```js
const sdk = window.MedAiSDK.createMedAiSdk({
  async readFileText(file) {
    return file.text();
  },
  buildPayload(language) {
    return { title: 'Medical report detected' };
  },
  classifyText(text, file) {
    return /hemoglobin|cbc|wbc|platelet/.test(text);
  },
  getDoctorSuggestion(text) {
    return 'General physician';
  }
});
```
