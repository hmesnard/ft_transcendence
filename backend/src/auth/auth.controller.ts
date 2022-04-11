import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthService } from './auth.service';
import { FtGuard } from './guards/ft.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Get('42')
	@UseGuards(FtGuard)
	ftAuth() {
		console.log('42login');
		return ;
	}

	@Get('42/return')
	@UseGuards(FtGuard)
	async ftAuthReturn(
		@User() user42,
		@Res({passthrough: true}) res
	) {
		const { user, jwt } = await this.authService.treatFtOauth(user42);
        res.cookie('access_token', jwt);
		return user;
	}
}
