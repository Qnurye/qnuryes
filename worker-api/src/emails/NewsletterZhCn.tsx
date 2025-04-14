import React from 'react';
import Newsletter, { NewsletterProps } from '@/emails/Newsletter';

export const NewsletterZhCn = (props: NewsletterProps): React.ReactElement => (
  <Newsletter {...props} />
)

export default NewsletterZhCn;

NewsletterZhCn.PreviewProps = {
  issue: '202504',
  posts: [
    {
      id: 'tomb',
      title: '数字坟墓',
      description: 'Lorem ipsum *dolor sit amet*, consectetur adipiscing elit.'
        + ' 这是一段用于占位的文本，通常用于设计和排版中。它的目的是展示字体、布局和设计效果，而不涉及实际内容。',
      created_at: new Date('2025-04-01T00:32:00.000Z'),
      updated_at: new Date('2025-04-01T14:58:03.000Z'),
      tags: ['foo', 'bar'],
      content: `# 第一段
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 这是一段用于占位的文本，通常用于设计和排版中。它的目的是展示字体、布局和设计效果，而不涉及实际内容。

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

`,
    },
    {
      id: 'terms',
      title: '用户协议和隐私政策',
      description: '使用本网站前，请仔细阅读以下用户协议和隐私政策。',
      created_at: new Date('2025-04-01T00:00:00.000Z'),
      updated_at: new Date('2025-04-01T00:00:03.000Z'),
      tags: [],
      content: `# 第一段
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 这是一段用于占位的文本，通常用于设计和排版中。它的目的是展示字体、布局和设计效果，而不涉及实际内容。

# 第二段
在设计过程中，Lorem Ipsum 是一种常见的工具。它帮助设计师专注于视觉效果，而不是被内容分散注意力。通过使用这种占位文本，可以更好地评估设计的整体效果。
`,
    },
  ],
  locale: 'zh-cn',
  baseUrl: 'https://qnury.es/',
}
