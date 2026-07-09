const sampleReport = `Patient Name: Riya Sharma
Date: 05 July 2026
Report Type: CBC
Hemoglobin: 12.8 g/dL
RBC Count: 4.6 million/uL
WBC Count: 7200 /uL
Platelets: 250000 /uL
Reference Range: Hemoglobin 12-16 g/dL`;

let inputVersion = 0;
let activeAnalysisId = 0;

const sdk = window.MedAiSDK.createMedAiSdk({
  onReset() {
    resultSection.classList.add('hidden');
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    reportType.textContent = 'Medical report detected';
    confidenceBadge.textContent = '—';
    reportCategory.textContent = '—';
    doctorSuggestion.textContent = '—';
    findingsList.innerHTML = '';
    plainSummary.textContent = 'Upload a report to see a simple explanation here.';
    possibleConcern.textContent = 'Your result will appear here after analysis.';
    safetyNote.textContent = 'This demo is for explanation only and not for diagnosis.';
  },
  onShowError(message, title = 'Not a medical report') {
    resultSection.classList.remove('hidden');
    errorBox.classList.remove('hidden');
    errorBox.textContent = message;
    reportType.textContent = title;
    confidenceBadge.textContent = 'Low confidence';
    reportCategory.textContent = '—';
    doctorSuggestion.textContent = '—';
    findingsList.innerHTML = '';
    plainSummary.textContent = 'We can only explain medical reports. Please upload a medical document.';
    possibleConcern.textContent = 'This file was not accepted because it does not appear to be medical.';
    safetyNote.textContent = 'This demo is for explanation only and not for diagnosis.';
  },
  onShowResult(payload, text, doctorSuggestionText) {
    resultSection.classList.remove('hidden');
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    reportType.textContent = payload.title;
    confidenceBadge.textContent = '87% confidence';
    reportCategory.textContent = payload.category;
    doctorSuggestion.textContent = doctorSuggestionText;

    findingsList.innerHTML = '';
    payload.findings.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      findingsList.appendChild(li);
    });

    plainSummary.textContent = payload.plainSummary;
    possibleConcern.textContent = payload.concern;
    safetyNote.textContent = payload.note;
  },
  onShowMissingFile(message) {
    resultSection.classList.remove('hidden');
    errorBox.classList.remove('hidden');
    errorBox.textContent = message;
    selectedFileLabel.textContent = 'Selected file: none';
    reportType.textContent = 'No report uploaded';
    confidenceBadge.textContent = 'Waiting';
    reportCategory.textContent = '—';
    doctorSuggestion.textContent = '—';
    findingsList.innerHTML = '';
    plainSummary.textContent = 'Upload a report to see a simple explanation here.';
    possibleConcern.textContent = 'No analysis can run until a report is uploaded.';
    safetyNote.textContent = 'This demo is for explanation only and not for diagnosis.';
  },
  async readFileText(file) {
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      return file.text();
    }

    return `Uploaded file: ${file.name}\nFile type: ${file.type || 'unknown'}\nThis preview uses the filename and basic metadata to test the medical-report flow.`;
  },
  buildPayload(language) {
    return languageMap[language] || languageMap.english;
  },
  classifyText(text, file) {
    const fileName = file ? file.name : '';
    const mimeType = file && file.type ? file.type : '';
    const combined = normalizeText(`${text} ${fileName} ${mimeType}`);
    if (!combined) {
      return false;
    }

    const strongMedicalTerms = [
      'hemoglobin', 'platelet', 'platelets', 'wbc', 'rbc', 'cbc', 'glucose',
      'cholesterol', 'urine', 'creatinine', 'albumin', 'bilirubin', 'crp', 'esr',
      'sodium', 'potassium', 'serum', 'prescription', 'vitals', 'symptoms', 'mri',
      'xray', 'x-ray', 'ecg', 'ct', 'scan', 'bloodwork', 'lab report', 'medical report'
    ];

    const hasStrongMedicalTerm = strongMedicalTerms.some((term) => combined.includes(term));
    const hasReportStructure = /\b(patient|name|date|report type|reference range|normal range|lab|test|doctor|result|sample|specimen)\b/.test(combined);
    const hasStructuredUnits = /\b(g\/dl|mg\/dl|mmhg|bpm|u\/l|million\/ul|cells\/ul|%|ml)\b/.test(combined);
    const hasMedicalFileName = /\b(report|lab|prescription|blood|cbc|urine|cholesterol|scan|mri|xray|radiology|panel|test|sample|culture|screening)\b/.test(combined);

    return hasStrongMedicalTerm || hasReportStructure || hasStructuredUnits || hasMedicalFileName;
  },
  getDoctorSuggestion(text) {
    const normalized = text.toLowerCase();
    if (/hemoglobin\s*[:=]\s*([0-9]|1[0-1])|hemoglobin.*below|anemia/i.test(normalized)) {
      return 'Hematologist';
    }
    if (/wbc|white blood|infection|inflammation/i.test(normalized)) {
      return 'General physician';
    }
    return 'General physician';
  }
});

