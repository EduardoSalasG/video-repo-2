import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsInt, IsArray, IsUUID, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { Role, AccessLevel, Difficulty, PrimaryStyle, VideoType } from '../../domain/enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  username: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCourseDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateModuleDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;
}

export class UpdateModuleDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;
}

export class CreateSectionDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @IsString()
  @IsOptional()
  markdownContent?: string;
}

export class UpdateSectionDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @IsString()
  @IsOptional()
  markdownContent?: string;
}

export class CreateVideoMetadataDto {
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsEnum(PrimaryStyle)
  primaryStyle: PrimaryStyle;

  @IsEnum(VideoType)
  videoType: VideoType;

  @IsInt()
  @Type(() => Number)
  durationCounts: number;

  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsArray()
  @IsString({ each: true })
  influences: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class LinkVideoDto {
  @IsUrl()
  url: string;

  @ValidateNested()
  @Type(() => CreateVideoMetadataDto)
  metadata: CreateVideoMetadataDto;
}

export class GrantCourseAccessDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
