/* eslint-disable */

import { fontSplit } from '@konghayao/cn-font-split';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function splitFonts() {
  console.log('Splitting LXGW Neo XiHei...');
  await fontSplit({
    FontPath: join(rootDir, 'fonts/LXGWNeoXiHei.ttf'),
    destFold: join(rootDir, 'public/fonts/lxgw-neo-xihei'),
    chunkSize: 70 * 1024, // 70KB per chunk
    testHTML: false,
    reporter: false,
    css: {
      fontFamily: 'LXGW Neo XiHei',
      fontWeight: 400,
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
  });
  console.log('LXGW Neo XiHei split complete!');

  console.log('Splitting GenRyuMin2 TC...');
  await fontSplit({
    FontPath: join(rootDir, 'fonts/GenRyuMin2TC-R.otf'),
    destFold: join(rootDir, 'public/fonts/genryumin'),
    chunkSize: 70 * 1024, // 70KB per chunk
    testHTML: false,
    reporter: false,
    css: {
      fontFamily: 'GenRyuMin2 TC',
      fontWeight: 400,
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
  });
  console.log('GenRyuMin2 TC split complete!');

  console.log('All fonts split successfully!');
}

splitFonts().catch(console.error);
