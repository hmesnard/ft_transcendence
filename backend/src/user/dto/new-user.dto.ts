import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class NewUserDto {

    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    username: string;
}