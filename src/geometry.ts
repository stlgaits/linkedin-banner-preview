import { ASPECT_TOLERANCE, type Preset } from './presets';

/** Width of the phone-like frame border (each side), in px. */
const MOBILE_BORDER = 8;
/** Width of the desktop frame border (each side), in px. */
const DESKTOP_BORDER = 1;
/** Minimum spacing between the avatar and the text below the banner, in px. */
const INFO_MIN_PADDING = 12;
/** Horizontal page padding kept around the scaled frame, in px. */
const SCENE_PADDING = 32;

/** User-adjustable values, in px. */
export interface Settings {
  bannerHeight: number;
  avatarSize: number;
  left: number;
  overlap: number;
  margin: number;
}

export interface Layout {
  frameWidth: number;
  bannerHeight: number;
  avatar: { size: number; left: number; top: number; radius: string; fontSize: number };
  zone: { left: number; top: number; size: number; radius: string };
  infoPaddingTop: number;
}

/**
 * Pure layout computation: everything the renderer needs, in px.
 */
export function computeLayout(preset: Preset, settings: Settings): Layout {
  const { bannerHeight, avatarSize, left, overlap, margin } = settings;
  const radius = preset.round ? '50%' : `${preset.cornerRadius}px`;
  const zoneRadius = preset.round ? '50%' : `${preset.cornerRadius + margin}px`;

  return {
    frameWidth: preset.width + 2 * (preset.mobile ? MOBILE_BORDER : DESKTOP_BORDER),
    bannerHeight,
    avatar: {
      size: avatarSize,
      left,
      top: bannerHeight - overlap,
      radius,
      fontSize: avatarSize * 0.45,
    },
    // Area to avoid = avatar + margin, only visible over the banner.
    zone: {
      left: left - margin,
      top: bannerHeight - overlap - margin,
      size: avatarSize + 2 * margin,
      radius: zoneRadius,
    },
    // Text below the banner leaves room for the avatar.
    infoPaddingTop: Math.max(INFO_MIN_PADDING, avatarSize - overlap + INFO_MIN_PADDING),
  };
}

/** Scale factor so a frame fits in the viewport (never above 1). */
export function fitScale(viewportWidth: number, frameWidth: number): number {
  return Math.min(1, (viewportWidth - SCENE_PADDING) / frameWidth);
}

export interface Size {
  width: number;
  height: number;
}

/**
 * Does the image have (about) the same proportions as the displayed banner?
 * If not, LinkedIn will crop it.
 */
export function hasMatchingAspect(image: Size, banner: Size): boolean {
  const imageRatio = image.width / image.height;
  const bannerRatio = banner.width / banner.height;
  return Math.abs(imageRatio / bannerRatio - 1) < ASPECT_TOLERANCE;
}

/**
 * Inline SVG data URL used until the user loads a banner, at the recommended proportions.
 * `label` is the text drawn in the middle.
 */
export function placeholderBanner(width: number, height: number, label: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#3b6ea5"/><stop offset="1" stop-color="#1d3557"/></linearGradient></defs>' +
    '<rect width="100%" height="100%" fill="url(#g)"/>' +
    `<text x="50%" y="50%" fill="#fff" fill-opacity=".85" font-family="Arial,sans-serif" font-size="${Math.round(height / 9)}" ` +
    `text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
