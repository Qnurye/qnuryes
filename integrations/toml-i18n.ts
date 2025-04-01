import * as fs from 'fs/promises';
import * as path from 'path';
import * as TOML from '@iarna/toml';
import type { AstroIntegration } from 'astro';

function isPathUnderDir(pathToCheck: string, dir: string): boolean {
  const relativePath = path.relative(dir, pathToCheck);
  return <boolean>(relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

/**
 * Astro integration to pre-process TOML i18n files into JSON with hot reload support
 */
export default function tomlI18n(): AstroIntegration {
  // Directory paths
  const tomlDir = path.resolve(process.cwd(), 'src/i18n/messages');
  const outputDir = path.resolve(process.cwd(), 'src/i18n/compiled');

  // Function to process a single TOML file
  async function processTomlFile(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf-8');

      const parsed = TOML.parse(content);
      const jsonContent = JSON.stringify(parsed, null, 2);

      const outputPath = path.join(outputDir, fileName.replace('.toml', '.json'));
      await fs.writeFile(outputPath, jsonContent);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  // Function to process all TOML files in the directory
  async function processAllTomlFiles(): Promise<void> {
    try {
      await fs.mkdir(outputDir, { recursive: true });

      const files = await fs.readdir(tomlDir);
      const tomlFiles = files.filter(file => file.endsWith('.toml'));

      for (const file of tomlFiles) {
        const filePath = path.join(tomlDir, file);
        await processTomlFile(filePath);
      }
    } catch (error) {
      console.error('Error processing TOML files:', error);
    }
  }

  return {
    name: 'toml-i18n',
    hooks: {
      'astro:config:setup': async ({ logger }): Promise<void> => {
        await processAllTomlFiles();
        logger.info('built');
      },

      'astro:server:setup': ({ server, logger }): void => {
        if (server.config.mode !== 'development') {
          return;
        }
        server.watcher
          .on('add', (path) => {
            if (isPathUnderDir(path, tomlDir)) {
              processTomlFile(path).then(() => {
                server.ws.send({ type: 'full-reload', path: '*' })
              });
              logger.info(`loaded: ${path}`);
            }
          },
          )
          .on('change', (path) => {
            if (isPathUnderDir(path, tomlDir)) {
              processTomlFile(path).then(() => {
                server.ws.send({ type: 'full-reload', path: '*' })
              });
              logger.info(`reloaded: ${path}`);
            }
          },
          );
      },
    },
  };
}
