let textArea;
let keyboardContainer;
let tashkeelContainer;
let copyButton;
let clearButton;
let googleButton;
let youtubeButton;
let downloadButton;
let toggleTashkeel;
let themeToggle;
let themeToggleIcon;
let themeToggleLabel;

const tashkeelCharacters = ['َ', 'ً', 'ُ', 'ٌ', 'ِ', 'ٍ', 'ْ', 'ّ', 'ٰ', 'ٔ'];

const keyboardRows = [
  [
    { code: 'Backquote', primary: 'ذ', secondary: 'ّ', legend: '`' },
    { code: 'Digit1', primary: '١', secondary: '!' },
    { code: 'Digit2', primary: '٢', secondary: '"' },
    { code: 'Digit3', primary: '٣', secondary: '#' },
    { code: 'Digit4', primary: '٤', secondary: '$' },
    { code: 'Digit5', primary: '٥', secondary: '%' },
    { code: 'Digit6', primary: '٦', secondary: '^' },
    { code: 'Digit7', primary: '٧', secondary: '&' },
    { code: 'Digit8', primary: '٨', secondary: '*' },
    { code: 'Digit9', primary: '٩', secondary: '(' },
    { code: 'Digit0', primary: '٠', secondary: ')' },
    { code: 'Minus', primary: '-', secondary: '_' },
    { code: 'Equal', primary: '=', secondary: '+' },
    { code: 'Backspace', legend: '⌫', type: 'backspace', size: 2 }
  ],
  [
    { code: 'Tab', legend: 'Tab', type: 'tab', size: 2 },
    { code: 'KeyQ', primary: 'ض', secondary: 'َ' },
    { code: 'KeyW', primary: 'ص', secondary: 'ً' },
    { code: 'KeyE', primary: 'ث', secondary: 'ُ' },
    { code: 'KeyR', primary: 'ق', secondary: 'ٌ' },
    { code: 'KeyT', primary: 'ف', secondary: 'لإ' },
    { code: 'KeyY', primary: 'غ', secondary: 'إ' },
    { code: 'KeyU', primary: 'ع', secondary: 'أ' },
    { code: 'KeyI', primary: 'ه', secondary: 'ـ' },
    { code: 'KeyO', primary: 'خ', secondary: 'ؤ' },
    { code: 'KeyP', primary: 'ح', secondary: 'ء' },
    { code: 'BracketLeft', primary: 'ج', secondary: '[' },
    { code: 'BracketRight', primary: 'د', secondary: ']' },
    { code: 'Backslash', primary: '\\', secondary: '÷', legend: '\\' }
  ],
  [
    { code: 'CapsLock', legend: 'Caps', type: 'caps', size: 2 },
    { code: 'KeyA', primary: 'ش', secondary: 'ِ' },
    { code: 'KeyS', primary: 'س', secondary: 'ٍ' },
    { code: 'KeyD', primary: 'ي', secondary: 'ْ' },
    { code: 'KeyF', primary: 'ب', secondary: 'آ' },
    { code: 'KeyG', primary: 'ل', secondary: 'أل' },
    { code: 'KeyH', primary: 'ا', secondary: 'إ' },
    { code: 'KeyJ', primary: 'ت', secondary: 'ة' },
    { code: 'KeyK', primary: 'ن', secondary: 'ـ' },
    { code: 'KeyL', primary: 'م', secondary: 'ؤ' },
    { code: 'Semicolon', primary: 'ك', secondary: ':' },
    { code: 'Quote', primary: 'ط', secondary: '"' },
    { code: 'Enter', legend: 'Enter', type: 'enter', size: 2 }
  ],
  [
    { code: 'ShiftLeft', legend: 'Shift', type: 'shift', size: 2 },
    { code: 'KeyZ', primary: 'ئ', secondary: '~' },
    { code: 'KeyX', primary: 'ء', secondary: 'ْ' },
    { code: 'KeyC', primary: 'ؤ', secondary: 'ُ' },
    { code: 'KeyV', primary: 'ر', secondary: '،' },
    { code: 'KeyB', primary: 'لا', secondary: 'لأ' },
    { code: 'KeyN', primary: 'ى', secondary: 'إ' },
    { code: 'KeyM', primary: 'ة', secondary: 'أ' },
    { code: 'Comma', primary: 'و', secondary: '،' },
    { code: 'Period', primary: 'ز', secondary: '.' },
    { code: 'Slash', primary: 'ظ', secondary: '؟' },
    { code: 'ShiftRight', legend: 'Shift', type: 'shift', size: 3 }
  ],
  [
    { code: 'Space', legend: 'Space', type: 'space', size: 15 }
  ]
];

