<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).




//======================================================================================================
//======================================================================================================

# 🔐 Module d'Authentification — NestJS + Prisma + PostgreSQL

Module d'authentification complet et production-ready pour NestJS.

---

## 📁 Structure des fichiers

```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # Extrait l'utilisateur du JWT
│   │   └── roles.decorator.ts          # Décorateur @Roles(...)
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── verify-email.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   ├── reset-password.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # Protège les routes (Bearer token)
│   │   └── roles.guard.ts              # Contrôle d'accès par rôle
│   ├── strategies/
│   │   ├── jwt.strategy.ts             # Validation du access token
│   │   └── jwt-refresh.strategy.ts     # Validation du refresh token
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── mail/
│   ├── mail.service.ts                 # Envoi d'emails via Nodemailer
│   └── mail.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts    # Formatage global des erreurs
│   └── interceptors/
│       └── response.interceptor.ts     # Enveloppe { success, data, timestamp }
├── app.module.ts
└── main.ts
test/
└── auth.service.spec.ts                # Tests unitaires
```

---

## 🚀 Installation

### 1. Copier les fichiers dans votre projet

Intégrez les fichiers dans votre projet NestJS existant.

### 2. Installer les dépendances

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt \
            bcrypt nodemailer class-validator class-transformer \
            @nestjs/config

npm install -D @types/bcrypt @types/nodemailer @types/passport-jwt
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
# Remplissez toutes les valeurs dans .env
```

### 4. Générer le client Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🌐 Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/v1/auth/register` | ❌ | Inscription |
| `POST` | `/api/v1/auth/verify-email` | ❌ | Vérification email |
| `POST` | `/api/v1/auth/resend-verification` | ❌ | Renvoi du lien de vérification |
| `POST` | `/api/v1/auth/login` | ❌ | Connexion |
| `POST` | `/api/v1/auth/refresh` | ❌ | Rafraîchir les tokens |
| `POST` | `/api/v1/auth/forgot-password` | ❌ | Demande de réinitialisation |
| `POST` | `/api/v1/auth/reset-password` | ❌ | Réinitialiser le mot de passe |
| `GET` | `/api/v1/auth/me` | ✅ JWT | Profil courant |
| `GET` | `/api/v1/auth/logs/:userId` | ✅ JWT + ADMIN | Logs d'un utilisateur |

---

## 🛡️ Utilisation des Guards

### Protéger une route (JWT requis)

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: any) {
  return user;
}
```

### Restreindre par rôle

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
adminRoute() {
  return 'Réservé aux admins';
}
```

### Récupérer un champ précis de l'utilisateur

```typescript
@Get('my-id')
@UseGuards(JwtAuthGuard)
getId(@CurrentUser('id') id: string) {
  return id;
}
```

---

## 📨 Format des réponses

Toutes les réponses sont enveloppées par le `ResponseInterceptor` :

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Les erreurs sont formatées par le `HttpExceptionFilter` :

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "message": "Email ou mot de passe incorrect"
}
```

---

## 🔄 Flux d'authentification

```
1. POST /register     → Email de vérification envoyé
2. POST /verify-email → Compte activé (status: ACTIVE)
3. POST /login        → { accessToken (15min), refreshToken (7j) }
4. GET  /me           → Authorization: Bearer <accessToken>
5. POST /refresh      → Nouveau access + refresh token
```

---

## 🧪 Tests

```bash
npm run test
npm run test:cov
```

---

## 🔒 Sécurité

- **Bcrypt** avec 12 rounds pour le hachage des mots de passe
- **Tokens cryptographiques** (32 bytes) pour email et reset password
- **Réponses génériques** sur forgot-password et resend-verification (anti-énumération)
- **Expiration des tokens** : email (24h), reset password (1h)
- **Validation des mots de passe** : min. 8 caractères, majuscule, minuscule, chiffre, caractère spécial
- **whitelist + forbidNonWhitelisted** sur le ValidationPipe global
- **Logs automatiques** sur toutes les actions sensibles
