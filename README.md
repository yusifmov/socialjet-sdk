# @socialjet/sdk

Build UI add-ons for [SocialJet](https://wordpress.org/plugins/socialjet/), the WordPress plugin that auto-shares posts to social networks.

An add-on is a normal WordPress plugin that ships an ES module. SocialJet loads that module into its admin screen. Through the registry, the module can add sidebar pages, settings, social account providers and post-text tags.

## Create an add-on

```bash
npx github:yusifmov/socialjet-sdk create my-addon
cd my-addon
npm run dev
```

Copy or symlink `my-addon/` into `wp-content/plugins/`, activate it, and open the SocialJet admin page.

## Keep it up to date

Run this inside the add-on:

```bash
npx socialjet update             # latest SDK tag + matching React/antd/Vite versions
npx socialjet update --dry-run   # only show what would change
npx socialjet update --ref v1.0.11
```

The SDK's version follows the SocialJet plugin's version. Tag `v1.0.11` matches plugin 1.0.11.

## How it fits together

```
WordPress admin page (SocialJet)
├── @socialjet/shared/react, react-dom, antd, dayjs …  ← one copy, served by the plugin (import map)
├── socialjet.js   host app: installs the registry on window.SocialJet
├── app.js         built-in providers (Facebook, LinkedIn, …), registered through this SDK
├── <your add-on>  registered through the `socialjet_views` PHP filter
└── menu.js        renders everything that was registered
```

- **Shared packages.** These come from the plugin and are never bundled: `react`, `react-dom`, `react/jsx-runtime`, `antd`, `@ant-design/cssinjs` and `dayjs`. The Vite preset (`@socialjet/sdk/vite`) rewrites their imports to `@socialjet/shared/*`. Import them as usual (`import {Button} from 'antd'`). Never use deep imports such as `antd/es/...`, which the build rejects.
- **One registry.** `sj` proxies to `window.SocialJet`. `register*` calls made before the host has loaded are queued and replayed.

## API

| Export | What it is |
|---|---|
| `sj` | The registry: `registerMenuItem`, `registerSettingsProvider`, `registerSettingsItem`, `registerAccountProvider`, `registerPostTag`, and their getters. |
| `apiFetch(endpoint, body)` / `useApi()` | Calls `socialjet/...` REST routes. All routes are POST and need `manage_options`. |
| `createAccountProvider({...})` | Builds a social network provider: icon, auth modal, account-type labels and supported settings. |
| `createPostTemplateSetting({...})`, `STANDARD_POST_TEMPLATES` | The per-account "post template" selector. Its key is `social_post_settings:<provider>_post_template`. |
| `defineSettingsItem`, `settingKey`, `SETTINGS_PROVIDERS`, `SETTINGS_TARGETS`, `POST_TEXT_SETTING_KEY` | Settings helpers, plus the slugs shared with the PHP plugin. |
| `OAuthAppModal` | A ready-made "bring your own app" OAuth connect dialog. |
| `normalizeAccount`, `isAccountExpired` | Fix up account rows from WordPress, where every column is a string. |
| `ErrorBoundary` | Isolates a crashing page. |
| `@socialjet/sdk/vite` → `defineAddonConfig`, `socialjetSharedExternals` | Build configuration for add-ons. |

### Example: a social network provider

```tsx
import {createAccountProvider, createPostTemplateSetting, OAuthAppModal, sj, STANDARD_POST_TEMPLATES} from '@socialjet/sdk';

sj.registerAccountProvider(createAccountProvider({
    slug: 'mastodon',                       // = $account['provider'] in your PHP Hooks::share
    title: 'Mastodon',
    icon: <MastodonIcon/>,
    accountTypes: {account: 'Mastodon account'},
    AuthModal: (props) => (
        <OAuthAppModal {...props}
            title="Add Mastodon account" provider="mastodon" appName="Mastodon"
            callbackUrlEndpoint="socialjet/accounts/mastodon/get_callback_url"
            loginUrlEndpoint="socialjet/accounts/mastodon/get_login_url"
            fields={[
                {name: 'client_id', label: 'Client key'},
                {name: 'client_secret', label: 'Client secret', secret: true},
            ]}/>
    ),
}));

sj.registerSettingsItem(createPostTemplateSetting({
    provider: 'mastodon', networkName: 'Mastodon', templates: STANDARD_POST_TEMPLATES,
}));
```

The PHP side of a provider is covered in the SocialJet plugin's `CLAUDE.md`, under "Adding/Changing a provider".

## Developing the SDK

```bash
npm install
npm run build        # tsc -> dist/ (committed: GitHub installs don't build)
npm run test:create  # scaffold .tmp/demo-addon against this checkout
```

Commit `dist/` together with the source changes. Releases follow the SocialJet release cycle: a `vX.Y.Z` branch merged into `main`, then tagged `vX.Y.Z`.
