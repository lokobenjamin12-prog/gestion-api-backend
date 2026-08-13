export type ContratCheckMode = 'TARGET_ONLY' | 'ACTOR_ONLY' | 'BOTH';
export declare const REQUIRE_CONTRAT_KEY = "requireContrat";
export declare const RequireContratSelf: () => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireContratBoth: () => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireContratActor: () => import("@nestjs/common").CustomDecorator<string>;
