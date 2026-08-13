import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rend PrismaService disponible dans toute l'application sans re-import
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
