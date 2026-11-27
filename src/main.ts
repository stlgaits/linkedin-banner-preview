import './styles.css';
import {
  createTranslator,
  detectLanguage,
  isMessageKey,
  isSupported,
  type LangCode,
  type Translate,
} from './i18n';
import {
  computeLayout,
  fitScale,
  hasMatchingAspect,
  placeholderBanner,
  type Settings,
} from './geometry';
import {
  DEFAULT_MODE,
  isModeKey,
  PRESETS,
  RECOMMENDED_SIZE,
  type ModeKey,
  type Preset,
} from './presets';

const LANG_STORAGE_KEY = 'lang';

/** Find an element by id and check its type at runtime, so the rest of the code needs no casts. */
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`#${id} is missing or is not a ${type.name}`);
  return el;
}

const dom = {
  lang: byId('lang', HTMLSelectElement),
  mode: byId('mode', HTMLSelectElement),
  bannerFile: byId('bannerFile', HTMLInputElement),
  avatarFile: byId('avatarFile', HTMLInputElement),
  name: byId('name', HTMLInputElement),
  tagline: byId('tagline', HTMLInputElement),
  zone: byId('zone', HTMLInputElement),
  ghost: byId('ghost', HTMLInputElement),
  reset: byId('reset', HTMLElement),
  infos: byId('infos', HTMLElement),
  scene: byId('scene', HTMLElement),
  fit: byId('fit', HTMLElement),
  frame: byId('frame', HTMLElement),
  bannerBox: byId('bannerBox', HTMLElement),
  bannerImg: byId('bannerImg', HTMLImageElement),
  zoneBox: byId('zoneBox', HTMLElement),
  avatarBox: byId('avatarBox', HTMLElement),
  avatarInner: byId('avatarInner', HTMLElement),
  info: byId('info', HTMLElement),
  nameOut: byId('nameOut', HTMLElement),
  tagOut: byId('tagOut', HTMLElement),
};

/** Numeric inputs, keyed by the setting they control. */
const settingInputs = {
  bannerHeight: byId('bh', HTMLInputElement),
  avatarSize: byId('as', HTMLInputElement),
  left: byId('al', HTMLInputElement),
  overlap: byId('ao', HTMLInputElement),
  margin: byId('am', HTMLInputElement),
};

const state: {
  lang: LangCode;
  t: Translate;
  modeKey: ModeKey;
  /** Object URL of a banner chosen by the user. */
  customBanner: string | null;
  nameTouched: boolean;
  taglineTouched: boolean;
} = {
  lang: 'en',
  t: createTranslator('en'),
  modeKey: DEFAULT_MODE,
  customBanner: null,
  nameTouched: false,
  taglineTouched: false,
};

const currentPreset = (): Preset => PRESETS[state.modeKey];

function applyLanguage() {
  const { t } = state;
  document.documentElement.lang = state.lang;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n ?? '';
    if (isMessageKey(key)) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml ?? '';
    if (isMessageKey(key)) el.innerHTML = t(key);
  });
  if (!state.nameTouched) dom.name.value = t('defName');
  if (!state.taglineTouched) dom.tagline.value = t('defTagline');
  dom.lang.value = state.lang;
}

/** `persist`: remember the choice for next visits. */
function setLanguage(lang: string, persist: boolean) {
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

function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readSettings(): Settings {
  return {
    bannerHeight: Number(settingInputs.bannerHeight.value),
    avatarSize: Number(settingInputs.avatarSize.value),
    left: Number(settingInputs.left.value),
    overlap: Number(settingInputs.overlap.value),
    margin: Number(settingInputs.margin.value),
  };
}

function fillSettings(preset: Preset) {
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

function placeholderFor(preset: Preset) {
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

function setMode(modeKey: ModeKey) {
  state.modeKey = modeKey;
  dom.mode.value = modeKey;
  fillSettings(currentPreset());
  render();
}

function firstFile(input: HTMLInputElement): File | null {
  return input.files?.[0] ?? null;
}

function showAvatar(file: File) {
  const img = document.createElement('img');
  img.alt = 'Avatar';
  img.src = URL.createObjectURL(file);
  dom.avatarInner.replaceChildren(img);
}

dom.bannerImg.addEventListener('load', updateInfos);
dom.mode.addEventListener('change', () => {
  if (isModeKey(dom.mode.value)) setMode(dom.mode.value);
});
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
if (isModeKey(requestedMode)) state.modeKey = requestedMode;
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
