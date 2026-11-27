import { expect, test, type Locator } from '@playwright/test';

const bannerSvg = (width: number, height: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#3a7"/></svg>`,
  );
const svgFile = (name: string, width: number, height: number) => ({
  name,
  mimeType: 'image/svg+xml',
  buffer: bannerSvg(width, height),
});

const SETTING_IDS = ['bh', 'as', 'al', 'ao', 'am'] as const;

interface ExpectedView extends Record<(typeof SETTING_IDS)[number], string> {
  mobile: boolean;
  round: boolean;
}

/** `boundingBox()` is null for hidden elements: fail with a clear message instead of a TypeError. */
async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no bounding box (is it visible?)');
  return box;
}

// Values from src/presets.ts, as displayed in the settings inputs.
const PRESET_VALUES: Record<string, ExpectedView> = {
  'page-desktop': {
    bh: '134',
    as: '128',
    al: '24',
    ao: '63',
    am: '12',
    mobile: false,
    round: false,
  },
  'page-mobile': { bh: '73.3', as: '99', al: '13', ao: '34', am: '8', mobile: true, round: false },
  'profil-desktop': {
    bh: '195.5',
    as: '128',
    al: '32',
    ao: '68',
    am: '12',
    mobile: false,
    round: true,
  },
  'profil-mobile': { bh: '107', as: '128', al: '24', ao: '76', am: '8', mobile: true, round: true },
};

test.describe('initial state', () => {
  test('loads in English with the company page desktop view', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('LinkedIn Banner Preview');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#mode')).toHaveValue('page-desktop');
    await expect(page.locator('#nameOut')).toHaveText('Your name');
    await expect(page.locator('#tagOut')).toHaveText('Your tagline here');
  });

  test('shows a placeholder banner with the recommended size', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#infos')).toContainText('1512×256 px');
    await expect(page.locator('#infos .warn')).toHaveCount(0);
  });

  test('never contacts another origin: nothing leaves the browser', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (!['data:', 'blob:'].includes(url.protocol) && url.hostname !== 'localhost') {
        external.push(request.url());
      }
    });
    await page.goto('/');
    await page.locator('#bannerFile').setInputFiles(svgFile('b.svg', 1512, 256));
    await page.locator('#avatarFile').setInputFiles(svgFile('a.svg', 200, 200));
    await expect(page.locator('#avatarInner img')).toBeVisible();
    expect(external).toEqual([]);
  });

  test('has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.locator('#mode').selectOption('profil-mobile');
    expect(errors).toEqual([]);
  });
});

test.describe('views', () => {
  for (const [mode, expected] of Object.entries(PRESET_VALUES)) {
    test(`${mode} applies its preset`, async ({ page }) => {
      await page.goto('/');
      await page.locator('#mode').selectOption(mode);

      for (const id of SETTING_IDS) {
        await expect(page.locator(`#${id}`)).toHaveValue(expected[id]);
      }
      await expect(page.locator('#frame')).toHaveClass(
        expected.mobile ? /mobile/ : /^(?!.*mobile)/,
      );
      await expect(page.locator('#avatarBox')).toHaveCSS('width', `${expected.as}px`);
      await expect(page.locator('#avatarBox')).toHaveCSS(
        'border-radius',
        expected.round ? /50%|\d+px/ : /^\d+px$/,
      );
      await expect(page.locator('#infos i')).not.toBeEmpty();
    });
  }

  test('uses a round avatar for profiles and a rounded square for company pages', async ({
    page,
  }) => {
    await page.goto('/?mode=profil-desktop');
    const profileRadius = await page.locator('#avatarBox').evaluate((el) => el.style.borderRadius);
    await page.locator('#mode').selectOption('page-desktop');
    const pageRadius = await page.locator('#avatarBox').evaluate((el) => el.style.borderRadius);
    expect(profileRadius).toBe('50%');
    expect(pageRadius).toBe('6px');
  });

  test('keeps the avatar on the banner by the configured overlap', async ({ page }) => {
    await page.goto('/?mode=page-desktop');
    const banner = await boxOf(page.locator('#bannerBox'));
    const avatar = await boxOf(page.locator('#avatarBox'));
    const scale = Number(await page.locator('#fit').getAttribute('data-scale'));
    const overlap = (banner.y + banner.height - avatar.y) / scale;
    expect(overlap).toBeCloseTo(63, 0);
  });
});

test.describe('URL parameters', () => {
  test('?mode, ?zone and ?ghost set the initial state', async ({ page }) => {
    await page.goto('/?mode=profil-mobile&zone=1&ghost=1');
    await expect(page.locator('#mode')).toHaveValue('profil-mobile');
    await expect(page.locator('#zone')).toBeChecked();
    await expect(page.locator('#ghost')).toBeChecked();
    await expect(page.locator('body')).toHaveClass(/show-zone/);
    await expect(page.locator('#frame')).toHaveClass(/ghost/);
  });

  test('an unknown ?mode falls back to the default view', async ({ page }) => {
    await page.goto('/?mode=constructor');
    await expect(page.locator('#mode')).toHaveValue('page-desktop');
  });
});

