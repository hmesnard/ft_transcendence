import { Exclude } from "class-transformer";
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

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.messages, { eager: true })
    @Exclude({ toPlainOnly: true })
    author: UserEntity;

    @ManyToOne(() => ChannelEntity, (channel: ChannelEntity) => channel.messages)
    @Exclude({ toPlainOnly: true })
    channel: ChannelEntity;
}