function resetResults() {
  resultSection.classList.add('hidden');
  errorBox.classList.add('hidden');
  errorBox.textContent = '';
  reportType.textContent = 'Medical report detected';
  confidenceBadge.textContent = '—';
  reportCategory.textContent = '—';
  doctorSuggestion.textContent = '—';
  findingsList.innerHTML = '';
  plainSummary.textContent = 'Upload a report to see a simple explanation here.';
  possibleConcern.textContent = 'Your result will appear here after analysis.';
  safetyNote.textContent = 'This demo is for explanation only and not for diagnosis.';
}

function showError(message, title = 'Not a medical report') {
  resultSection.classList.remove('hidden');
  errorBox.classList.remove('hidden');
  errorBox.textContent = message;
  reportType.textContent = title;
  confidenceBadge.textContent = 'Low confidence';
  reportCategory.textContent = '—';
  doctorSuggestion.textContent = '—';
  findingsList.innerHTML = '';
  plainSummary.textContent = 'We can only explain medical reports. Please upload a medical document.';
  possibleConcern.textContent = 'This file was not accepted because it does not appear to be medical.';
  safetyNote.textContent = 'This demo is for explanation only and not for diagnosis.';
}

function showResult(payload, text) {
  resultSection.classList.remove('hidden');
  errorBox.classList.add('hidden');
  errorBox.textContent = '';
  reportType.textContent = payload.title;
  confidenceBadge.textContent = '87% confidence';
  reportCategory.textContent = payload.category;
  doctorSuggestion.textContent = getDoctorRecommendation(text);

  findingsList.innerHTML = '';
  payload.findings.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    findingsList.appendChild(li);
  });

  plainSummary.textContent = payload.plainSummary;
  possibleConcern.textContent = payload.concern;
  safetyNote.textContent = payload.note;
}

