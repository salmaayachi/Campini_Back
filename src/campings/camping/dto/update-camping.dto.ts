import { PartialType } from '@nestjs/mapped-types';
import { CreateCampingDto } from './create-camping.dto';

export class UpdateCampingDto extends PartialType(CreateCampingDto) {}
