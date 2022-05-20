import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity()
export class JoinedUserStatus extends TimestampEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    owner: boolean;

    @Column({ default: false })
    admin: boolean;

    @Column({ default: null })
    muted: Date;

    @Column({ default: null })
    banned: Date;

    @ManyToOne(() => ChannelEntity, (channel: ChannelEntity) => channel.joinedUserStatus)
    channel: ChannelEntity;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.joinedUserStatus)
    user: UserEntity;
}