/**
 * CareerFit AI - Resume Upload Controller
 * Handles drag-and-drop, client-side validation, progress state, and backend submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const selectedFileBox = document.getElementById('selectedFileBox');
  const selectedFilename = document.getElementById('selectedFilename');
  const selectedFilesize = document.getElementById('selectedFilesize');
  const fileIconBadge = document.getElementById('fileIconBadge');
  const btnRemoveFile = document.getElementById('btnRemoveFile');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const alertBox = document.getElementById('alertBox');
  const alertMessage = document.getElementById('alertMessage');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressStatusText = document.getElementById('progressStatusText');
  const progressPercentText = document.getElementById('progressPercentText');

  let currentFile = null;
  let isUploading = false;

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  // Format file size
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Show inline error alert
  function showError(msg) {
    alertMessage.textContent = msg;
    alertBox.classList.add('visible');
  }

  // Hide inline error alert
  function hideError() {
    alertBox.classList.remove('visible');
    alertMessage.textContent = '';
  }

  // Handle selected file validation
  function handleFileSelection(file) {
    hideError();

    if (!file) return;

    // Check size
    if (file.size === 0) {
      showError('The selected file is empty. Please select a valid document.');
      clearFileSelection();
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      showError(`File size (${formatBytes(file.size)}) exceeds the 5 MB limit. Please upload a smaller document.`);
      clearFileSelection();
      return;
    }

    // Check extension
    const name = file.name.toLowerCase();
    let type = '';
    if (name.endsWith('.pdf')) {
      type = 'PDF';
    } else if (name.endsWith('.docx')) {
      type = 'DOCX';
    } else {
      showError('Unsupported file format. CareerFit AI only accepts PDF (.pdf) and Word (.docx) documents.');
      clearFileSelection();
      return;
    }

    currentFile = file;

    // Render file preview
    selectedFilename.textContent = file.name;
    selectedFilesize.textContent = `${formatBytes(file.size)} • ${type} Document`;
    fileIconBadge.textContent = type;
    if (type === 'DOCX') {
      fileIconBadge.classList.add('docx');
    } else {
      fileIconBadge.classList.remove('docx');
    }

    dropzone.style.display = 'none';
    selectedFileBox.classList.add('visible');
    btnAnalyze.disabled = false;
  }

  // Reset file selection
  function clearFileSelection() {
    currentFile = null;
    fileInput.value = '';
    selectedFileBox.classList.remove('visible');
    dropzone.style.display = 'flex';
    btnAnalyze.disabled = true;
    hideProgress();
  }

  // Drag-and-drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  // Click & keyboard events on dropzone
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFileSelection();
  });

  // Progress state helpers
  function showProgress() {
    progressContainer.classList.add('visible');
    progressContainer.classList.add('progress-indeterminate');
    btnAnalyze.disabled = true;
    btnRemoveFile.style.display = 'none';
    btnAnalyze.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      Analyzing Resume...
    `;
  }

  function hideProgress() {
    progressContainer.classList.remove('visible');
    progressContainer.classList.remove('progress-indeterminate');
    btnAnalyze.disabled = currentFile === null;
    btnRemoveFile.style.display = 'inline-flex';
    btnAnalyze.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
      Analyze Resume
    `;
  }

  // Handle analyze submission
  btnAnalyze.addEventListener('click', async () => {
    if (!currentFile || isUploading) return;

    isUploading = true;
    hideError();
    showProgress();

    // Stage updates
    progressStatusText.textContent = 'Uploading and extracting document text...';

    const stageTimer1 = setTimeout(() => {
      progressStatusText.textContent = 'Running boundary-aware skill detection...';
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      progressStatusText.textContent = 'Saving structured analysis to database...';
    }, 2400);

    try {
      const responseData = await CareerFitApi.uploadResume(currentFile);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      // Successfully processed! Redirect to results page with ID
      progressStatusText.textContent = 'Analysis complete! Redirecting to dashboard...';
      window.location.href = `results.html?id=${encodeURIComponent(responseData.id)}`;
    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      isUploading = false;
      hideProgress();
      showError(err.message || 'An error occurred during resume analysis.');
    }
  });
});
