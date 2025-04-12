import { Context } from 'hono';
import { Env } from '@/types';
import { Resend } from 'resend';
import { KVNamespace } from '@cloudflare/workers-types';
import Subscribe from '@/emails/Subscribe';

export class SubscriptionHandler {
  private kv: KVNamespace;
  private resend: Resend;

  constructor(env: Env) {
    this.kv = env.subscription;
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async subscribe(c: Context): Promise<Response> {
    try {
      const { email, name, locale } = await c.req.json();

      const token = crypto.randomUUID();
      const confirmationLink = `${c.env.BASE_URL}/subscription/confirmation?token=${token}`;

      await this.kv.put(
        `subscription:${token}`,
        JSON.stringify({ email, name, locale }),
        { expirationTtl: 900 },
      );

      const emailReact = Subscribe({
        firstName: name,
        locale: locale as 'zh-cn' | 'en' | 'zh-tw',
        url: confirmationLink,
      });

      await this.resend.emails.send({
        from: c.env.RESEND_FROM,
        to: email,
        subject: 'Confirm your subscription',
        react: emailReact,
      });

      return c.json({ message: 'Confirmation email sent' });
    } catch (error) {
      console.error('Error in subscription:', error);
      return c.json({ error: 'Failed to subscribe' }, 500);
    }
  }

  async confirm(c: Context): Promise<Response> {
    const token = c.req.query('token');
    if (!token) {
      return c.json({ error: 'Missing token' }, 400);
    }

    const data = await this.kv.get(`subscription:${token}`);
    if (!data) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }

    const { email, name, locale } = JSON.parse(data);

    const contact = await this.resend.contacts.create({
      email,
      firstName: name,
      lastName: locale, // Using lastName field to store locale
      audienceId: c.env.RESEND_AUDIENCE_ID,
    });

    if (!contact.data) {
      return c.json({ error: 'Failed to create contact' }, 500);
    }

    await this.resend.contacts.update({
      id: contact.data.id,
      audienceId: c.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    })

    await this.kv.delete(`subscription:${token}`);

    return Response.redirect(`${c.env.WEBSITE_BASE_URL}/${locale}/subscription/done`);
  }
}
