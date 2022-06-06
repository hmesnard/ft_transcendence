import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './dto/chat.dto';
import { ChatUtilsService } from './service/chatUtils.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/decorators/user.decorator';

@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController
{
    constructor(private chatService: ChatService,
        private chatUtilService: ChatUtilsService,
        private userService: UserService) {}

    @Get('/all')
    getAllChannels(@Query('page') page: number)
    {
        return this.chatUtilService.paginate(page);
    //    return this.chatUtilService.getAllChannels();
    }

    @Get()
    getChannelByName(@Body('name') channelName: string)
    {
        return this.chatUtilService.getChannelByName(channelName);
    }

    @Post('/invite')
    async inviteUserToPrivateChannel(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.inviteUserToPrivateChannel(data, user);
    }

    @Post('/public')
    async createPublicChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPublicChannel(channelName, user);
    }

    @Post('/private')
    async createPrivateChannel(@Body('name') channelName: string, @User() user)
    {
        return this.chatService.createPrivateChannel(channelName, user);
    }

    @Post('/protected')
    async createProtectedChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.createProtectedChannel(channelData, user);
    }

    @Delete('/delete/:id')
    async deleteChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.deleteChannel(id, user);
    }

    @Delete('/kick')
    async kickUserFromChannel(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.kickUserFromChannel(data, user);
    }

    @Delete('/leave/:id')
    async leaveChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.leaveChannel(id, user);
    }

    @Post('/join')
    async joinChannel(@Body() channelData: SetPasswordDto, @User() user)
    {
        return this.chatService.joinChannel(channelData, user);
    }

    @Patch('/mute')
    async muteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.muteUser(data, user);
    }

    @Patch('/unmute')
    async unMuteUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unMuteUser(data, user);
    }

    @Patch('/ban')
    async banUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.banUser(data, user);
    }

    @Patch('/unban')
    async unBanUser(@Body() data: JoinedUserStatusDto, @User() user)
    {
        return this.chatService.unBanUser(data, user);
    }

    @Patch('/admin')
    async giveAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.giveAdmin(adminData, user);
    }

    @Patch('/unadmin')
    async unAdmin(@Body() adminData: AdminUserDto, @User() user)
    {
        return this.chatService.unAdmin(adminData, user);
    }

    @Patch('/password')
    async setPassword(@Body() passwordData: SetPasswordDto, @User() user)
    {
        return this.chatService.setPassword(passwordData, user);
    }

    @Patch('/removepassword')
    async removePassword(@Body('name') name: string, @User() user)
    {
        return this.chatService.removePassword(name, user);
    }

    @Post('/direct/:id')
    async createDirectChannel(@Param('id') id: number, @User() user)
    {
        return this.chatService.createDirectChannel(user, await this.userService.getUserById(id));
    }

    @Post('/createmessage')
    async createMessageToChannel(@Body() data: CreateMessageToChatDto, @User() user)
    {
        return this.chatService.createMessageToChannel(data, user);
    }

    @Get('/messages')
    async getMessagesFromChannel(@Body('name') name: string, @User() user)
    {
        return this.chatService.getMessagesFromChannel(name, user);
    }

    @Get('/getusers/:id')
    async getAllUsersFromChannel(@Param('id') id: number)
    {
        return this.chatService.getAllUsersFromChannel(id);
    }

    @Get('/getuser')
    async getUserFromChannel(@Body() data: JoinedUserStatusDto)
    {
        return this.chatService.getUserFromChannel(data);
    }

    @Get('/getchannels')
    async getChannelsFromUser(@Body('userId') userId: number)
    {
        return this.chatService.getChannelsFromUser(userId);
    }
}