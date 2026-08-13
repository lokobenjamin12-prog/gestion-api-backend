import { CreateContratDto } from "./create-contrat.dto";
import { OmitType, PartialType } from "@nestjs/mapped-types";

// 1. OmitType retire 'userId' du CreateContratDto
// 2. PartialType rend tous les autres champs restants optionnels
export class UpdateContratDto extends PartialType(
    OmitType(CreateContratDto, ['userId', 'type', 'dateDebut'] as const)
) { }

