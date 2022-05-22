import { Body, Controller, Get, HttpCode, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/decorators/user.decorator';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { FtGuard } from './guards/ft.guard';
import { TfaGuard } from './guards/tfa.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
		private userService: UserService
    ) {}

	// should this be Post() ?
    @Get('42')
	@UseGuards(FtGuard)
	ftAuth()
	{
		console.log('42login');
		return ;
	}

	// should this be Post() ?
	@Get('42/return')
	@UseGuards(FtGuard)
	async ftAuthReturn(@User() user42, @Res({passthrough: true}) res)
	{
		const { user, jwt } = await this.authService.treatFtOauth(user42);
        res.cookie('access_token', jwt);
		return user;
	}

	@Post('tfa')
	@HttpCode(200)
	@UseGuards(TfaGuard)
	async authenticate(@User() user, @Body() { tfaCode }, @Res({passthrough: true}) res: Response)
	{
		const isCodeValid = this.userService.isTfaCodeValid(tfaCode, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
    	}

		const jwt = this.authService.treatTfa(user.id, true);

		res.clearCookie('access_token');
		res.cookie('access_token', jwt);

		return user;
  	}
}
