import { IsNotEmpty, IsOptional } from "class-validator";

export class JoinedUserStatusDto
{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    target: string;
}

export class AdminUserDto
{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    admin: string;
}

export class SetPasswordDto
{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsOptional()
    password: string;
}

export class CreateMessageToChatDto
{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    message: string;
}