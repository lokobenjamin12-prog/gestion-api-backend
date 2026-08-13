"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    async sendMail(options) {
        try {
            const fromName = this.configService.get('MAIL_FROM_NAME', 'Ndolecam');
            const fromEmail = this.configService.get('MAIL_FROM');
            await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                ...options,
            });
            this.logger.log(`Email envoyé avec succès à ${options.to}`);
        }
        catch (error) {
            this.logger.error(`Échec d'envoi d'email à ${options.to}`, error.stack);
            throw error;
        }
    }
    async sendVerificationEmail(email, firstName, token) {
        try {
            const frontendUrl = this.configService.get('FRONTEND_URL');
            const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
            this.logger.log(`Envoi de l'email de vérification à : ${email}`);
            await this.sendMail({
                to: email,
                subject: 'Vérifiez votre adresse email',
                html: this.buildVerificationTemplate(firstName, verifyUrl),
            });
            this.logger.log(`Email de vérification envoyé avec succès.`);
        }
        catch (error) {
            this.logger.error(`Échec de l'envoi de l'email à ${email}`, error.stack);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, firstName, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
        await this.sendMail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: this.buildPasswordResetTemplate(firstName, resetUrl),
        });
    }
    async sendPasswordChangedEmail(email, firstName) {
        await this.sendMail({
            to: email,
            subject: 'Votre mot de passe a été modifié',
            html: this.buildPasswordChangedTemplate(firstName),
        });
    }
    async sendWelcomeEmail(email, firstName) {
        const loginUrl = this.configService.get('FRONTEND_URL') + '/auth/login';
        await this.sendMail({
            to: email,
            subject: `Bienvenue chez Hoozon SARL !`,
            html: this.buildWelcomeTemplate(firstName, loginUrl),
        });
    }
    buildWelcomeTemplate(firstName, loginUrl) {
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
    baseTemplate(content) {
        const companyName = 'Hoozon SARL';
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
    buildVerificationTemplate(firstName, url) {
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
    buildPasswordResetTemplate(firstName, url) {
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
    buildPasswordChangedTemplate(firstName) {
        return this.baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous vous confirmons que le mot de passe de votre compte <strong>Hoozon SARL</strong> a été <strong>modifié avec succès</strong>.</p>
      <p>Vous pouvez désormais vous connecter avec vos nouveaux identifiants.</p>
      <div class="warning"><strong>Sécurité :</strong> Si vous n'avez pas effectué cette modification, veuillez contacter immédiatement notre service support pour sécuriser votre compte.</div>
    `);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map