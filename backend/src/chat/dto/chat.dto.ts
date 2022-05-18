import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class JoinedUserStatusDto
{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    targetId: number;
}

export class AdminUserDto
{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    adminId: number;
}

export class SetPasswordDto
{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    password: string;
}

export class CreateMessageToChatDto
{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    message: string;
}