let shiftActive = false;
let capsLockActive = false;

const physicalKeyMap = new Map();
let caretBlinkTimer;
let caretVisible = true;

const THEME_STORAGE_KEY = 'arabicKeyboardStudio:theme';

function createKeyElement(key) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'key';
  button.dataset.code = key.code;
  const spanSize = key.size || 1;
  button.dataset.size = spanSize;
  button.style.gridColumn = `span ${spanSize}`;

  const role = key.type && key.type !== 'character' ? key.type : 'character';
  button.dataset.role = role;

  const legendWrapper = document.createElement('span');
  legendWrapper.className = 'key__legend';

  const primary = document.createElement('span');
  primary.className = 'key__primary';
  primary.textContent = key.primary || key.legend || '';
  if (key.primary) {
    primary.dataset.primary = key.primary;
    if (/[\u0600-\u06FF]/.test(key.primary)) {
      primary.classList.add('key__primary--arabic');
    }
  }
  legendWrapper.appendChild(primary);

  if (key.secondary) {
    const secondary = document.createElement('span');
    secondary.className = 'key__shift';
    secondary.textContent = key.secondary;
    legendWrapper.appendChild(secondary);
  }

  if (!key.primary && key.legend) {
    primary.textContent = key.legend;
  }

  button.appendChild(legendWrapper);
  button.addEventListener('click', () => handleOnScreenKey(key));
  return button;
}

function buildKeyboard() {
  keyboardContainer.innerHTML = '';
  physicalKeyMap.clear();
  keyboardRows.forEach((row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard__row';

    row.forEach((key) => {
      const keyElement = createKeyElement(key);
      rowElement.appendChild(keyElement);

      if (key.primary && (!key.type || key.type === 'character')) {
        physicalKeyMap.set(key.code, { primary: key.primary, secondary: key.secondary });
      }
    });

    keyboardContainer.appendChild(rowElement);
  });
}

function buildTashkeel() {
  tashkeelContainer.innerHTML = '';
  tashkeelCharacters.forEach((char) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = char;
    button.addEventListener('click', () => insertCharacter(char));
    tashkeelContainer.appendChild(button);
  });
}

function insertCharacter(char) {
  const { selectionStart, selectionEnd, value } = textArea;
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  textArea.value = `${before}${char}${after}`;
  const cursorPosition = selectionStart + char.length;
  textArea.setSelectionRange(cursorPosition, cursorPosition);
  textArea.dispatchEvent(new Event('input'));
  textArea.focus();
}

function removeCharacter() {
  const { selectionStart, selectionEnd, value } = textArea;
  if (selectionStart === selectionEnd && selectionStart > 0) {
    const before = value.slice(0, selectionStart - 1);
    const after = value.slice(selectionEnd);
    textArea.value = before + after;
    textArea.setSelectionRange(selectionStart - 1, selectionStart - 1);
  } else if (selectionStart !== selectionEnd) {
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    textArea.value = before + after;
    textArea.setSelectionRange(selectionStart, selectionStart);
  }
  textArea.dispatchEvent(new Event('input'));
  textArea.focus();
}

