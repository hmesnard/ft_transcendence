import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity()
export class JoinedUserStatus
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ default: false })
    admin: boolean;

    @Column({ default: null })
    muted: Date;

    @Column({ default: null })
    banned: Date;

    @ManyToOne(() => ChannelEntity, (channel: ChannelEntity) => channel.joinedUserStatus)
    channel: ChannelEntity;
}