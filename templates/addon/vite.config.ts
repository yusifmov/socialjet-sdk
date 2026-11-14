import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {defineAddonConfig} from '@socialjet/sdk/vite';

// React, antd and dayjs are NOT bundled: the SocialJet plugin provides them at runtime.
export default defineConfig(defineAddonConfig({
    entries: {index: 'src/index.tsx'},
    plugins: [react()],
}));
