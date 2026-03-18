const SEVERITY_LABELS = Object.freeze({
  error: { label: 'Error', className: 'badge-error' },
  warning: { label: 'Warning', className: 'badge-warning' }
});

const loadErrorData = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL('data/errors.json'));
    const data = await response.json();
    return Object.freeze(data.errors || {});
  } catch {
    return Object.freeze({});
  }
};

const createBadgeHTML = (severity) => {
  const config = SEVERITY_LABELS[severity];
  if (!config) {
    return '';
  }
  return `<span class="badge ${config.className}">${config.label}</span>`;
};

const escapeHTML = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const renderResult = (entry) => {
  return `
    <div class="result-card">
      <div class="result-header">
        <span class="error-code">#${escapeHTML(String(entry.code))}</span>
        ${createBadgeHTML(entry.severity)}
      </div>
      <div class="message-en">${escapeHTML(entry.message_en)}</div>
      <div class="message-ja">${escapeHTML(entry.message_ja)}</div>
      <div class="solution-box">
        <span class="solution-icon">&#128296;</span>
        <span class="solution-text">${escapeHTML(entry.solution_ja)}</span>
      </div>
      <span class="category-tag">${escapeHTML(entry.category)}</span>
    </div>
  `;
};

const renderNotFound = () => {
  return '<div class="not-found">該当するエラーコードが見つかりません</div>';
};

const searchError = (errors, query) => {
  const code = query.replace(/\D/g, '');
  if (code.length === 0) {
    return null;
  }
  return errors[code] || undefined;
};

const init = async () => {
  const errors = await loadErrorData();
  const searchInput = document.getElementById('search-input');
  const resultArea = document.getElementById('result-area');

  const performSearch = (query) => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      resultArea.innerHTML = '';
      return;
    }

    const result = searchError(errors, trimmed);
    resultArea.innerHTML = result ? renderResult(result) : renderNotFound();
  };

  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  // Check for pending error code from context menu
  try {
    const stored = await chrome.storage.local.get('pendingErrorCode');
    if (stored.pendingErrorCode) {
      searchInput.value = stored.pendingErrorCode;
      performSearch(stored.pendingErrorCode);
      await chrome.storage.local.remove('pendingErrorCode');
    }
  } catch {
    // storage not available, ignore
  }
};

init();
