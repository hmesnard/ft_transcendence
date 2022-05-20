import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Req, Res, StreamableFile, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { join } from 'path';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { of } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = (file.originalname).replace(/\s/g, '');
            cb(null, `${filename}`)
        }
    })
}

@UseGuards(JwtGuard)
@Controller('user')
export class UserController
{
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {}

    @Delete()
    async deleteUser(@Req() request: Request)
    {
        const user = await this.authService.getLoggedUser(request);
        return this.userService.deleteUser(user.id);
    }

    @Get()
    async getProfile(@Req() request: Request)
    {
        const user = await this.authService.getLoggedUser(request);
        return this.userService.getUserById(user.id);
    }

    @Post('tfa/secret')
    async register(@Res() response: Response, @Req() request: Request)
    {
        const { otpauthUrl } = await this.userService.generateTfaSecret(await this.authService.getLoggedUser(request));
        return this.userService.pipeQrCodeStream(response, otpauthUrl);
    }

    @Post('tfa/turn-on')
    @HttpCode(200)
    async turnOnTfa(@Req() request: Request, @Body() { tfaCode })
    {
        const user = await this.authService.getLoggedUser(request);
        const isCodeValid = this.userService.isTfaCodeValid(tfaCode, user);
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.userService.turnOnTfa(user.id);
    }

    // @Post('picture')
    // @UseInterceptors(FileInterceptor('file'))
    // setPicture(
    //     @User() user,
    //     @UploadedFile() file: Express.Multer.File
    // ) {
    //     return this.userService.setPicture(user, file.path);
    // }

    // @Get('picture')
    // getPicture(
    //     @User() user: UserEntity
    // ) {
    //     const file = createReadStream(join(process.cwd(), user.picture));
    //     return new StreamableFile(file);
    // }

    @Post('friend/:id')
    async requestFriend(@Req() request: Request, @Param('id', ParseIntPipe) id)
    {
        return this.userService.requestFriend(await this.authService.getLoggedUser(request), id);
    }

    @Delete('friend/:id')
    async deleteFriend(@Req() request: Request, @Param('id', ParseIntPipe) id)
    {
        return this.userService.deleteFriend(await this.authService.getLoggedUser(request), id);
    }
    
    @Get('friend')
    async getFriends(@Req() request: Request)
    {
        const user = await this.authService.getLoggedUser(request);
        return this.userService.getFriends(user.id);
    }

    @Post('block/:id')
    async blockUser(@Req() request: Request, @Param('id', ParseIntPipe) id)
    {
        return this.userService.blockUser(await this.authService.getLoggedUser(request), id);
    }

    @Delete('block/:id')
    async unblockUser(@Req() request: Request, @Param('id', ParseIntPipe) id)
    {
        return this.userService.unblockUser(await this.authService.getLoggedUser(request), id);
    }

    @Get('block')
    async getBlockedUsers(@Req() request: Request)
    {
        const user = await this.authService.getLoggedUser(request);
        return this.userService.getBlockedUsers(user.id);
    }

    @Post('/logout')
    async logOut(@Res({ passthrough: true }) response: Response, @Req() request: Request)
    {
        return this.userService.logOut(response, await this.authService.getLoggedUser(request));
    }

    @Post('/picture')
    @UseInterceptors(FileInterceptor('file', storage))
    async uploadFile(@UploadedFile() file, @Req() request: Request)
    {
        return this.userService.uploadFile(await this.authService.getLoggedUser(request), file);
    }

    @Get('/picture/:imagename')
    async findPicture(@Param('imagename') imagename, @Res() response: Response)
    {
        return of(response.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
}
