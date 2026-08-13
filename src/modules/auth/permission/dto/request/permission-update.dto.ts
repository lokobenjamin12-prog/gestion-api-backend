// src/permission/dto/permission.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './permission-create.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }
