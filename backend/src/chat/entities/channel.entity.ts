import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

export enum ChannelStatus
{
    PUBLIC = 'public',
    PRIVATE = 'private',
    PROTECTED = 'protected',
    DIRECT = 'direct'
}

@Entity('channel')
export class ChannelEntity extends TimestampEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: "enum", enum: ChannelStatus, default: ChannelStatus.PUBLIC })
    status: ChannelStatus;

    @Column({ nullable: true })
    password: string;

    @ManyToMany(() => UserEntity, { eager: true })
    @JoinTable()
    members: UserEntity[];

    @OneToMany(() => MessageEntity, (message) => message.channel)
    messages: MessageEntity[];
}