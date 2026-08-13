//NB: les tokens ne sont stoké dans les entetes (Bearer) mais dans les cookies(l'onglet Cookies)
// Doit s'exécuter avant tout autre import : `import { AppModule }` ci-dessous charge en cascade
// tous les modules (dont StockRealtimeGateway), et leurs décorateurs — comme `@WebSocketGateway({
// cors: { origin: process.env.FRONTEND_URL } })` — sont évalués immédiatement à l'import, avant
// que ConfigModule.forRoot() (qui ne s'exécute que dans le décorateur @Module d'AppModule, donc
// après coup) n'ait eu la chance de peupler process.env depuis le fichier .env.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Importation de Swagger
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser(process.env.COOKIE_SECRET)); // You have define COOKIE_SECRET in .env file

  // Gateway WebSocket (stock temps réel) : mêmes cookies httpOnly que l'API HTTP,
  // donc même serveur/port, pas d'adaptateur custom nécessaire au-delà du socket.io par défaut.
  app.useWebSocketAdapter(new IoAdapter(app));

  // Sert tout le dossier "uploads" (logos, photos de profil, etc.) sous /uploads/*
  // Attention : ceci n'est PAS affecté par setGlobalPrefix('api/v1') — l'URL
  // publique sera http://localhost:3000/uploads/... et non /api/v1/uploads/...
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(helmet({
    crossOriginOpenerPolicy: false,
    // you have to pass true to contentSecurityPolicy in production mode after set up
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
    strictTransportSecurity: false,
    xContentTypeOptions: false,
    xDownloadOptions: false,
  }));

  // const { doubleCsrfProtection } = doubleCsrf({
  //   getSecret: () => process.env.CSRF_SECRET ?? "a3f8c2d1e4b7f0a9c6d3e8f1b4a7c0d2e5f8b1a4c7d0e3f6a9b2c5d8e1f4a7b0",
  //   getSessionIdentifier: (req) => req.cookies['__Host-psid'] ?? '', // ← required in newer versions
  //   cookieName: '__Host-psid',
  //   cookieOptions: {
  //     httpOnly: true,
  //     sameSite: 'strict',
  //     secure: process.env.NODE_ENV === 'production',
  //   },
  //   getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
  // });

  app.use((req, res, next) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Path:          ', req.path);
    console.log('🍪 CSRF Cookie:   ', req.cookies['__Host-psid'] ?? 'MISSING');
    console.log('🔑 CSRF Header:   ', req.headers['x-csrf-token'] ?? 'MISSING');
    next();
  });

  // 4. Apply the middleware globally
  //app.use(doubleCsrfProtection);

  // 5. CORS (credentials required for cookies)
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Préfixe global de l'API
  app.setGlobalPrefix('api/v1');

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // Lève une erreur si des champs inconnus sont envoyés
      transform: true,            // Transforme les payloads selon les types TypeScript
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('Documentation Ndolecam API')
    .setDescription('Spécification et tests des endpoints de l\'API')
    .setVersion('1.0')
    // Configuration pour l'authentification par Cookie (ex: nom du cookie = 'access_token')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'Cookie contenant le token JWT d\'authentification',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);


  // 3. Point d'accès de la documentation : accessible sur http://localhost:PORT/api/v1/docs
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      requestInterceptor: (req) => {
        // Permet à Swagger UI d'envoyer les cookies lors des requêtes de test ("Try it out")
        req.credentials = 'include';
        return req;
      },
    },
  });


  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application démarrée sur : http://localhost:${port}/api/v1`);
}

bootstrap();
//NB: les tokens ne sont stoké dans les entetes (Bearer) mais dans les cookies(l'onglet Cookies)

