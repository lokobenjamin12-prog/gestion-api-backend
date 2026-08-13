
import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    DiskHealthIndicator,
    MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/modules/auth/authentification/decorators/Public.decoration';
import { PrismaHealthIndicator } from '../indicators/prisma.health';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // 1. Importation des décorateurs Swagger

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly prismaIndicator: PrismaHealthIndicator,
        private readonly disk: DiskHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
    ) { }

    // ─── Full health check ────────────────────────────────────────────────────
    @Get()
    @Public()
    @HealthCheck()
    @ApiOperation({ summary: 'Bilan de santé complet de l\'application' })
    @ApiResponse({ status: 200, description: 'L\'application et toutes ses dépendances sont saines.' })
    @ApiResponse({ status: 503, description: 'Un ou plusieurs composants (Base de données, Stockage, Mémoire) sont défaillants.' })

    check() {
        return this.health.check([
            // 1. Database
            () => this.prismaIndicator.isHealthy('database'),

            // 2. Disk storage — warns if usage exceeds 90%
            () =>
                this.disk.checkStorage('storage', {
                    path: '/',
                    thresholdPercent: 0.9,
                }),

            // 3. Memory heap — warns if heap exceeds 300MB
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // 4. Memory RSS — warns if RSS exceeds 512MB
            () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
        ]);
    }

    // ─── Database only ────────────────────────────────────────────────────────
    @Get('db')
    @Public()
    @HealthCheck()
    @ApiOperation({ summary: 'Vérification de l\'état de la base de données' })
    @ApiResponse({ status: 200, description: 'La base de données Prisma fonctionne correctement.' })
    @ApiResponse({ status: 503, description: 'La base de données est inaccessible.' })

    checkDatabase() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
        ]);
    }

    // ─── Memory only ─────────────────────────────────────────────────────────
    @Get('memory')
    @Public()
    @HealthCheck()
    @ApiOperation({ summary: 'Vérification de l\'état de la mémoire (Heap & RSS)' })
    @ApiResponse({ status: 200, description: 'L\'utilisation de la mémoire est sous les seuils critiques.' })
    @ApiResponse({ status: 503, description: 'La consommation de mémoire a dépassé la limite autorisée.' })

    checkMemory() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
        ]);
    }

    // ─── Liveness probe (Kubernetes / Docker) ────────────────────────────────
    @Get('live')
    @Public()
    @ApiOperation({ summary: 'Liveness Probe : Indique si l\'instance de l\'application est vivante' })
    @ApiResponse({ status: 200, description: 'L\'application tourne (statut ok).' })

    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV ?? 'development',
        };
    }

    // ─── Readiness probe (Kubernetes / Docker) ───────────────────────────────
    @Get('ready')
    @Public()
    @HealthCheck()
    @ApiOperation({ summary: 'Readiness Probe : Détermine si l\'application est prête à recevoir du trafic' })
    @ApiResponse({ status: 200, description: 'L\'application est prête à traiter les requêtes.' })
    @ApiResponse({ status: 503, description: 'L\'application n\'est pas prête (ex: DB non connectée).' })

    ready() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
        ]);
    }
}
