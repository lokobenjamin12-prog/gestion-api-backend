import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
    private readonly logger = new Logger(RefreshTokenGuard.name);

    handleRequest(err: any, user: any, info: any) {

        console.log('\n=========================================');
        console.log('🛡️ --- REFRESH TOKEN GUARD TRACE ---');
        console.log(`ℹ️ info: ${JSON.stringify(info)}`);  // ← add this
        console.log(`👤 user: ${JSON.stringify(user)}`);  // ← add this
        console.log(`❌ err: ${JSON.stringify(err)}`);
        console.log('=========================================\n');

        this.logger.log(`🛡️ --- REFRESH TOKEN GUARD ---`);

        this.logger.log(`🛡️ --- REFRESH TOKEN GUARD ---`);
        this.logger.log(`ℹ️ info: ${JSON.stringify(info)}`);  // ← add this
        this.logger.log(`👤 user: ${JSON.stringify(user)}`);  // ← add this
        this.logger.log(`❌ err: ${JSON.stringify(err)}`);    // ← add this

        if (info?.name === 'TokenExpiredError') {
            console.log(`⏰ ÉCHEC : Refresh token expiré.`);
            this.logger.log(`⏰ ÉCHEC : Refresh token expiré.`);
            throw new UnauthorizedException(
                'Votre session a expiré. Veuillez vous reconnecter.',
            );
        }


        if (info?.name === 'JsonWebTokenError') {
            console.log(`⏰ ÉCHEC : Refresh token expiré.`);
            this.logger.log(`❌ ÉCHEC : Refresh token malformé.`);
            throw new UnauthorizedException('Refresh token invalide.');
        }

        if (err || !user) {
            throw err || new UnauthorizedException('Accès refusé.');
        }

        return user;
    }
}


