"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.use((0, helmet_1.default)({
        crossOriginOpenerPolicy: false,
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
    app.use((req, res, next) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📌 Path:          ', req.path);
        console.log('🍪 CSRF Cookie:   ', req.cookies['__Host-psid'] ?? 'MISSING');
        console.log('🔑 CSRF Header:   ', req.headers['x-csrf-token'] ?? 'MISSING');
        next();
    });
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Documentation Ndolecam API')
        .setDescription('Spécification et tests des endpoints de l\'API')
        .setVersion('1.0')
        .addCookieAuth('access_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'Cookie contenant le token JWT d\'authentification',
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/docs', app, document, {
        swaggerOptions: {
            requestInterceptor: (req) => {
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
//# sourceMappingURL=main.js.map