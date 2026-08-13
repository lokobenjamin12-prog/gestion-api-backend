
import { CreateRoleDto } from './role-create.dto';
import { PartialType } from '@nestjs/swagger';
//import { PartialType } from '@nestjs/mapped-types';  Ancienne importation 

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }