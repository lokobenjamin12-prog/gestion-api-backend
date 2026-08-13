import { SetMetadata } from '@nestjs/common';

export type ContratCheckMode =
    | 'TARGET_ONLY'   // Cas 1 — vérifie seulement l'employé cible
    | 'ACTOR_ONLY'    // vérifie seulement l'acteur (admin)
    | 'BOTH';         // Cas 2 — vérifie les deux

export const REQUIRE_CONTRAT_KEY = 'requireContrat';

// Cas 1 — employé consulte ses propres données
export const RequireContratSelf = () =>
    SetMetadata(REQUIRE_CONTRAT_KEY, { mode: 'TARGET_ONLY' });

// Cas 2 — admin agit sur un employé cible
export const RequireContratBoth = () =>
    SetMetadata(REQUIRE_CONTRAT_KEY, { mode: 'BOTH' });

// Cas spécial — vérifie seulement l'acteur
export const RequireContratActor = () =>
    SetMetadata(REQUIRE_CONTRAT_KEY, { mode: 'ACTOR_ONLY' });