#!/usr/bin/env node
/**
 * socialjet — SocialJet add-on CLI.
 *
 *   socialjet create <dir> [--title "My Addon"] [--sdk <spec>] [--no-install] [--no-git]
 *   socialjet update [--ref <tag>] [--sdk <spec>] [--dry-run] [--no-install]
 *
 * Run it without installing: npx github:yusifmov/socialjet-sdk create my-addon
 */
import {execFileSync, spawnSync} from "node:child_process";
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const SDK_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SDK_PKG = readJson(path.join(SDK_ROOT, 'package.json'));
const REPO = SDK_PKG.socialjet.repository;
const SDK_NAME = SDK_PKG.name;
const DEFAULT_SDK_SPEC = `github:${REPO}#v${SDK_PKG.version}`;
const isWindows = process.platform === 'win32';

// ---------- tiny helpers ----------

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function parseArgs(argv) {
    const args = {_: []};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--no-')) {
            args[a.slice(5)] = false;
        } else if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next === undefined || next.startsWith('--')) {
                args[key] = true;
            } else {
                args[key] = next;
                i++;
            }
        } else {
            args._.push(a);
        }
    }
    return args;
}

function fail(message) {
    console.error(`\n  \x1b[31m✖\x1b[0m ${message}\n`);
    process.exit(1);
}

function info(message) {
    console.log(`  \x1b[36m›\x1b[0m ${message}`);
}

function run(cmd, args, cwd) {
    info(`${cmd} ${args.join(' ')}`);
    const res = spawnSync(cmd, args, {cwd, stdio: 'inherit', shell: isWindows});
    if (res.status !== 0) fail(`\`${cmd} ${args.join(' ')}\` failed.`);
}

const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const toTitle = slug => slug.split('-').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

/** The newest `vX.Y.Z` tag of the SDK repository. */
function latestSdkTag() {
    let out;
    try {
        out = execFileSync('git', ['ls-remote', '--tags', '--refs', `https://github.com/${REPO}.git`], {encoding: 'utf8'});
    } catch {
        fail(`Could not list tags of github.com/${REPO}. Pass --ref <tag> or --sdk <spec>.`);
    }
    const tags = out.split('\n')
        .map(l => l.split('refs/tags/')[1])
        .filter(t => t && /^v\d+\.\d+\.\d+$/.test(t))
        .sort((a, b) => {
            const pa = a.slice(1).split('.').map(Number), pb = b.slice(1).split('.').map(Number);
            return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
        });
    if (!tags.length) fail(`No vX.Y.Z tags found on github.com/${REPO}.`);
    return tags[tags.length - 1];
}

/**
 * Puts the shared package versions from the SDK's shared-deps.json into package.json.
 * A package already listed under `dependencies` is updated there (the host app bundles
 * them); everything else goes to `devDependencies` (an add-on only needs them to build,
 * the plugin provides them at runtime). Returns the list of changes.
 */
function applySharedDeps(pkg, shared) {
    const changes = [];
    pkg.devDependencies ??= {};
    for (const [name, version] of Object.entries({...shared.runtime, ...shared.dev})) {
        const section = pkg.dependencies?.[name] !== undefined ? 'dependencies' : 'devDependencies';
        const before = pkg[section][name];
        if (before !== version) {
            pkg[section][name] = version;
            changes.push(`${section}.${name}: ${before ?? '(none)'} → ${version}`);
        }
    }
    return changes;
}

// ---------- commands ----------

