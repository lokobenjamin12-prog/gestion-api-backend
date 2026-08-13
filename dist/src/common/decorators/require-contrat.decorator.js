"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireContratActor = exports.RequireContratBoth = exports.RequireContratSelf = exports.REQUIRE_CONTRAT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_CONTRAT_KEY = 'requireContrat';
const RequireContratSelf = () => (0, common_1.SetMetadata)(exports.REQUIRE_CONTRAT_KEY, { mode: 'TARGET_ONLY' });
exports.RequireContratSelf = RequireContratSelf;
const RequireContratBoth = () => (0, common_1.SetMetadata)(exports.REQUIRE_CONTRAT_KEY, { mode: 'BOTH' });
exports.RequireContratBoth = RequireContratBoth;
const RequireContratActor = () => (0, common_1.SetMetadata)(exports.REQUIRE_CONTRAT_KEY, { mode: 'ACTOR_ONLY' });
exports.RequireContratActor = RequireContratActor;
//# sourceMappingURL=require-contrat.decorator.js.map