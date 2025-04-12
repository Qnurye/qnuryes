import { Font } from '@react-email/components';
import React from 'react';

export const Fonts = (): React.ReactElement => (
  <>

    <Font
      fontFamily="Maple Mono"
      fallbackFontFamily="monospace"
      webFont={{
        url: 'https://cdn.jsdelivr.net/fontsource/fonts/maple-mono@latest/latin-400-normal.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="normal"
    />
    <Font
      fontFamily="Arvo"
      fallbackFontFamily="serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/arvo/v22/tDbD2oWUg0MKqScQ7Z7o_vo.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="normal"
    />
    <Font
      fontFamily="Arvo"
      fallbackFontFamily="serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/arvo/v22/tDbM2oWUg0MKoZw1-LPK89D4hAA.woff2',
        format: 'woff2',
      }}
      fontWeight={700}
      fontStyle="normal"
    />
    <Font
      fontFamily="Arvo"
      fallbackFontFamily="serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/arvo/v22/tDbN2oWUg0MKqSIg75Tv3PjyjA.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="italic"
    />
    <Font
      fontFamily="Arvo"
      fallbackFontFamily="serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/arvo/v22/tDbO2oWUg0MKqSIoVLH68dr_pgL0Gw.woff2',
        format: 'woff2',
      }}
      fontWeight={700}
      fontStyle="italic"
    />
    <Font
      fontFamily="Nunito"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/nunito/v26/XRXV3I6Li01BKofINeaBTMnFcQ.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="normal"
    />
    <Font
      fontFamily="Nunito"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: 'https://fonts.gstatic.cn/s/nunito/v26/XRXX3I6Li01BKofIMNaDRs7nczIH.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="italic"
    />
  </>
)

export default Fonts;
