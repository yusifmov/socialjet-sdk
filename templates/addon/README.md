# {{TITLE}}

A [SocialJet](https://wordpress.org/plugins/socialjet/) add-on, created with `@socialjet/sdk` {{SDK_VERSION}}.

It is a normal WordPress plugin (`{{SLUG}}.php`) plus a UI module (`src/` → `build/index.js`)
that SocialJet loads into its admin screen through the `socialjet_views` filter.

## Develop

```bash
npm install
npm run dev
```

`npm run dev` rebuilds `build/index.js` on every change; reload the SocialJet admin page to see it.
Put this folder (or a symlink to it) into `wp-content/plugins/` and activate **{{TITLE}}**.

React, antd and dayjs are **not** bundled — SocialJet provides one shared copy at runtime.
Import them normally (`import {Button} from 'antd'`), never from deep paths like `antd/es/...`.

## Release

```bash
npm run build
```

Ship the plugin folder with `build/`; `node_modules/` and `src/` aren't needed at runtime.

## Keep up with SocialJet

```bash
npx socialjet update            # latest SDK release + matching React/antd/Vite versions
npx socialjet update --dry-run  # just show what would change
npx socialjet update --ref v1.0.11
```
