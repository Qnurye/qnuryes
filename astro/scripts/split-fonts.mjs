/* eslint-disable */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontSplit } from '@konghayao/cn-font-split';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function splitFonts() {
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
}

splitFonts().catch(console.error);
