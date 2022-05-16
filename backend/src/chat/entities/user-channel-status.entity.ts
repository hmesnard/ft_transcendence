import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity('user-channel-status')
export class UserChannelStatus extends TimestampEntity {

    @PrimaryColumn({ type: 'int' })
    @ManyToOne(() => UserEntity, (user) => user.userChannelStatus)
    user: UserEntity;

    @PrimaryColumn({ type: 'int' })
    @ManyToOne(() => ChannelEntity, (channel) => channel.userChannelStatus)
    channel: ChannelEntity;

    @Column({ default: false })
    owner: boolean;

    @Column({ default: false })
    admin: boolean;

    @Column({ default: null })
    muted: Date;

    @Column({ default: null })
    banned: Date;
}