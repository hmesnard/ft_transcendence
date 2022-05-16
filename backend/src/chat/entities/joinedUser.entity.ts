import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "./channel.entity";

@Entity()
export class JoinedUser
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    owner: boolean

    @Column({ nullable: true })
    username: string;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.joinedUsers)
    user: UserEntity;

    @ManyToOne(() => ChannelEntity, (channel: ChannelEntity) => channel.joinedUsers)
    channel: ChannelEntity;
}