import * as fs from 'fs/promises';
import * as path from 'path';
import * as TOML from '@iarna/toml';

/**
 * Vite plugin to pre-process TOML files into JSON during build
 */
export function tomlI18n(): { name: string, buildStart(): Promise<void> } {
  return {
    name: 'toml-i18n',

    async buildStart(): Promise<void> {
      // Directory paths
      const tomlDir = path.resolve(process.cwd(), 'src/i18n/messages');
      const outputDir = path.resolve(process.cwd(), 'src/i18n/compiled');

      try {
        await fs.mkdir(outputDir, { recursive: true });

        const files = await fs.readdir(tomlDir);
        const tomlFiles = files.filter(file => file.endsWith('.toml'));

        for (const file of tomlFiles) {
          const filePath = path.join(tomlDir, file);
          const content = await fs.readFile(filePath, 'utf-8');

          const parsed = TOML.parse(content);
          const jsonContent = JSON.stringify(parsed, null, 2);

          const outputPath = path.join(outputDir, file.replace('.toml', '.json'));
          await fs.writeFile(outputPath, jsonContent);
        }
      } catch (error) {
        console.error('Error processing TOML files:', error);
      }
    },
  };
}
