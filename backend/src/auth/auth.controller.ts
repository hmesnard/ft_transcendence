import { Controller, Get, UseGuards } from '@nestjs/common';
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
	ftAuthReturn(
		@User() user
	) {
		return this.authService.treatFtOauth(user);
	}
}
