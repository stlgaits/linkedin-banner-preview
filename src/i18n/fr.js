/** @type {Record<string, string>} */
export default {
  title: 'Aperçu de bannière LinkedIn',
  language: 'Langue',
  view: 'Affichage',
  'mode.page-desktop': 'Page entreprise – ordinateur',
  'mode.page-mobile': 'Page entreprise – mobile (mesuré)',
  'mode.profil-desktop': 'Profil – ordinateur',
  'mode.profil-mobile': 'Profil – mobile',
  banner: 'Votre bannière',
  avatar: 'Votre avatar (optionnel)',
  name: 'Nom',
  tagline: 'Slogan',
  zone: 'Montrer la zone à éviter',
  ghost: 'Avatar transparent',
  bh: 'Hauteur bannière',
  as: 'Taille avatar',
  al: 'Décalage gauche',
  ao: 'Chevauchement bannière',
  am: 'Marge sécurité',
  reset: 'Valeurs par défaut',
  meta: "Secteur d'activité · Ville, Pays · 11-50 employés",
  follow: '+ Suivre',
  visit: 'Visiter le site web',
  defName: 'Votre nom',
  defTagline: 'Votre slogan ici',
  upload: 'Chargez votre bannière ({w}×{h})',
  info: 'Bannière affichée à <b>{bw}×{bh} px</b> (image recommandée par LinkedIn : <b>{rec}</b>) · votre image : <b>{nw}×{nh} px</b>',
  warn: "⚠ proportions différentes : LinkedIn recadrera l'image",
  zoom: "zoom d'affichage : {z} %",
  footer:
    "<b>Important :</b> les dimensions d'affichage de LinkedIn (taille et position de l'avatar, hauteur de bannière) sont des <b>estimations</b> et peuvent changer. Comparez avec une capture de votre vraie page, et ajustez les réglages ci-dessus jusqu'à ce que l'avatar tombe au même endroit : la zone rouge vous montre alors ce qui sera caché. Rien n'est envoyé nulle part : tout reste dans votre navigateur.",
  'note.page-desktop':
    'Mesures tierces (web public) : bannière 782×134, logo 128 px. Décalage et chevauchement du logo : déduits, fiabilité faible à moyenne.',
  'note.page-mobile':
    "MESURÉ sur une capture de l'app mobile (écran 1080 px de large, ramené à 428 px) : logo 99 px cadre blanc compris, à 13 px du bord, 34 px sur la bannière. La hauteur de bannière (73 px) est déduite du format 5,9:1 : le haut de la bannière était transparent sur la capture.",
  'note.profil-desktop':
    "Mesures tierces (web public) : bannière 782×195,5, avatar rond 128 px, à 32 px du bord, 68 px sur la bannière. Une autre source donne un avatar d'environ 152 px.",
  'note.profil-mobile':
    "Mesure tierce sur le web mobile (viewport 430 px) : avatar rond 128 px, à 24 px du bord, 76 px sur la bannière. Pas de mesure fiable pour l'app native : à valider sur votre téléphone.",
};