const languageMap = {
  english: {
    title: 'Medical report detected',
    category: 'Complete blood count',
    doctorSuggestion: 'General physician',
    findings: [
      'Hemoglobin looks normal.',
      'White blood cells are a little high, which may point to infection or inflammation.',
      'Platelets look normal.'
    ],
    plainSummary: 'This looks like a blood test. It suggests there is no major blood-cell problem, but the slightly higher white blood cell count may mean the body is reacting to infection or inflammation.',
    concern: 'This is not a diagnosis. A slightly high white blood cell count can happen with infection, stress, or inflammation, so it is worth discussing with a doctor.',
    note: 'Safety note: this demo explains the report in simple language and should not replace medical advice.'
  },
  hindi: {
    title: 'मेडिकल रिपोर्ट मिली',
    category: 'खून की जांच',
    doctorSuggestion: 'जनरल फिजीशियन',
    findings: [
      'हीमोग्लोबिन ठीक दिख रहा है।',
      'सफेद रक्त कोशिकाओं की संख्या थोड़ी ज्यादा है, जिससे infection या सूजन का शक हो सकता है।',
      'प्लेटलेट्स सामान्य हैं।'
    ],
    plainSummary: 'यह खून की जांच जैसी रिपोर्ट है। इससे लगता है कि खून में कोई बड़ी समस्या नहीं है, लेकिन सफेद रक्त कोशिकाओं की थोड़ी ज्यादा संख्या बता सकती है कि शरीर में infection या सूजन की reaction हो रही है।',
    concern: 'यह diagnosis नहीं है। सफेद रक्त कोशिकाओं की संख्या थोड़ी ज्यादा होना infection, stress या सूजन के कारण भी हो सकता है, इसलिए डॉक्टर से बात करना अच्छा रहेगा।',
    note: 'सुरक्षा नोट: यह demo बस रिपोर्ट को आसान भाषा में समझाने के लिए है, यह मेडिकल सलाह नहीं है.'
  },
  punjabi: {
    title: 'ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਮਿਲੀ',
    category: 'ਖੂਨ ਦੀ ਜਾਂਚ',
    doctorSuggestion: 'ਜਨਰਲ ਫਿਜ਼ੀਸ਼ੀਅਨ',
    findings: [
      'ਹੀਮੋਗਲੋਬਿਨ ਠੀਕ ਦਿਖਦਾ ਹੈ।',
      'ਚਿੱਟੇ ਖੂਨ ਦੇ ਕਣ ਥੋੜੇ ਜ਼ਿਆਦਾ ਹਨ, ਜੋ ਟਿੱਫ਼ਾ ਜਾਂ ਸੂਜਨ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦੇ ਹਨ।',
      'ਪਲੇਟਲੇਟਸ ਨORMAL ਹਨ।'
    ],
    plainSummary: 'ਇਹ ਖੂਨ ਦੀ ਜਾਂਚ ਵਰਗੀ ਰਿਪੋਰਟ ਹੈ। ਇਸ ਨਾਲ ਲੱਗਦਾ ਹੈ ਕਿ ਖੂਨ ਵਿੱਚ ਕੋਈ ਵੱਡੀ ਸਮੱਸਿਆ ਨਹੀਂ ਹੈ, ਪਰ ਚਿੱਟੇ ਖੂਨ ਦੇ ਕਣਾਂ ਦੀ ਥੋੜੀ ਜ਼ਿਆਦਾ ਗਿਣਤੀ ਇਹ ਦਿਖਾ ਸਕਦੀ ਹੈ ਕਿ ਸਰੀਰ ਵਿੱਚ ਟਿੱਫ਼ਾ ਜਾਂ ਸੂਜਨ ਦੀ ਪ੍ਰਤੀਕ੍ਰਿਆ ਹੋ ਰਹੀ ਹੈ।',
    concern: 'ਇਹ ਨਿਦਾਨ ਨਹੀਂ ਹੈ। ਚਿੱਟੇ ਖੂਨ ਦੇ ਕਣਾਂ ਦੀ ਗਿਣਤੀ ਥੋੜੀ ਜ਼ਿਆਦਾ ਹੋਣਾ infection, stress ਜਾਂ ਸੂਜਨ ਕਾਰਨ ਵੀ ਹੋ ਸਕਦਾ ਹੈ, ਇਸ ਲਈ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰਨਾ ਫਾਇਦੇਮੰਦ ਹੈ।',
    note: 'ਸੁਰੱਖਿਆ ਨੋਟ: ਇਹ demo बस ਰਿਪੋਰਟ ਨੂੰ ਆਸਾਨ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਉਣ ਲਈ ਹੈ, ਇਹ ਮੈਡੀਕਲ ਸਲਾਹ ਨਹੀਂ ਹੈ.'
  }
};

const reportFileInput = document.getElementById('reportFile');
const languageSelect = document.getElementById('language');
const analyzeButton = document.getElementById('analyzeBtn');
const resetButton = document.getElementById('resetBtn');
const selectedFileLabel = document.getElementById('selectedFileLabel');
const resultSection = document.getElementById('resultSection');
const reportType = document.getElementById('reportType');
const confidenceBadge = document.getElementById('confidenceBadge');
const reportCategory = document.getElementById('reportCategory');
const doctorSuggestion = document.getElementById('doctorSuggestion');
const findingsList = document.getElementById('findingsList');
const plainSummary = document.getElementById('plainSummary');
const possibleConcern = document.getElementById('possibleConcern');
const safetyNote = document.getElementById('safetyNote');
const errorBox = document.getElementById('errorBox');

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s./%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

analyzeButton.addEventListener('click', async () => {
  const language = languageSelect.value;
  const file = reportFileInput.files && reportFileInput.files[0] ? reportFileInput.files[0] : null;

  if (!file) {
    sdk.analyze(null, { language });
    return;
  }

  sdk.beginSelection(file);
  await sdk.analyze(file, { language });
});

reportFileInput.addEventListener('change', () => {
  inputVersion += 1;
  activeAnalysisId += 1;
  const file = reportFileInput.files && reportFileInput.files[0] ? reportFileInput.files[0] : null;
  const fileName = file ? file.name : 'No file selected';
  selectedFileLabel.textContent = `Selected file: ${fileName}`;
  sdk.beginSelection(file);
});

resetButton.addEventListener('click', () => {
  reportFileInput.value = '';
  selectedFileLabel.textContent = 'No file selected';
  languageSelect.value = 'english';
  sdk.beginSelection(null);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  resetResults();
});
