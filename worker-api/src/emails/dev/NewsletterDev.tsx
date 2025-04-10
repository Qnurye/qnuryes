import Newsletter from '@/emails/Newsletter';
import React from 'react';

export const NewsletterDev = (): React.ReactElement => (
  <Newsletter
    issue="202504"
    posts={[
      {
        id: 'en/tomb',
        title: 'Digital Tombstone',
        description: '**In youth,** everything seems so close—that is the future. In old age, everything seems so'
          + ' distant—that is the past.',
        created_at: new Date('2025-04-01T00:32:00.000Z'),
        updated_at: new Date('2025-04-01T14:58:03.000Z'),
        tags: ['foo', 'bar'],
        content: 'Growth and aging are two inevitable things that are causally related. Beyond the many nights of'
          + ' insomnia due to embarrassing past events, I also occasionally marvel at how great my past self was.'
          + ' Whether good or bad, events either feel like they happened just yesterday or as if they belonged to a'
          + ' different century. When I flip through an old notebook from middle school, the author feels like'
          + ' another buried version of myself. I am proud of who I am today and comforted by who I used to be. The'
          + ' evidence left behind in organic matter and hard drives has contributed to my being. I treat this'
          + ' place as my tombstone, writing eulogies for the past that has been buried. You, as a visitor, may'
          + ' silently mourn for a part of me that has died, and then celebrate with me the rebirth of another'
          + ' part.\n\nThinking and output happen simultaneously.\nPerhaps our brains also function as Next Token'
          + ' Prediction,\nwhich might explain the concept of output-driven learning. However, the decline of'
          + ' imagination\nand the loss of expressive desire are occurring at an age that doesn’t seem quite right'
          + ' for me.\nI will share some of my interesting thoughts here to motivate myself to keep thinking and'
          + ' progressing.\nYou can subscribe to my death knell via RSS or a monthly newsletter to stay updated on'
          + ' my latest activities.\nMeanwhile, please carefully read our [terms of service and privacy'
          + ' policy](/en/blog/terms).',
      },
      {
        id: 'en/terms',
        title: 'Terms of Service & Privacy Policy',
        description: 'Read the following terms of service and privacy policy carefully before using this site.',
        created_at: new Date('2025-04-01T00:00:00.000Z'),
        updated_at: new Date('2025-04-01T00:00:03.000Z'),
        tags: [],
        content: '1. **Content Disclaimer**\n    - The content published on this site does not reference or imply'
          + ' any real-life individuals or events. Any resemblance is purely coincidental. Any controversial'
          + ' content is purely subjective speculation by users.\n    - If you believe this site’s content'
          + ' infringes on your legal rights, please contact us via email'
          + ' ([contact@qnury.es](mailto:contact@qnury.es)), and we will verify and process it within **7 working'
          + ' days**.\n2. **Access Restrictions**\n    - This site’s servers are not located in mainland China and'
          + ' have not undergone ICP registration. According to the "Regulations on Internet Information Services of'
          + ' the People\'s Republic of China," this site should not be accessed within mainland China’s network'
          + ' environment.\n    - Accessing this site may involve **cross-border data transmission**. Users should'
          + ' evaluate the associated risks and decide whether to proceed at their own discretion.\n3. **User Data &'
          + ' Privacy**\n    - This site does not actively collect sensitive user information, nor does it share any'
          + ' private user data with third parties in any form.\n    - When accessing this site, the system may'
          + ' automatically record and securely store your **IP address, browser information**, and any **email'
          + ' addresses** you voluntarily submit for security analysis and service optimization.\n    - This site may'
          + ' use **third-party services (such as Cloudflare, Vercel)**, which may collect certain user data. Please'
          + ' refer to the respective service providers’ privacy policies for details.\n4. **Data Deletion'
          + ' Requests**\n    - Users may request the deletion of their personal data, including **comments, account'
          + ' information, etc.** We will process such requests within **7 working days** and notify you of the'
          + ' outcome.\n    - Request method: Please contact us via email'
          + ' **[contact@qnury.es](mailto:contact@qnury.es)** and provide relevant proof.\n    - To maintain the'
          + ' integrity of the site, some data may not be completely deleted but can be anonymized.\n5. **User Conduct'
          + ' Guidelines**\n    - By accessing this site, users agree to bear any **legal responsibilities** and'
          + ' refrain from publishing illegal, inappropriate, or harmful content on this site.\n    - **The following'
          + ' actions are prohibited:**\n        - Spreading hate speech, violence, pornography, or privacy-infringing'
          + ' content\n        - Using this site for cyberattacks, phishing, or spam dissemination\n        - Any'
          + ' actions that violate applicable laws and regulations\n6. **Liability Disclaimer**\n    - All content on'
          + ' this site (including AI-generated content) is for reference only and does not constitute any **legal,'
          + ' medical, financial, investment, or professional advice**.\n    - This site is not responsible for any'
          + ' **direct or indirect losses** caused by accessing or using the site’s content.\n    - Access to this'
          + ' site is subject to network, technical, and policy factors. We do not guarantee the **availability,'
          + ' stability, or continuity** of the service.',
      },
    ]}
    locale="en"
  />
);

export default NewsletterDev;
