import { describe, expect, it } from 'vitest';
import { computeLayout, fitScale, hasMatchingAspect, placeholderBanner } from '../src/geometry.js';
import { PRESETS, RECOMMENDED_SIZE } from '../src/presets.js';

const settingsOf = (p) => ({
  bannerHeight: p.bannerHeight,
  avatarSize: p.avatarSize,
  left: p.left,
  overlap: p.overlap,
  margin: p.margin,
});

describe('computeLayout', () => {
  it('positions the avatar on the banner using the overlap', () => {
    const p = PRESETS['profil-desktop'];
    const { avatar } = computeLayout(p, settingsOf(p));
    expect(avatar.top).toBe(195.5 - 68);
    expect(avatar.left).toBe(32);
    expect(avatar.radius).toBe('50%');
  });

  it('surrounds the avatar with the safety margin', () => {
    const p = PRESETS['page-desktop'];
    const { zone } = computeLayout(p, settingsOf(p));
    expect(zone).toMatchObject({ left: 24 - 12, top: 134 - 63 - 12, size: 128 + 24 });
  });

  it('uses rounded squares for company logos, growing the zone radius by the margin', () => {
    const p = PRESETS['page-mobile'];
    const { avatar, zone } = computeLayout(p, settingsOf(p));
    expect(avatar.radius).toBe('14px');
    expect(zone.radius).toBe('22px');
  });

  it('accounts for the frame border: 1px on desktop, 8px on mobile', () => {
    const desktop = PRESETS['page-desktop'];
    const mobile = PRESETS['page-mobile'];
    expect(computeLayout(desktop, settingsOf(desktop)).frameWidth).toBe(782 + 2);
    expect(computeLayout(mobile, settingsOf(mobile)).frameWidth).toBe(428 + 16);
  });

  it('keeps a minimum spacing under the banner when the avatar barely overlaps', () => {
    const p = PRESETS['page-desktop'];
    const settings = { ...settingsOf(p), overlap: 500 };
    expect(computeLayout(p, settings).infoPaddingTop).toBe(12);
  });

  it('follows user overrides', () => {
    const p = PRESETS['page-desktop'];
    const { avatar } = computeLayout(p, { ...settingsOf(p), avatarSize: 200 });
    expect(avatar.size).toBe(200);
    expect(avatar.fontSize).toBe(90);
  });
});

describe('fitScale', () => {
  it('never scales up', () => {
    expect(fitScale(3000, 800)).toBe(1);
  });
  it('shrinks the frame to fit the viewport minus padding', () => {
    expect(fitScale(432, 800)).toBe(0.5);
  });
});

describe('hasMatchingAspect', () => {
  it('accepts the recommended sizes for their own preset', () => {
    for (const p of Object.values(PRESETS)) {
      const image = RECOMMENDED_SIZE[p.kind];
      expect(hasMatchingAspect(image, { width: p.width, height: p.bannerHeight })).toBe(true);
    }
  });
  it('flags an image with other proportions', () => {
    expect(hasMatchingAspect({ width: 1000, height: 1000 }, { width: 782, height: 134 })).toBe(
      false,
    );
  });
});

describe('placeholderBanner', () => {
  it('embeds the size and escapes the label', () => {
    const url = placeholderBanner(1512, 256, 'A <b> & C');
    const svg = decodeURIComponent(url.replace('data:image/svg+xml;utf8,', ''));
    expect(svg).toContain('width="1512"');
    expect(svg).toContain('A &lt;b&gt; &amp; C');
  });
});
