🔐 Module d'Authentification Avancé
Architecture NestJS + Prisma ORM + PostgreSQL | Documentation Technique
🌟 Fonctionnalités Principales
Authentification Dual-Token : Access Token (15 min) & Refresh Token (7 jours) sécurisés par JWT.
Contrôle d'accès RBAC : Gestion fine des autorisations via Guards et Décorateurs d'action.
Gestion des Mots de Passe & Email : Confirmation d'adresse email, réinitialisation sécurisée via Nodemailer.
Sécurité Améliorée : Hachage Bcrypt (12 rounds), DTOs validés (ValidationPipe), protection anti-énumération d'utilisateurs.
Réponses Standardisées : Intercepteur global de réponses et gestionnaire d'exceptions unifié.
📁 Structure du Projet
src/
├── auth/
│   ├── decorators/      # @CurrentUser(), @Roles(...)
│   ├── dto/             # register, login, reset-password...
│   ├── guards/          # JwtAuthGuard, RolesGuard
│   ├── strategies/      # jwt.strategy, jwt-refresh.strategy
│   ├── auth.controller.ts & auth.service.ts
├── mail/                # Service d'envoi d'emails (Nodemailer)
├── prisma/              # Service client Prisma ORM
├── common/              # Filters (HttpException) & Interceptors (Response)
├── app.module.ts
└── main.ts
🚀 Installation & Configuration
1. Cloner le dépôt et installer les dépendances :

npm install
2. Configurer les variables d'environnement dans un fichier .env :

DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
JWT_SECRET="votre_secret_jwt_tres_securise"
JWT_REFRESH_SECRET="votre_refresh_secret_tres_securise"
MAIL_HOST="smtp.mailtrap.io" | MAIL_PORT=2525
MAIL_USER="votre_user"       | MAIL_PASS="votre_pass"
3. Exécuter les migrations Prisma et démarrer le serveur :

npx prisma generate && npx prisma migrate dev --name init
npm run start:dev
README Technical Documentation — NestJS Auth
Page 1 de 2
🌐 Endpoints API
Méthode	Route	Auth	Description
POST	/api/v1/auth/register	Non	Inscription d'un utilisateur
POST	/api/v1/auth/verify-email	Non	Confirmation de l'adresse email
POST	/api/v1/auth/resend-verification	Non	Renvoi du jeton de vérification
POST	/api/v1/auth/login	Non	Connexion (Retourne Access & Refresh tokens)
POST	/api/v1/auth/refresh	Non	Régénération d'un Access Token valide
POST	/api/v1/auth/forgot-password	Non	Demande de réinitialisation de mot de passe
POST	/api/v1/auth/reset-password	Non	Validation du nouveau mot de passe
GET	/api/v1/auth/me	JWT	Récupérer les données du profil courant
GET	/api/v1/auth/logs/:userId	JWT + ADMIN	Consultation des journaux d'audit d'un utilisateur
🛡️ Exemples d'Utilisation des Guards & Décorateurs
// Protection d'une route via JWT et restriction par rôle (RBAC)
@Get('admin-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getAdminData(@CurrentUser() user: UserEntity) {
  return { message: `Bienvenue Admin ${user.email}` };
}
📨 Formatage Standardisé des Réponses
Succès (ResponseInterceptor)
{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "dev@camsol.io"
  },
  "timestamp": "2026-10-15T18:00:00.000Z"
}
Erreur (HttpExceptionFilter)
{
  "statusCode": 400,
  "timestamp": "2026-10-15T18:00:00.000Z",
  "path": "/api/v1/auth/login",
  "message": "Identifiants invalides"
}