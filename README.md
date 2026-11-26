# LinkedIn Banner Preview

A web tool to **preview your LinkedIn banner** before publishing it: see where the avatar or logo covers your image, on a company page or a profile, on desktop or mobile.

![Screenshot](docs/screenshot.png)

## Features

- 4 views: company page and profile, each on desktop and mobile
- Load your own banner and avatar (optional) from disk
- Red safe zone around the avatar: what not to put there
- Transparent avatar to see what it hides
- Editable name and tagline
- Fine-tuning (banner height, avatar size and position, margin) with reset to defaults
- Warning when your image proportions differ from the recommended format
- A single HTML file: no dependencies, no build

## Usage

Open `index.html` in your browser, or use the hosted version if published via GitHub Pages.

**Your images never leave your browser**: nothing is uploaded anywhere.

URL parameters let you share a configuration:

```
index.html?mode=page-mobile&zone=1&ghost=1
```

| Parameter | Values |
|---|---|
| `mode` | `page-desktop`, `page-mobile`, `profil-desktop`, `profil-mobile` |
| `zone` | `1` to show the area to avoid |
| `ghost` | `1` to make the avatar transparent |

## Recommended sizes

| Type | Image size |
|---|---|
| Company page | 1512 × 256 px |
| Profile | 1584 × 396 px |

## ⚠ Measurement accuracy

LinkedIn **does not publish** its exact display dimensions (avatar, banner height). The presets come from third-party published measurements and one measurement on the mobile app. They are **approximate** and may change without notice. Each preset states its source and reliability in the tool.

Compare with a screenshot of your real page and adjust the settings. Measurement corrections are welcome.

## Contributing

Issues and pull requests are welcome, especially to refine the presets (with a source or a screenshot).

## License

[MIT](LICENSE)
