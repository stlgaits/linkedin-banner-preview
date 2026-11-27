import './styles.css';
import { createTranslator, detectLanguage, isSupported } from './i18n/index.js';
import { computeLayout, fitScale, hasMatchingAspect, placeholderBanner } from './geometry.js';
import { DEFAULT_MODE, PRESETS, RECOMMENDED_SIZE } from './presets.js';

const LANG_STORAGE_KEY = 'lang';

/** @param {string} id */
function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

const dom = {
  lang: /** @type {HTMLSelectElement} */ (byId('lang')),
  mode: /** @type {HTMLSelectElement} */ (byId('mode')),
  bannerFile: /** @type {HTMLInputElement} */ (byId('bannerFile')),
  avatarFile: /** @type {HTMLInputElement} */ (byId('avatarFile')),
  name: /** @type {HTMLInputElement} */ (byId('name')),
  tagline: /** @type {HTMLInputElement} */ (byId('tagline')),
  zone: /** @type {HTMLInputElement} */ (byId('zone')),
  ghost: /** @type {HTMLInputElement} */ (byId('ghost')),
  reset: byId('reset'),
  infos: byId('infos'),
  scene: byId('scene'),
  fit: byId('fit'),
  frame: byId('frame'),
  bannerBox: byId('bannerBox'),
  bannerImg: /** @type {HTMLImageElement} */ (byId('bannerImg')),
  zoneBox: byId('zoneBox'),
  avatarBox: byId('avatarBox'),
  avatarInner: byId('avatarInner'),
  info: byId('info'),
  nameOut: byId('nameOut'),
  tagOut: byId('tagOut'),
};

/** Numeric inputs, keyed by the setting they control. */
const settingInputs = {
  bannerHeight: /** @type {HTMLInputElement} */ (byId('bh')),
  avatarSize: /** @type {HTMLInputElement} */ (byId('as')),
  left: /** @type {HTMLInputElement} */ (byId('al')),
  overlap: /** @type {HTMLInputElement} */ (byId('ao')),
  margin: /** @type {HTMLInputElement} */ (byId('am')),
};

const state = {
  lang: 'en',
  t: createTranslator('en'),
  modeKey: DEFAULT_MODE,
  /** Object URL of a banner chosen by the user. */
  customBanner: /** @type {string | null} */ (null),
  nameTouched: false,
  taglineTouched: false,
};

const currentPreset = () => PRESETS[state.modeKey];

function applyLanguage() {
  const { t } = state;
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(/** @type {HTMLElement} */ (el).dataset.i18n ?? '');
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(/** @type {HTMLElement} */ (el).dataset.i18nHtml ?? '');
  });
  if (!state.nameTouched) dom.name.value = t('defName');
  if (!state.taglineTouched) dom.tagline.value = t('defTagline');
  dom.lang.value = state.lang;
}

/**
 * @param {string} lang
 * @param {boolean} persist Remember the choice for next visits.
 */
function setLanguage(lang, persist) {
  if (!isSupported(lang)) return;
  state.lang = lang;
  state.t = createTranslator(lang);
  if (persist) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* storage unavailable (private mode, blocked): the choice just won't persist */
    }
  }
  applyLanguage();
  render();
}

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readSettings() {
  return {
    bannerHeight: Number(settingInputs.bannerHeight.value),
    avatarSize: Number(settingInputs.avatarSize.value),
    left: Number(settingInputs.left.value),
    overlap: Number(settingInputs.overlap.value),
    margin: Number(settingInputs.margin.value),
  };
}

/** @param {import('./presets.js').Preset} preset */
function fillSettings(preset) {
  settingInputs.bannerHeight.value = String(preset.bannerHeight);
  settingInputs.avatarSize.value = String(preset.avatarSize);
  settingInputs.left.value = String(preset.left);
  settingInputs.overlap.value = String(preset.overlap);
  settingInputs.margin.value = String(preset.margin);
}

function render() {
  const preset = currentPreset();
  const layout = computeLayout(preset, readSettings());
  const { avatar, zone } = layout;

  dom.frame.classList.toggle('mobile', preset.mobile);
  dom.frame.classList.toggle('ghost', dom.ghost.checked);
  dom.frame.style.width = `${layout.frameWidth}px`;
  document.body.classList.toggle('show-zone', dom.zone.checked);
  document.body.classList.toggle('ghost', dom.ghost.checked);

  dom.bannerBox.style.height = `${layout.bannerHeight}px`;
  dom.bannerImg.src = state.customBanner ?? placeholderFor(preset);

  Object.assign(dom.avatarBox.style, {
    width: `${avatar.size}px`,
    height: `${avatar.size}px`,
    left: `${avatar.left}px`,
    top: `${avatar.top}px`,
    borderRadius: avatar.radius,
  });
  dom.avatarInner.style.fontSize = `${avatar.fontSize}px`;
  if (!dom.avatarInner.querySelector('img')) {
    dom.avatarInner.textContent = (dom.name.value.trim()[0] || '?').toUpperCase();
  }

  Object.assign(dom.zoneBox.style, {
    left: `${zone.left}px`,
    top: `${zone.top}px`,
    width: `${zone.size}px`,
    height: `${zone.size}px`,
    borderRadius: zone.radius,
  });

  dom.nameOut.textContent = dom.name.value;
  dom.tagOut.textContent = dom.tagline.value;
  dom.info.style.paddingTop = `${layout.infoPaddingTop}px`;

  updateFit();
  updateInfos();
}

