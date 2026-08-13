import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';



@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  /**
   * Méthode privée générique pour l'envoi d'emails
   */
  private async sendMail(options: Mail.Options): Promise<void> {
    try {
      const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Ndolecam');
      const fromEmail = this.configService.get<string>('MAIL_FROM');

      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        ...options,
      });

      this.logger.log(`Email envoyé avec succès à ${options.to}`);
    } catch (error) {
      this.logger.error(`Échec d'envoi d'email à ${options.to}`, error.stack);
      throw error;
    }
  }



  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

      this.logger.log(`Envoi de l'email de vérification à : ${email}`);

      await this.sendMail({
        to: email,
        subject: 'Vérifiez votre adresse email',
        html: this.buildVerificationTemplate(firstName, verifyUrl),
      });

      this.logger.log(`Email de vérification envoyé avec succès.`);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email à ${email}`, error.stack);
      // Optionnel : tu peux choisir de lever une erreur personnalisée ici
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    // NB: IL y'a une erreur ici resetUrl dois pointer vers un formulaire de ton app web et la C'est ton Frontend qui doit ensuite envoyer une requête POST vers ton API NestJS avec le nouveau mot de passe et le token dans le corps (body).r 
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: this.buildPasswordResetTemplate(firstName, resetUrl),
    });
  }

  async sendPasswordChangedEmail(email: string, firstName: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Votre mot de passe a été modifié',
      html: this.buildPasswordChangedTemplate(firstName),
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const loginUrl = this.configService.get<string>('FRONTEND_URL') + '/auth/login';

    await this.sendMail({
      to: email,
      subject: `Bienvenue chez Hoozon SARL !`,
      html: this.buildWelcomeTemplate(firstName, loginUrl),
    });
  }

  // ─── Templates HTML ────────────────────────────────────────────────────────
  private buildWelcomeTemplate(firstName: string, loginUrl: string): string {
    return this.baseTemplate(`
      <h2>Bienvenue parmi nous, ${firstName} !</h2>
      <p>Votre compte a été créé avec succès par l'administration de <strong>Hoozon SARL</strong>.</p>
      <p>Nous sommes ravis de vous accueillir au sein de notre équipe au <strong>CIMAP</strong>. Votre espace de travail est désormais prêt.</p>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="btn">Accéder à mon espace</a>
      </div>

      <p>Vous pouvez vous connecter dès maintenant en utilisant votre adresse email professionnelle.</p>
      
      <div class="warning">
        <strong>Note :</strong> Si vous n'avez pas reçu vos identifiants temporaires, veuillez vous rapprocher de votre administrateur système.
      </div>
      
      <p>À très bientôt sur notre plateforme !</p>
    `);
  }
  private baseTemplate(content: string): string {
    const companyName = 'Hoozon SARL';
    // Remplace par l'URL réelle de ton logo hébergé (ex: Cloudinary, S3, Firebase Storage)
    const logoUrl = 'https://i.postimg.cc/CxLnhFqZ/Hoozon-logo.png';

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #E31E24; }
    .logo { max-width: 180px; height: auto; }
    .header h1 { color: #E31E24; margin: 10px 0 0 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
    .body { padding: 40px 32px; color: #333333; line-height: 1.6; }
    .body h2 { color: #1f2937; margin-top: 0; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #E31E24; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background 0.3s; }
    .footer { background: #1f2937; padding: 24px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer p { margin: 5px 0; }
    .warning { background: #fff7ed; border-left: 4px solid #E31E24; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #9a3412; margin-top: 16px; }
    .link-alt { color: #6b7280; font-size: 12px; word-break: break-all; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="${companyName}" class="logo" />
      <h1>${companyName}</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p>© ${new Date().getFullYear()} Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`;
  }
  private buildVerificationTemplate(firstName: string, url: string): string {
    return this.baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Bienvenue chez <strong>Hoozon SARL</strong> ! Nous sommes ravis de vous compter parmi nous.</p>
      <p>Pour finaliser la création de votre compte et sécuriser votre accès, merci de confirmer votre adresse email :</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Vérifier mon email</a>
      </div>
      <p>Ce lien expirera dans <strong>24 heures</strong>.</p>
      <div class="warning">Si vous n'avez pas créé de compte sur notre plateforme, vous pouvez ignorer cet email en toute sécurité.</div>
      <div class="link-alt">Si le bouton ne fonctionne pas, copiez ce lien :<br/>${url}</div>
    `);
  }
  private buildPasswordResetTemplate(firstName: string, url: string): string {
    return this.baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>Hoozon SARL</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Réinitialiser mon mot de passe</a>
      </div>
      <p>Attention : Ce lien n'est valable que pendant <strong>1 heure</strong>.</p>
      <div class="warning">Si vous n'êtes pas à l'origine de cette demande, votre mot de passe actuel restera inchangé. Aucune action n'est requise de votre part.</div>
      <div class="link-alt">Lien direct :<br/>${url}</div>
    `);
  }
  private buildPasswordChangedTemplate(firstName: string): string {
    return this.baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous vous confirmons que le mot de passe de votre compte <strong>Hoozon SARL</strong> a été <strong>modifié avec succès</strong>.</p>
      <p>Vous pouvez désormais vous connecter avec vos nouveaux identifiants.</p>
      <div class="warning"><strong>Sécurité :</strong> Si vous n'avez pas effectué cette modification, veuillez contacter immédiatement notre service support pour sécuriser votre compte.</div>
    `);
  }
}
