import { Exclude } from "class-transformer";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JoinedUser } from "./joinedUser.entity";
import { JoinedUserStatus } from "./joinedUserStatus.entity";
import { MessageEntity } from "./message.entity";

export enum ChannelStatus
{
    public = 'public',
    private = 'private',
    protected = 'protected',
    direct = 'direct'
}

@Entity('channel')
export class ChannelEntity extends TimestampEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: "enum", enum: ChannelStatus, default: ChannelStatus.public })
    status: ChannelStatus;

    @Column({ nullable: true })
    password: string;

    @OneToMany(() => JoinedUser, (joinedUser: JoinedUser) => joinedUser.channel)
    @Exclude({ toPlainOnly: true })
    joinedUsers: JoinedUser[];

    @OneToMany(() => JoinedUserStatus, (joinedUserStatus: JoinedUserStatus) => joinedUserStatus.channel)
    @Exclude({ toPlainOnly: true })
    joinedUserStatus: JoinedUserStatus[];

    @ManyToMany(() => UserEntity, { eager: true })
    @JoinTable()
    members: UserEntity[];

    @OneToMany(() => MessageEntity, (message) => message.channel)
    messages: MessageEntity[];
}