function handleOnScreenKey(key) {
  switch (key.type) {
    case 'backspace':
      removeCharacter();
      break;
    case 'enter':
      insertCharacter('\n');
      break;
    case 'space':
      insertCharacter(' ');
      break;
    case 'tab':
      insertCharacter('\t');
      break;
    case 'shift':
      shiftActive = !shiftActive;
      updateShiftState();
      break;
    case 'caps':
      capsLockActive = !capsLockActive;
      updateCapsState();
      break;
    default: {
      const char = resolveCharacter(key);
      if (!char) {
        return;
      }
      insertCharacter(char);
      if (shiftActive) {
        shiftActive = false;
        updateShiftState();
      }
      break;
    }
  }
}

function resolveCharacter(key) {
  if (!key.primary) {
    return '';
  }
  if (shiftActive) {
    return key.secondary || key.primary;
  }
  if (capsLockActive && key.secondary) {
    return key.secondary;
  }
  return key.primary;
}

function updateShiftState() {
  document.querySelectorAll('[data-role="shift"]').forEach((el) => {
    el.classList.toggle('active', shiftActive);
    el.setAttribute('aria-pressed', String(shiftActive));
  });
}

function updateCapsState() {
  document.querySelectorAll('[data-role="caps"]').forEach((el) => {
    el.classList.toggle('active', capsLockActive);
    el.setAttribute('aria-pressed', String(capsLockActive));
  });
}

function copyToClipboard(text) {
  if (!text) {
    announce('Nothing to copy yet.');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => announce('Copied to clipboard.'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  announce('Copied to clipboard.');
}

function openSearch(provider) {
  const text = textArea.value.trim();
  if (!text) {
    announce('Add some text before searching.');
    return;
  }
  copyToClipboard(text);
  const base = provider === 'google'
    ? 'https://www.google.com/search?q='
    : 'https://www.youtube.com/results?search_query=';
  window.open(`${base}${encodeURIComponent(text)}`, '_blank', 'noopener');
}

function downloadText() {
  const text = textArea.value;
  if (!text) {
    announce('Nothing to save yet.');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'arabic-keyboard-studio.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  announce('Text file saved.');
}

function clearText() {
  if (!textArea.value) {
    announce('The board is already empty.');
    return;
  }
  textArea.value = '';
  textArea.dispatchEvent(new Event('input'));
  textArea.focus();
  announce('Text cleared.');
  caretVisible = true;
  textArea.placeholder = '|';
}

function announce(message) {
  const live = document.getElementById('live-region');
  if (!live) {
    return;
  }
  live.textContent = '';
  setTimeout(() => {
    live.textContent = message;
  }, 10);
}

function toggleTashkeelVisibility() {
  if (!toggleTashkeel) {
    return;
  }
  const expanded = toggleTashkeel.getAttribute('aria-expanded') === 'true';
  const next = !expanded;
  toggleTashkeel.setAttribute('aria-expanded', String(next));
  toggleTashkeel.textContent = next ? 'Hide' : 'Show';
  tashkeelContainer.style.display = next ? 'grid' : 'none';
}

function handlePhysicalKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  if (event.code === 'CapsLock') {
    event.preventDefault();
    capsLockActive = !capsLockActive;
    updateCapsState();
    return;
  }
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    highlightPhysicalKey(event.code, true);
    return;
  }
  const keyMapping = physicalKeyMap.get(event.code);
  if (!keyMapping) {
    return;
  }
  event.preventDefault();
  const char = event.shiftKey
    ? (keyMapping.secondary || keyMapping.primary)
    : (capsLockActive && keyMapping.secondary ? keyMapping.secondary : keyMapping.primary);
  insertCharacter(char);
}

function highlightPhysicalKey(code, active) {
  const keyElement = document.querySelector(`.key[data-code="${code}"]`);
  if (keyElement) {
    keyElement.classList.toggle('active', active);
  }
}

function handlePhysicalKeyup(event) {
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
    highlightPhysicalKey(event.code, false);
  }
}