/** @param {import('./presets.js').Preset} preset */
function placeholderFor(preset) {
  const { width, height } = RECOMMENDED_SIZE[preset.kind];
  return placeholderBanner(width, height, state.t('upload', { w: width, h: height }));
}

function updateFit() {
  const scale = fitScale(document.documentElement.clientWidth, dom.frame.offsetWidth);
  dom.fit.style.transform = `scale(${scale})`;
  dom.fit.style.width = `${dom.frame.offsetWidth}px`;
  dom.fit.style.height = `${dom.frame.offsetHeight}px`;
  dom.scene.style.height = `${dom.frame.offsetHeight * scale + 90}px`;
  dom.fit.dataset.scale = String(scale);
}

/** Info line under the settings. Needs the image dimensions, hence the `load` handling. */
function updateInfos() {
  const img = dom.bannerImg;
  if (!img.complete || !img.naturalWidth) return; // the `load` listener calls us back

  const { t } = state;
  const preset = currentPreset();
  const banner = { width: preset.width, height: Number(settingInputs.bannerHeight.value) };
  const rec = RECOMMENDED_SIZE[preset.kind];
  const scale = Number(dom.fit.dataset.scale || 1);
  const matches = hasMatchingAspect({ width: img.naturalWidth, height: img.naturalHeight }, banner);

  dom.infos.innerHTML =
    t('info', {
      bw: banner.width,
      bh: banner.height,
      rec: `${rec.width}×${rec.height} px`,
      nw: img.naturalWidth,
      nh: img.naturalHeight,
    }) +
    (matches ? '' : ` · <span class="warn">${t('warn')}</span>`) +
    ` · ${t('zoom', { z: Math.round(scale * 100) })}` +
    `<br><i>${t(`note.${state.modeKey}`)}</i>`;
}

function setMode(modeKey) {
  state.modeKey = modeKey;
  dom.mode.value = modeKey;
  fillSettings(currentPreset());
  render();
}

/** @param {HTMLInputElement} input */
function firstFile(input) {
  return input.files?.[0] ?? null;
}

function showAvatar(file) {
  const img = document.createElement('img');
  img.alt = 'Avatar';
  img.src = URL.createObjectURL(file);
  dom.avatarInner.replaceChildren(img);
}

dom.bannerImg.addEventListener('load', updateInfos);
dom.mode.addEventListener('change', () => setMode(dom.mode.value));
dom.lang.addEventListener('change', () => setLanguage(dom.lang.value, true));
dom.reset.addEventListener('click', () => {
  fillSettings(currentPreset());
  render();
});
dom.bannerFile.addEventListener('change', () => {
  const file = firstFile(dom.bannerFile);
  if (!file) return;
  if (state.customBanner) URL.revokeObjectURL(state.customBanner);
  state.customBanner = URL.createObjectURL(file);
  render();
});
dom.avatarFile.addEventListener('change', () => {
  const file = firstFile(dom.avatarFile);
  if (file) showAvatar(file);
});
dom.name.addEventListener('input', () => {
  state.nameTouched = true;
});
dom.tagline.addEventListener('input', () => {
  state.taglineTouched = true;
});
[...Object.values(settingInputs), dom.zone, dom.ghost, dom.name, dom.tagline].forEach((input) =>
  input.addEventListener('input', render),
);
window.addEventListener('resize', updateFit);

// Optional URL parameters: ?mode=page-mobile&zone=1&ghost=1&lang=fr
const params = new URLSearchParams(location.search);
const requestedMode = params.get('mode');
if (requestedMode && Object.hasOwn(PRESETS, requestedMode)) state.modeKey = requestedMode;
dom.zone.checked = params.get('zone') === '1';
dom.ghost.checked = params.get('ghost') === '1';

dom.mode.value = state.modeKey;
fillSettings(currentPreset());
setLanguage(
  detectLanguage({
    param: params.get('lang'),
    saved: readSavedLanguage(),
    browser: navigator.language,
  }),
  false,
);
