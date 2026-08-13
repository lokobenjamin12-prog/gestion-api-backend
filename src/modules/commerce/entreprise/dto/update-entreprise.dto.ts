//  ANCIEN IMPORT (À supprimer) :
// import { PartialType } from "@nestjs/mapped-types";
//  NOUVEL IMPORT (Requis pour Swagger) :
import { PartialType } from "@nestjs/swagger";
import { CreateEntrepriseDto } from "./create-entreprise.dto";

export class UpdateEntrepriseDto extends PartialType(CreateEntrepriseDto) { }