function handlePhysicalKeypressVisual(event) {
  const key = physicalKeyMap.get(event.code);
  if (!key) {
    return;
  }
  highlightPhysicalKey(event.code, true);
  setTimeout(() => highlightPhysicalKey(event.code, false), 180);
}

function initEventListeners() {
  if (copyButton) {
    copyButton.addEventListener('click', () => copyToClipboard(textArea.value));
  }
  if (clearButton) {
    clearButton.addEventListener('click', clearText);
  }
  if (googleButton) {
    googleButton.addEventListener('click', () => openSearch('google'));
  }
  if (youtubeButton) {
    youtubeButton.addEventListener('click', () => openSearch('youtube'));
  }
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadText);
  }
  if (toggleTashkeel) {
    toggleTashkeel.addEventListener('click', toggleTashkeelVisibility);
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleThemeMode);
  }

  textArea.addEventListener('keydown', handlePhysicalKeydown);
  textArea.addEventListener('keydown', handlePhysicalKeypressVisual);
  textArea.addEventListener('keyup', handlePhysicalKeyup);
  textArea.addEventListener('input', handleTextInput);
  textArea.addEventListener('focus', startCaretBlinking);
  textArea.addEventListener('blur', () => {
    if (!textArea.value) {
      caretVisible = true;
      textArea.placeholder = '|';
    }
  });

  window.addEventListener('blur', () => {
    shiftActive = false;
    updateShiftState();
  });
}

function handleTextInput() {
  if (textArea.value) {
    textArea.placeholder = '';
    return;
  }
  caretVisible = true;
  textArea.placeholder = '|';
}

function startCaretBlinking() {
  if (caretBlinkTimer) {
    return;
  }
  caretVisible = true;
  textArea.placeholder = '|';
  caretBlinkTimer = setInterval(() => {
    if (!textArea) {
      return;
    }
    if (textArea.value) {
      textArea.placeholder = '';
      caretVisible = true;
      return;
    }
    caretVisible = !caretVisible;
    textArea.placeholder = caretVisible ? '|' : '';
  }, 650);
}

function updateThemeToggle(isDark) {
  if (!themeToggle) {
    return;
  }
  themeToggle.setAttribute('aria-pressed', String(isDark));
  if (themeToggleIcon) {
    themeToggleIcon.textContent = isDark ? '☀️' : '🌙';
  }
  if (themeToggleLabel) {
    themeToggleLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  }
  themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function applyTheme(mode, persist = true) {
  const dark = mode === 'dark';
  document.body.classList.toggle('theme-dark', dark);
  updateThemeToggle(dark);
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
    } catch (error) {
      // storage might be unavailable; ignore
    }
  }
}

function initializeTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';
  applyTheme(initial, false);
}

function toggleThemeMode() {
  const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function init() {
  textArea = document.getElementById('arabic-text');
  keyboardContainer = document.getElementById('keyboard');
  tashkeelContainer = document.getElementById('tashkeel-keys');
  copyButton = document.getElementById('copy-text');
  clearButton = document.getElementById('clear-text');
  googleButton = document.getElementById('google-search');
  youtubeButton = document.getElementById('youtube-search');
  downloadButton = document.getElementById('download-text');
  toggleTashkeel = document.getElementById('toggle-tashkeel');
  themeToggle = document.getElementById('theme-toggle');
  themeToggleIcon = themeToggle ? themeToggle.querySelector('.theme-toggle__icon') : null;
  themeToggleLabel = themeToggle ? themeToggle.querySelector('.theme-toggle__label') : null;

  initializeTheme();

  if (!textArea || !keyboardContainer || !tashkeelContainer) {
    return;
  }

  buildKeyboard();
  buildTashkeel();
  updateCapsState();
  updateShiftState();
  initEventListeners();
  startCaretBlinking();
}

window.addEventListener('DOMContentLoaded', init);
