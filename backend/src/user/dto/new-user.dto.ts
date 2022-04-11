import { IsNotEmpty } from "class-validator";

export class NewUserDto {

    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    username: string;
}