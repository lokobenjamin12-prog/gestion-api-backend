import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// Décorateur à poser sur les routes ou controllers
export const RequirePermissions = (...slugs: string[]) =>
    SetMetadata(PERMISSIONS_KEY, slugs);