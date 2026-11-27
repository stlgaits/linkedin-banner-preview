/** English is the reference: its keys define `MessageKey`, every other language must match. */
const en = {
  title: 'LinkedIn Banner Preview',
  language: 'Language',
  view: 'View',
  'mode.page-desktop': 'Company page – desktop',
  'mode.page-mobile': 'Company page – mobile (measured)',
  'mode.profil-desktop': 'Profile – desktop',
  'mode.profil-mobile': 'Profile – mobile',
  banner: 'Your banner',
  avatar: 'Your avatar (optional)',
  name: 'Name',
  tagline: 'Tagline',
  zone: 'Show the area to avoid',
  ghost: 'Transparent avatar',
  bh: 'Banner height',
  as: 'Avatar size',
  al: 'Left offset',
  ao: 'Banner overlap',
  am: 'Safety margin',
  reset: 'Reset to defaults',
  meta: 'Industry · City, Country · 11-50 employees',
  follow: '+ Follow',
  visit: 'Visit website',
  defName: 'Your name',
  defTagline: 'Your tagline here',
  upload: 'Upload your banner ({w}×{h})',
  info: 'Banner displayed at <b>{bw}×{bh} px</b> (image size recommended by LinkedIn: <b>{rec}</b>) · your image: <b>{nw}×{nh} px</b>',
  warn: '⚠ different proportions: LinkedIn will crop the image',
  zoom: 'display zoom: {z} %',
  footer:
    "<b>Important:</b> LinkedIn's display dimensions (avatar size and position, banner height) are <b>estimates</b> and may change. Compare with a screenshot of your real page and adjust the settings above until the avatar lands in the same spot: the red zone then shows what will be hidden. Nothing is uploaded anywhere: everything stays in your browser.",
  'note.page-desktop':
    'Third-party measurements (public web): banner 782×134, logo 128 px. Logo offset and overlap are inferred, low to medium reliability.',
  'note.page-mobile':
    'MEASURED on a screenshot of the mobile app (1080 px wide screen, scaled to 428 px): 99 px logo including the white frame, 13 px from the edge, 34 px over the banner. Banner height (73 px) is inferred from the 5.9:1 ratio: the top of the banner was transparent in the screenshot.',
  'note.profil-desktop':
    'Third-party measurements (public web): banner 782×195.5, round 128 px avatar, 32 px from the edge, 68 px over the banner. Another source gives an avatar of about 152 px.',
  'note.profil-mobile':
    'Third-party measurement on mobile web (430 px viewport): round 128 px avatar, 24 px from the edge, 76 px over the banner. No reliable measurement for the native app: check on your phone.',
};

export default en;
export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
