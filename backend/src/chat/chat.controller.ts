import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './dto/chat.dto';
import { ChatUtilsService } from './service/chatUtils.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { User } from 'src/decorators/user.decorator';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController
{
    constructor(private chatService: ChatService,
        private authService: AuthService,
        private chatUtilService: ChatUtilsService,
        private userService: UserService) {}

    @Get('/getallchannels')
    getAllChannels()
    {
        return this.chatUtilService.getAllChannels();
    }

    @Get('/getchannelbyname')
    getChannelByName(@Body('name') channelName: string)
    {
        return this.chatUtilService.getChannelByName(channelName);
    }

    @Post('/inviteusertoprivatechannel')
    async inviteUserToPrivateChannel(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.inviteUserToPrivateChannel(data, user);
    }

    @Post('/createpublicchannel')
    async createPublicChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPublicChannel(channelName, user);
    }

    @Post('/createprivatechannel')
    async createPrivateChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPrivateChannel(channelName, user);
    }

    @Post('/createprotectedchannel')
    async createProtectedChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.createProtectedChannel(channelData, user);
    }

    @Delete('/deletechannel/:id')
    async deleteChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.deleteChannel(id, user);
    }

    @Delete('/kickuserfromchannel')
    async kickUserFromChannel(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.kickUserFromChannel(data, user);
    }

    @Delete('/delete/:id')
    async leaveChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.leaveChannel(id, user);
    }

    @Post('/joinchannel')
    async joinChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.joinChannel(channelData, user);
    }

    @Post('/mute')
    async muteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.muteUser(data, user);
    }

    @Post('/unmute')
    async unMuteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unMuteUser(data, user);
    }

    @Post('/ban')
    async banUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.banUser(data, user);
    }

    @Post('/unban')
    async unBanUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unBanUser(data, user);
    }

    @Post('/admin')
    async giveAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.giveAdmin(adminData, user);
    }

    @Post('/unadmin')
    async unAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.unAdmin(adminData, user);
    }

    @Post('/password')
    async setPassword(@Body() passwordData: SetPasswordDto, @User() user)
    {
        return this.chatService.setPassword(passwordData, user);
    }

    @Post('/removepassword')
    async removePassword(@Body('name') name: string, @User() user)
    {
        return this.chatService.removePassword(name, user);
    }

    @Post('/createdirectchannel/:id')
    async createDirectChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.createDirectChannel(user, await this.userService.getUserById(id));
    }

    @Post('/messagetochannel')
    async createMessageToChannel(@Body() data: CreateMessageToChatDto, @User() user)
    {
        return this.chatService.createMessageToChannel(data, user);
    }

    @Get('/messagesfromchannel')
    async getMessagesFromChannel(@Body('name') name: string, @User() user)
    {
        return this.chatService.getMessagesFromChannel(name, user);
    }

    @Get('/getallusers/:id')
    async getAllUsersFromChannel(@Param('id') id: number)
    {
        return this.chatService.getAllUsersFromChannel(id);
    }

    @Get('/getuser')
    async getUserFromChannel(@Body() data: JoinedUserStatusDto)
    {
        return this.chatService.getUserFromChannel(data);
    }

    @Get('/getchannelsfromuser')
    async getChannelsFromUser(@Body('userId') userId: number)
    {
        return this.chatService.getChannelsFromUser(userId);
    }
}

// import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
// import { ChatService } from './service/chat.service';
// import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './dto/chat.dto';
// import { ChatUtilsService } from './service/chatUtils.service';
// import { JwtGuard } from 'src/auth/guards/jwt.guard';
// import { UserService } from 'src/user/user.service';
// import { AuthService } from 'src/auth/auth.service';
// import { Request } from 'express';

// @UseGuards(JwtGuard)
// @Controller('chat')
// export class ChatController
// {
//     constructor(private chatService: ChatService,
//         private authService: AuthService,
//         private chatUtilService: ChatUtilsService,
//         private userService: UserService) {}

//     @Get('/getallchannels')
//     getAllChannels()
//     {
//         return this.chatUtilService.getAllChannels();
//     }

//     @Get('/getchannelbyname')
//     getChannelByName(@Body('name') channelName: string)
//     {
//         return this.chatUtilService.getChannelByName(channelName);
//     }

//     @Post('/inviteusertoprivatechannel')
//     async inviteUserToPrivateChannel(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.inviteUserToPrivateChannel(data, await this.authService.getLoggedUser(request));
//     }

