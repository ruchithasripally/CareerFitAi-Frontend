/**
 * CareerFit AI - Results Dashboard Controller
 * Loads persisted resume analysis by ID, renders detected skills, and enables filtering/export.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId = urlParams.get('id');

  // DOM Elements
  const skeletonContainer = document.getElementById('skeletonContainer');
  const resultsContent = document.getElementById('resultsContent');
  const errorContainer = document.getElementById('errorContainer');
  const errorMessage = document.getElementById('errorMessage');

  const metaFilename = document.getElementById('metaFilename');
  const metaFileType = document.getElementById('metaFileType');
  const metaDate = document.getElementById('metaDate');
  const metaSkillCount = document.getElementById('metaSkillCount');
  const skillsCountChip = document.getElementById('skillsCountChip');

  const skillsGrid = document.getElementById('skillsGrid');
  const emptySkillsBox = document.getElementById('emptySkillsBox');
  const categoryPillsContainer = document.getElementById('categoryPills');
  const searchInput = document.getElementById('skillSearchInput');

  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const btnDownloadText = document.getElementById('btnDownloadText');
  const btnCopySkills = document.getElementById('btnCopySkills');

  let currentResumeData = null;
  let activeCategory = 'ALL';
  let activeSearchTerm = '';

  // Validate ID presence
  if (!resumeId || isNaN(resumeId)) {
    showError('No valid resume ID was provided in the URL. Please upload a resume first.');
    return;
  }

  // Load data from backend
  await fetchResumeResults(resumeId);

  async function fetchResumeResults(id) {
    showLoading();
    try {
      const data = await CareerFitApi.getResumeById(id);
      currentResumeData = data;
      renderDashboard(data);
    } catch (err) {
      showError(err.message || 'Failed to retrieve resume analysis.');
    }
  }

  function showLoading() {
    skeletonContainer.classList.add('visible');
    resultsContent.style.display = 'none';
    errorContainer.style.display = 'none';
  }

  function showError(msg) {
    skeletonContainer.classList.remove('visible');
    resultsContent.style.display = 'none';
    errorContainer.style.display = 'block';
    errorMessage.textContent = msg;
  }

  function renderDashboard(data) {
    skeletonContainer.classList.remove('visible');
    errorContainer.style.display = 'none';
    resultsContent.style.display = 'block';

    // Populate metadata
    metaFilename.textContent = data.filename || 'Unknown Document';
    metaFilename.title = data.filename || '';
    metaFileType.textContent = data.fileType || 'DOCUMENT';

    // Format date
    let formattedDate = 'Just now';
    if (data.createdAt) {
      try {
        const d = new Date(data.createdAt);
        formattedDate = d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {}
    }
    metaDate.textContent = formattedDate;

    const count = data.skillCount || (data.skills ? data.skills.length : 0);
    metaSkillCount.textContent = count;
    skillsCountChip.textContent = `${count} Detected`;

    // Render category pills
    buildCategoryPills(data);

    // Render skills badges
    renderSkillsList(data.skills || []);

    // Set up export handlers
    setupExportHandlers(data);
  }

  function buildCategoryPills(data) {
    categoryPillsContainer.innerHTML = '';

    const allPill = document.createElement('button');
    allPill.className = 'pill-btn active';
    allPill.textContent = 'All Skills';
    allPill.dataset.category = 'ALL';
    allPill.addEventListener('click', () => setCategoryFilter('ALL', allPill));
    categoryPillsContainer.appendChild(allPill);

    if (data.categorizedSkills) {
      Object.keys(data.categorizedSkills).forEach(category => {
        const count = data.categorizedSkills[category].length;
        if (count > 0) {
          const pill = document.createElement('button');
          pill.className = 'pill-btn';
          pill.textContent = `${category} (${count})`;
          pill.dataset.category = category;
          pill.addEventListener('click', () => setCategoryFilter(category, pill));
          categoryPillsContainer.appendChild(pill);
        }
      });
    }
  }

  function setCategoryFilter(category, buttonEl) {
    activeCategory = category;
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');
    applyFilters();
  }

  // Real-time search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    if (!currentResumeData) return;

    let candidateSkills = [];

    if (activeCategory === 'ALL') {
      candidateSkills = currentResumeData.skills || [];
    } else if (currentResumeData.categorizedSkills && currentResumeData.categorizedSkills[activeCategory]) {
      candidateSkills = currentResumeData.categorizedSkills[activeCategory];
    }

    if (activeSearchTerm) {
      candidateSkills = candidateSkills.filter(skill =>
        skill.toLowerCase().includes(activeSearchTerm)
      );
    }

    renderSkillsList(candidateSkills);
  }

  function renderSkillsList(skills) {
    skillsGrid.innerHTML = '';

    if (!skills || skills.length === 0) {
      emptySkillsBox.classList.add('visible');
      skillsGrid.style.display = 'none';
      return;
    }

    emptySkillsBox.classList.remove('visible');
    skillsGrid.style.display = 'flex';

    skills.forEach(skillName => {
      const badge = document.createElement('span');
      badge.className = 'skill-tag';
      badge.innerHTML = `<span class="skill-tag-dot"></span>${escapeHtml(skillName)}`;
      skillsGrid.appendChild(badge);
    });
  }

  function setupExportHandlers(data) {
    // Download JSON
    if (btnDownloadJson) {
      btnDownloadJson.onclick = () => {
        const exportObject = {
          application: 'CareerFit AI',
          exportDate: new Date().toISOString(),
          analysis: {
            id: data.id,
            filename: data.filename,
            fileType: data.fileType,
            skillCount: data.skillCount,
            createdAt: data.createdAt,
            skills: data.skills,
            categorizedSkills: data.categorizedSkills
          }
        };

        const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `careerfit_${data.id}_skills.json`);
      };
    }

    // Download Text Report
    if (btnDownloadText) {
      btnDownloadText.onclick = () => {
        let textReport = `========================================\n`;
        textReport += `CAREERFIT AI — RESUME SKILLS PROFILE\n`;
        textReport += `========================================\n\n`;
        textReport += `Analysis ID: ${data.id}\n`;
        textReport += `Original Filename: ${data.filename}\n`;
        textReport += `Document Format: ${data.fileType}\n`;
        textReport += `Processed Timestamp: ${data.createdAt}\n`;
        textReport += `Total Technical Skills Detected: ${data.skillCount}\n\n`;
        textReport += `----------------------------------------\n`;
        textReport += `EXTRACTED TECHNICAL SKILLS:\n`;
        textReport += `----------------------------------------\n`;

        if (data.skills && data.skills.length > 0) {
          data.skills.forEach((s, idx) => {
            textReport += `${idx + 1}. ${s}\n`;
          });
        } else {
          textReport += `No matching technical skills were detected.\n`;
        }

        if (data.categorizedSkills) {
          textReport += `\n----------------------------------------\n`;
          textReport += `SKILLS BY CATEGORY:\n`;
          textReport += `----------------------------------------\n`;
          Object.entries(data.categorizedSkills).forEach(([cat, list]) => {
            textReport += `\n[${cat}]\n`;
            list.forEach(item => {
              textReport += `  • ${item}\n`;
            });
          });
        }

        textReport += `\nGenerated by CareerFit AI\n`;

        const blob = new Blob([textReport], { type: 'text/plain' });
        downloadBlob(blob, `careerfit_${data.id}_skills_summary.txt`);
      };
    }

    // Copy to clipboard
    if (btnCopySkills) {
      btnCopySkills.onclick = async () => {
        if (!data.skills || data.skills.length === 0) return;
        const textToCopy = data.skills.join(', ');
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalText = btnCopySkills.innerHTML;
          btnCopySkills.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
          `;
          setTimeout(() => {
            btnCopySkills.innerHTML = originalText;
          }, 2000);
        } catch (e) {
          alert('Failed to copy to clipboard.');
        }
      };
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
