import { IsNotEmpty, IsString } from "class-validator";

export class New_Channel {

	@IsNotEmpty()
	@IsString()
    name_chan: string;

	@IsString()
	password: string;

	@IsNotEmpty()
	acces: boolean;
}