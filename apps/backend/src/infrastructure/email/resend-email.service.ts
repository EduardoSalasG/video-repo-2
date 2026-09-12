import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../../application/ports';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      this.logger.warn('Resend no configurado (RESEND_API_KEY / RESEND_FROM_EMAIL), omitiendo email de bienvenida');
      return;
    }

    const baseUrl = (process.env.RESEND_API_BASE_URL ?? 'https://api.resend.com').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Bienvenido a tu biblioteca de baile',
        html: buildWelcomeEmail(firstName),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Resend respondió ${res.status}: ${body.slice(0, 200)}`);
    }
  }
}

function buildWelcomeEmail(firstName: string): string {
  const name = firstName?.trim() || 'bailarín';
  const appUrl = (process.env.WEB_APP_URL ?? 'https://video-repo.netlify.app').replace(/\/$/, '');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bienvenido</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Tu cuenta ya está lista. Explora pasos, secuencias y coreografías.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#111111;padding:40px 32px;text-align:center;">
              <div style="font-size:28px;line-height:1;margin-bottom:12px;">&#128378;</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;">Tu biblioteca de baile</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Pasos, secuencias y coreografías en video</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#111111;font-size:16px;">Hola <strong>${escapeHtml(name)}</strong>,</p>
              <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.6;">
                Tu cuenta ya está lista. A partir de ahora tienes acceso a tu biblioteca de contenido de baile, organizada por estilo y dificultad.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:12px 16px;background-color:#fafafa;border-radius:12px;">
                    <p style="margin:0 0 8px;color:#111111;font-size:14px;font-weight:600;">&#10003; Explora cursos por estilo</p>
                    <p style="margin:0 0 8px;color:#111111;font-size:14px;font-weight:600;">&#10003; Sigue tu progreso por sección</p>
                    <p style="margin:0;color:#111111;font-size:14px;font-weight:600;">&#10003; Busca por pasos, tags e influencias</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#111111;border-radius:999px;">
                    <a href="${appUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Entrar a la plataforma</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">
                Eduardo Salas 2026 · <a href="https://eduardosalasg.dev" style="color:#a1a1aa;">eduardosalasg.dev</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
