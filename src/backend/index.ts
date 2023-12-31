// /* eslint-disable prefer-const */
// /* eslint-disable no-use-before-define */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-console */
import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { saveConfig, getConfig } from './utils';
import ServicesSafe from './services';
import setupElectronTools from './electron';

try {
  (async () => {
    const mainWindow: BrowserWindow | null = null;

    const settings = await getConfig();
    if (settings.gui) {
      ipcMain.on('start-server', async (event, { port }) => {
        try {
          await startServer(port);

          event.reply('server-status', `Running`, (settings.port = port));

          await saveConfig({
            port,
          });
        } catch (err) {
          console.log(err);
          event.reply('error', err.message);
        }
      });

      ipcMain.on('default-settings', async (event) => {
        try {
          event.reply('default-settings', settings.port);
        } catch (err) {
          console.log(err);
          event.reply('error', err.message);
        }
      });

      ipcMain.setMaxListeners(200);

      ipcMain.on('stop-server', async (event) => {
        await closeServer();
        console.log('Server stopped.');
        event.reply('server-status', 'Stopped');
      });

      ipcMain.on('change-port', async (event, newPort) => {
        await startServer(newPort);
      });

      ipcMain.on('ipc-example', async (event, arg) => {
        const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
        console.log(msgTemplate(arg));
        event.reply('ipc-example', msgTemplate('pong'));
      });

      setupElectronTools(mainWindow);
    } else {
      try {
        (async () => {
          await startServer(settings.port);

          await services.start(settings.starting);
        })();
      } catch (err) {
        process.stdout.write(err.message);
        process.exit();
      }
    }



    const { default: fastify } = await import('fastify');
    const { default: cors } = await import('@fastify/cors');
    const { default: fastifyExpressPlugin } = await import('@fastify/express');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { default: queue } = await import('express-queue');
  


    // Initialize Express
    let serverApp = fastify();

    let queueExpress = queue({
      activeLimit: settings.activeLimit,
      queuedLimit: settings.queuedLimit,
    });

    const services = new ServicesSafe(settings);

    async function initServer(port: number) {
      serverApp = fastify();
      queueExpress = queue({
        activeLimit: settings.activeLimit,
        queuedLimit: settings.queuedLimit,
      });

      await serverApp.register(fastifyExpressPlugin);

      serverApp.use(queueExpress);

      await serverApp.register(cors, {
        // put your options here
        allowedHeaders: '*',
      });

      // serverApp.options('/*', async (_req, reply) => {
      //   return reply.status(200);
      // });

      await services.setupServerApp(serverApp);

      await serverApp.listen({
        port,
      });
    }

    async function closeServer() {
      if (serverApp)  await serverApp.close();
    }

    async function startServer(port: number) {
      await closeServer();
      await initServer(port);

      console.log(`Server Running on port ${port}`);
    }

    services.setupIpc(ipcMain);
 
  })();
} catch (err) {
  process.stdout.write(err.message || err);
}

// process.stdout.write(`\n${tempPath}\n${modelsDir}`);
