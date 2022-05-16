import { IsNotEmpty } from "class-validator";

export class CreateChannelDto {

    @IsNotEmpty()
    type: string;

    name: string;

    password: string;
}