//     @Post('/createpublicchannel')
//     async createPublicChannel(@Body('name') channelName: string, @Req() request: Request)
//     {
//         return this.chatService.createPublicChannel(channelName, await this.authService.getLoggedUser(request));
//     }

//     @Post('/createprivatechannel')
//     async createPrivateChannel(@Body('name') channelName: string, @Req() request: Request)
//     {
//         return this.chatService.createPrivateChannel(channelName, await this.authService.getLoggedUser(request));
//     }

//     @Post('/createprotectedchannel')
//     async createProtectedChannel(@Body() channelData: SetPasswordDto, @Req() request: Request)
//     {
//         return this.chatService.createProtectedChannel(channelData, await this.authService.getLoggedUser(request));
//     }

//     @Delete('/deletechannel/:id')
//     async deleteChannel(@Param('id') id: number, @Req() request: Request)
//     {
//         return this.chatService.deleteChannel(id, await this.authService.getLoggedUser(request));
//     }

//     @Delete('/kickuserfromchannel')
//     async kickUserFromChannel(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.kickUserFromChannel(data, await this.authService.getLoggedUser(request));
//     }

//     @Delete('/delete/:id')
//     async leaveChannel(@Param('id') id: number, @Req() request: Request)
//     {
//         return this.chatService.leaveChannel(id, await this.authService.getLoggedUser(request));
//     }

//     @Post('/joinchannel')
//     async joinChannel(@Body() channelData: SetPasswordDto, @Req() request: Request)
//     {
//         return this.chatService.joinChannel(channelData, await this.authService.getLoggedUser(request));
//     }

//     @Post('/mute')
//     async muteUser(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.muteUser(data, await this.authService.getLoggedUser(request));
//     }

//     @Post('/unmute')
//     async unMuteUser(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.unMuteUser(data, await this.authService.getLoggedUser(request));
//     }

//     @Post('/ban')
//     async banUser(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.banUser(data, await this.authService.getLoggedUser(request));
//     }

//     @Post('/unban')
//     async unBanUser(@Body() data: JoinedUserStatusDto, @Req() request: Request)
//     {
//         return this.chatService.unBanUser(data, await this.authService.getLoggedUser(request));
//     }

//     @Post('/admin')
//     async giveAdmin(@Body() adminData: AdminUserDto, @Req() request: Request)
//     {
//         return this.chatService.giveAdmin(adminData, await this.authService.getLoggedUser(request));
//     }

//     @Post('/unadmin')
//     async unAdmin(@Body() adminData: AdminUserDto, @Req() request: Request)
//     {
//         return this.chatService.unAdmin(adminData, await this.authService.getLoggedUser(request));
//     }

//     @Post('/password')
//     async setPassword(@Body() passwordData: SetPasswordDto, @Req() request: Request)
//     {
//         return this.chatService.setPassword(passwordData, await this.authService.getLoggedUser(request));
//     }

//     @Post('/removepassword')
//     async removePassword(@Body('name') name: string, @Req() request: Request)
//     {
//         return this.chatService.removePassword(name, await this.authService.getLoggedUser(request));
//     }

//     @Post('/createdirectchannel/:id')
//     async createDirectChannel(@Param('id') id: number, @Req() request: Request)
//     {
//         return this.chatService.createDirectChannel(await this.authService.getLoggedUser(request), await this.userService.getUserById(id));
//     }

//     @Post('/messagetochannel')
//     async createMessageToChannel(@Body() data: CreateMessageToChatDto, @Req() request: Request)
//     {
//         return this.chatService.createMessageToChannel(data, await this.authService.getLoggedUser(request));
//     }

//     @Get('/messagesfromchannel')
//     async getMessagesFromChannel(@Body('name') name: string, @Req() request: Request)
//     {
//         return this.chatService.getMessagesFromChannel(name, await this.authService.getLoggedUser(request));
//     }

//     @Get('/getallusers/:id')
//     async getAllUsersFromChannel(@Param('id') id: number)
//     {
//         return this.chatService.getAllUsersFromChannel(id);
//     }

//     @Get('/getuser')
//     async getUserFromChannel(@Body() data: JoinedUserStatusDto)
//     {
//         return this.chatService.getUserFromChannel(data);
//     }

//     @Get('/getchannelsfromuser')
//     async getChannelsFromUser(@Body('userId') userId: number)
//     {
//         return this.chatService.getChannelsFromUser(userId);
//     }
// }