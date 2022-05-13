import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity('message')
export class MessageEntity extends TimestampEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => UserEntity, (user) => user.messages)
    author: UserEntity;

    @ManyToOne(() => ChannelEntity, (chat) => chat.messages)
    chat: ChannelEntity;
}