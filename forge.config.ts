import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: 'model2API'
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        bin: 'model2API'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: 'model2API',
        options: {
          icon: path.join(process.cwd(), 'main', 'build', 'icon.png'),
        },
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: 'Electron Starter',
        icon: path.join(process.cwd(), 'main', 'build', 'icon.png'),
      }
    }
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
