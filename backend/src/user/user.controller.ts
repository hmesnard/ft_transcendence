import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Req, Res, StreamableFile, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
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
export class UserController {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {}

    @Delete()
    deleteUser(
        @User() user
    ) {
        return this.userService.deleteUser(user.id);
    }

    @Get()
    getProfile(
        @User() user
    ) {
        return this.userService.getUserById(user.id);
    }

    @Post('tfa/secret')
    async register(
        @Res() response: Response,
        @User() user
    ) {
        const { otpauthUrl } = await this.userService.generateTfaSecret(user);

        return this.userService.pipeQrCodeStream(response, otpauthUrl);
    }

    @Post('tfa/turn-on')
    @HttpCode(200)
    async turnOnTfa(
        @User() user,
        @Body() { tfaCode }
    ) {
        const isCodeValid = this.userService.isTfaCodeValid(tfaCode, user);
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.userService.turnOnTfa(user.id);
    }

    @Post('picture')
    @UseInterceptors(FileInterceptor('file'))
    setPicture(
        @User() user,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.userService.setPicture(user, file.path);
    }

    @Get('picture')
    getPicture(
        @User() user: UserEntity
    ) {
        const file = createReadStream(join(process.cwd(), user.picture));
        return new StreamableFile(file);
    }

    @Post('friend/:id')
    requestFriend(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.requestFriend(user, id);
    }

    @Delete('friend/:id')
    deleteFriend(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.deleteFriend(user, id);
    }
    
    @Get('friend')
    getFriends(
        @User() user
    ) {
        return this.userService.getFriends(user.id);
    }

    @Post('block/:id')
    blockUser(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.blockUser(user, id);
    }

    @Delete('block/:id')
    unblockUser(
        @User() user,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.unblockUser(user, id);
    }

    @Get('block')
    getBlockedUsers(
        @User() user
    ) {
        return this.userService.getBlockedUsers(user.id);
    }

    @Post('/logout')
    async logOut(@Res({ passthrough: true }) response: Response, @Req() request: Request)
    {
        return this.userService.logOut(response, await this.authService.getLoggedUser(request));
    }

    // @Post('/upload')
    // @UseInterceptors(FileInterceptor('file', storage))
    // async uploadFile(@UploadedFile() file, @User() user)
    // {
    //     return this.userService.uploadFile(user, file);
    // }

    // @Get('/avatar/:imagename')
    // async findAvatar(@Param('imagename') imagename, @Res() response: Response)
    // {
    //     return of(response.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    // }
}