test.describe('settings', () => {
  test('editing the avatar size moves the avatar and its safe zone', async ({ page }) => {
    await page.goto('/?zone=1');
    await page.locator('#as').fill('200');
    await expect(page.locator('#avatarBox')).toHaveCSS('width', '200px');
    await expect(page.locator('#zoneBox')).toHaveCSS('width', `${200 + 2 * 12}px`);
  });

  test('"Reset to defaults" restores the preset values', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bh').fill('300');
    await page.locator('#al').fill('90');
    await page.locator('#reset').click();
    await expect(page.locator('#bh')).toHaveValue('134');
    await expect(page.locator('#al')).toHaveValue('24');
    await expect(page.locator('#bannerBox')).toHaveCSS('height', '134px');
  });

  test('switching view replaces edited values with the new preset', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bh').fill('300');
    await page.locator('#mode').selectOption('profil-desktop');
    await expect(page.locator('#bh')).toHaveValue('195.5');
  });

  test('the safe zone and the transparent avatar toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#zoneBox')).toBeHidden();
    await page.locator('#zone').check();
    await expect(page.locator('#zoneBox')).toBeVisible();
    await page.locator('#ghost').check();
    await expect(page.locator('#avatarBox')).toHaveCSS('opacity', '0.35');
    await page.locator('#ghost').uncheck();
    await expect(page.locator('#avatarBox')).toHaveCSS('opacity', '1');
  });
});

test.describe('files', () => {
  test('a banner with the right proportions is shown without warning', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bannerFile').setInputFiles(svgFile('banner.svg', 1512, 256));
    await expect(page.locator('#bannerImg')).toHaveAttribute('src', /^blob:/);
    await expect(page.locator('#infos')).toContainText('1512×256 px');
    await expect(page.locator('#infos .warn')).toHaveCount(0);
  });

  test('a banner with other proportions triggers the crop warning', async ({ page }) => {
    await page.goto('/');
    await page.locator('#bannerFile').setInputFiles(svgFile('square.svg', 800, 800));
    await expect(page.locator('#infos')).toContainText('800×800 px');
    await expect(page.locator('#infos .warn')).toBeVisible();
    await expect(page.locator('#infos .warn')).toContainText('LinkedIn will crop');
  });

  test('the loaded banner survives a view change and is judged against the new view', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#bannerFile').setInputFiles(svgFile('page.svg', 1512, 256));
    await page.locator('#mode').selectOption('profil-desktop');
    await expect(page.locator('#bannerImg')).toHaveAttribute('src', /^blob:/);
    await expect(page.locator('#infos .warn')).toBeVisible();
  });

  test('an avatar replaces the initial, and the name no longer changes it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#avatarInner')).toHaveText('Y');
    await page.locator('#avatarFile').setInputFiles(svgFile('avatar.svg', 300, 300));
    await expect(page.locator('#avatarInner img')).toBeVisible();
    await page.locator('#name').fill('Zed');
    await expect(page.locator('#avatarInner img')).toBeVisible();
  });
});

test.describe('name and tagline', () => {
  test('the avatar initial and the preview follow the name', async ({ page }) => {
    await page.goto('/');
    await page.locator('#name').fill('  marie');
    await expect(page.locator('#nameOut')).toHaveText('  marie');
    await expect(page.locator('#avatarInner')).toHaveText('M');
    await page.locator('#tagline').fill('Hello');
    await expect(page.locator('#tagOut')).toHaveText('Hello');
  });

  test('an empty name falls back to "?"', async ({ page }) => {
    await page.goto('/');
    await page.locator('#name').fill('');
    await expect(page.locator('#avatarInner')).toHaveText('?');
  });
});

test.describe('language', () => {
  test('switching to French translates the whole interface', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lang').selectOption('fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page).toHaveTitle('Aperçu de bannière LinkedIn');
    await expect(page.locator('label:has(#mode) span')).toHaveText('Affichage');
    await expect(page.locator('#reset')).toHaveText('Valeurs par défaut');
    await expect(page.locator('.btns span').first()).toHaveText('+ Suivre');
    await expect(page.locator('#infos')).toContainText('Bannière affichée à');
    await expect(page.locator('.note')).toContainText('estimations');
  });

  test('the choice is remembered after a reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lang').selectOption('fr');
    await page.reload();
    await expect(page.locator('#lang')).toHaveValue('fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('?lang overrides the saved choice, without replacing it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lang').selectOption('fr');
    await page.goto('/?lang=en');
    await expect(page.locator('#lang')).toHaveValue('en');
    expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('fr');
  });

  test('an unsupported ?lang is ignored', async ({ page }) => {
    await page.goto('/?lang=de');
    await expect(page.locator('#lang')).toHaveValue('en');
  });

  test('the dynamic texts are translated too, including the placeholder banner', async ({
    page,
  }) => {
    await page.goto('/?mode=page-mobile&lang=fr');
    await expect(page.locator('#infos i')).toContainText('MESURÉ');
    const src = await page.locator('#bannerImg').getAttribute('src');
    expect(decodeURIComponent(src ?? '')).toContain('Chargez votre bannière');
  });

  test('default name and tagline follow the language until they are edited', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lang').selectOption('fr');
    await expect(page.locator('#name')).toHaveValue('Votre nom');
    await expect(page.locator('#tagline')).toHaveValue('Votre slogan ici');

    await page.locator('#name').fill('Marie');
    await page.locator('#lang').selectOption('en');
    await expect(page.locator('#name')).toHaveValue('Marie');
    await expect(page.locator('#tagline')).toHaveValue('Your tagline here');
  });

  test('the browser language is used when nothing else is set', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('#lang')).toHaveValue('fr');
    await context.close();
  });
});

test.describe('responsive', () => {
  test('the frame is scaled down to fit a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    const scale = Number(await page.locator('#fit').getAttribute('data-scale'));
    expect(scale).toBeLessThan(1);
    expect(scale).toBeGreaterThan(0.3);
    await expect(page.locator('#infos')).toContainText(`${Math.round(scale * 100)} %`);
  });

  test('no scaling on a wide viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#fit')).toHaveAttribute('data-scale', '1');
  });
});
