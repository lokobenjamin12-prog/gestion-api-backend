import { CreateContratDto } from "./create-contrat.dto";
declare const UpdateContratDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateContratDto, "type" | "dateDebut" | "userId">>>;
export declare class UpdateContratDto extends UpdateContratDto_base {
}
export {};