function create(args) {
    const target = args._[1];
    if (!target) fail('Usage: socialjet create <dir> [--title "My Addon"]');

    const dir = path.resolve(target);
    if (existsSync(dir) && readdirSync(dir).length) fail(`${dir} already exists and is not empty.`);

    const slug = toSlug(path.basename(dir));
    if (!slug) fail('Pick a directory name with letters or digits.');
    const title = typeof args.title === 'string' ? args.title : toTitle(slug);
    const sdkSpec = typeof args.sdk === 'string' ? args.sdk : DEFAULT_SDK_SPEC;

    const vars = {
        SLUG: slug,
        TITLE: title,
        PHP_PREFIX: slug.replace(/-/g, '_'),
        PHP_CONST: slug.replace(/-/g, '_').toUpperCase(),
        SDK_VERSION: SDK_PKG.version,
    };

    console.log(`\n  Creating SocialJet add-on \x1b[1m${title}\x1b[0m in ${dir}\n`);
    mkdirSync(dir, {recursive: true});
    cpSync(path.join(SDK_ROOT, 'templates', 'addon'), dir, {recursive: true});

    // Fill placeholders and rename template files (npm drops dot-files like .gitignore from packages).
    const walk = d => {
        for (const name of readdirSync(d)) {
            const file = path.join(d, name);
            if (statSync(file).isDirectory()) {
                walk(file);
                continue;
            }
            const text = readFileSync(file, 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => vars[k] ?? m);
            writeFileSync(file, text);
            const renamed = name.replace('__SLUG__', slug).replace(/^_gitignore$/, '.gitignore');
            if (renamed !== name) renameSync(file, path.join(d, renamed));
        }
    };
    walk(dir);

    const shared = readJson(path.join(SDK_ROOT, 'shared-deps.json'));
    const pkg = {
        name: slug,
        version: '0.1.0',
        private: true,
        description: `${title} — a SocialJet add-on`,
        type: 'module',
        scripts: {
            dev: 'vite build --watch',
            build: 'tsc --noEmit && vite build',
            typecheck: 'tsc --noEmit',
            'socialjet:update': 'socialjet update',
        },
        dependencies: {[SDK_NAME]: sdkSpec},
        devDependencies: {},
    };
    applySharedDeps(pkg, shared);
    writeJson(path.join(dir, 'package.json'), pkg);

    if (args.git !== false) {
        try {
            execFileSync('git', ['init', '-q', '-b', 'main'], {cwd: dir});
            info('git init');
        } catch {
            info('git not found — skipped git init');
        }
    }

    if (args.install !== false) run('npm', ['install'], dir);

    console.log(`
  \x1b[32m✔\x1b[0m Done. Next:

    cd ${path.relative(process.cwd(), dir) || '.'}
    npm run dev        # rebuilds build/index.js on every change

  Put (or symlink) the folder into wp-content/plugins/, activate "${title}",
  and open the SocialJet admin page. Keep dependencies in sync with:

    npx socialjet update
`);
}

function update(args) {
    const dir = process.cwd();
    const pkgFile = path.join(dir, 'package.json');
    if (!existsSync(pkgFile)) fail('Run this inside an add-on (no package.json here).');

    const pkg = readJson(pkgFile);
    const section = pkg.dependencies?.[SDK_NAME] !== undefined ? 'dependencies' : 'devDependencies';
    const current = pkg[section]?.[SDK_NAME];
    if (current === undefined) fail(`${SDK_NAME} is not a dependency of this package.`);

    let spec = current;
    if (typeof args.sdk === 'string') {
        spec = args.sdk;
    } else if (typeof args.ref === 'string') {
        spec = `github:${REPO}#${args.ref}`;
    } else if (current.startsWith('github:') || current.startsWith(`git+`)) {
        spec = `github:${REPO}#${latestSdkTag()}`;
    } else {
        info(`${SDK_NAME} is "${current}" — keeping it (pass --ref or --sdk to change).`);
    }

    const dry = args['dry-run'] === true;
    const changes = [];

    if (spec !== current) {
        changes.push(`${section}.${SDK_NAME}: ${current} → ${spec}`);
        if (!dry) {
            pkg[section][SDK_NAME] = spec;
            writeJson(pkgFile, pkg);
            if (args.install !== false) run('npm', ['install'], dir);
        }
    }

    // Read the shared versions from the SDK that is now installed.
    const sharedFile = path.join(dir, 'node_modules', ...SDK_NAME.split('/'), 'shared-deps.json');
    const shared = existsSync(sharedFile) ? readJson(sharedFile) : readJson(path.join(SDK_ROOT, 'shared-deps.json'));
    const fresh = readJson(pkgFile);
    const depChanges = applySharedDeps(fresh, shared);
    changes.push(...depChanges);

    if (!changes.length) {
        console.log('\n  \x1b[32m✔\x1b[0m Already up to date.\n');
        return;
    }

    console.log(`\n  ${dry ? 'Would change' : 'Changed'}:\n`);
    for (const c of changes) console.log(`    ${c}`);
    console.log('');

    if (!dry && depChanges.length) {
        writeJson(pkgFile, fresh);
        if (args.install !== false) run('npm', ['install'], dir);
    }
}

function help() {
    console.log(`
  socialjet ${SDK_PKG.version}

  socialjet create <dir> [--title "My Addon"] [--sdk <spec>] [--no-install] [--no-git]
      Scaffold a SocialJet add-on (a WordPress plugin + Vite/React UI module).

  socialjet update [--ref <tag>] [--sdk <spec>] [--dry-run] [--no-install]
      Move ${SDK_NAME} to the latest release (or --ref) and sync React/antd/Vite
      versions with what the SocialJet plugin provides.
`);
}

const args = parseArgs(process.argv.slice(2));
const commands = {create, update, help};
(commands[args._[0]] ?? help)(args);
