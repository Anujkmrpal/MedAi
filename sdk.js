(function (global) {
  function createMedAiSdk(options = {}) {
    const state = {
      requestVersion: 0,
      selectionVersion: 0,
      activeFileKey: null,
      lastResult: null,
      lastError: null
    };

    const {
      onReset = () => {},
      onShowError = () => {},
      onShowResult = () => {},
      onShowMissingFile = () => {},
      readFileText = async () => '',
      buildPayload = () => null,
      classifyText = () => false,
      getDoctorSuggestion = () => 'General physician'
    } = options;

    function getFileKey(file) {
      return file ? `${file.name}:${file.size}:${file.lastModified}` : null;
    }

    function beginSelection(file) {
      state.selectionVersion += 1;
      state.requestVersion += 1;
      state.activeFileKey = getFileKey(file);
      state.lastResult = null;
      state.lastError = null;
      onReset();
      return state.selectionVersion;
    }

    async function analyze(file, { language = 'english' } = {}) {
      if (!file) {
        state.requestVersion += 1;
        state.activeFileKey = null;
        state.lastResult = null;
        state.lastError = null;
        onReset();
        onShowMissingFile('Please upload a report first to analyze it.');
        return { ok: false, type: 'missing-file' };
      }

      const selectionVersion = state.selectionVersion;
      const thisRequestVersion = ++state.requestVersion;
      state.activeFileKey = getFileKey(file);
      onReset();

      let text = '';
      try {
        text = await readFileText(file);
      } catch (error) {
        state.lastError = { message: 'We could not read this file. Please try a plain text or image file.' };
        onShowError(state.lastError.message, 'Could not read file');
        return { ok: false, type: 'read-error', message: state.lastError.message };
      }

      if (thisRequestVersion !== state.requestVersion || selectionVersion !== state.selectionVersion) {
        return { ok: false, type: 'stale' };
      }

      const isMedical = !!classifyText(text, file);
      const payload = buildPayload(language);

      if (!isMedical) {
        state.lastError = {
          message: 'This file does not look like a medical report. Please upload a medical document such as a lab report or prescription.'
        };
        onShowError(state.lastError.message, 'Not a medical report');
        return { ok: false, type: 'error', message: state.lastError.message };
      }

      const doctorSuggestion = getDoctorSuggestion(text);
      state.lastResult = { payload, doctorSuggestion, fileKey: state.activeFileKey };
      onShowResult(payload, text, doctorSuggestion);
      return { ok: true, type: 'result', payload, doctorSuggestion };
    }

    function getState() {
      return { ...state };
    }

    return { beginSelection, analyze, getState };
  }

  global.MedAiSDK = { createMedAiSdk };
})(typeof window !== 'undefined' ? window : globalThis);
