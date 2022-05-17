import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './dto/chat.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { ChatService } from './service/chat.service';
import { ChatUtilsService } from './service/chatUtils.service';
import { UserService } from 'src/user/user.service';

@Controller('chat')
export class ChatController
{
    constructor(private chatService: ChatService,
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

    @UseGuards(JwtGuard)
    @Post('/inviteuser')
    async inviteUserToChannel(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.inviteUserToChannel(data, user);
    }

    @UseGuards(JwtGuard)
    @Post('/createpublicchannel')
    async createPublicChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPublicChannel(channelName, user);
    }

    @UseGuards(JwtGuard)
    @Post('/createprivatechannel')
    async createPrivateChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPrivateChannel(channelName, user);
    }

    @UseGuards(JwtGuard)
    @Post('/createprotectedchannel')
    async createProtectedChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.createProtectedChannel(channelData, user);
    }

    @UseGuards(JwtGuard)
    @Post('/disconnect')
    async disconnect(@User() user)
    {
        return this.chatService.disconnect(user);
    }

    @UseGuards(JwtGuard)
    @Delete('/deletechannel/:id')
    async deleteChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.deleteChannel(id, user);
    }

    @UseGuards(JwtGuard)
    @Delete('/kickuserfromchannel')
    async kickUserFromChat(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.kickUserFromChannel(data, user);
    }

    @UseGuards(JwtGuard)
    @Delete('/leavechannel/:id')
    async leaveChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.leaveChannel(id, user);
    }

    @UseGuards(JwtGuard)
    @Post('/joinchannel')
    async joinChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.joinChannel(channelData, user);
    }

    @UseGuards(JwtGuard)
    @Post('/mute')
    async muteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.muteUser(data, user);
    }

    @UseGuards(JwtGuard)
    @Post('/unmute')
    async unMuteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unMuteUser(data, user);
    }

    @UseGuards(JwtGuard)
    @Post('/ban')
    async banUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.banUser(data, user);
    }

    @UseGuards(JwtGuard)
    @Post('/unban')
    async unBanUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unBanUser(data, user);
    }

    @UseGuards(JwtGuard)
    @Post('/admin')
    async giveAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.giveAdmin(adminData, user);
    }

    @UseGuards(JwtGuard)
    @Post('/unadmin')
    async unAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.unAdmin(adminData, user);
    }

    @UseGuards(JwtGuard)
    @Post('/password')
    async setPassword(@Body() passwordData: SetPasswordDto, @User() user)
    {
        return this.chatService.setPassword(passwordData, user);
    }

    @UseGuards(JwtGuard)
    @Post('/removepassword')
    async removePassword(@Body('name') name: string, @User() user)
    {
        return this.chatService.removePassword(name, user);
    }

    @UseGuards(JwtGuard)
    @Post('/createdirectchannel/:id')
    async createDirectChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.createDirectChannel(user, await this.userService.getUserById(id));
    }

    @UseGuards(JwtGuard)
    @Post('/messagetochannel')
    async createMessageToChannel(@Body() data: CreateMessageToChatDto, @User() user)
    {
        return this.chatService.createMessageToChannel(data, user);
    }

    @UseGuards(JwtGuard)
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

    @Get('/getchatsfromuser')
    async getChannelsFromUser(@Body('userId') userId: number)
    {
        return this.chatService.getChannelsFromUser(userId);
    }
}