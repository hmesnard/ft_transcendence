import { Exclude } from "class-transformer";
import { MessageEntity } from "src/chat/entities/message.entity";
import { UserChannelStatus } from "src/chat/entities/user-channel-status.entity";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { MatchEntity } from "src/match/entities/match.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn} from "typeorm";

export enum UserStatus
{
    ONLINE = 'online',
    OFFLINE = 'offline',
    PLAYING = 'playing',
}

@Entity('user')
export class UserEntity extends TimestampEntity {
    @PrimaryColumn()
    id: number;

    @Column({
        length: 50,
        unique: true
    })
    username: string;

    @Column({ default: false })
    tfaEnabled: boolean;

    @Column({ nullable: true })
    @Exclude()
    tfaSecret?: string;

    @Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE })
    status: UserStatus;

    @Column({
        default: null
    })
    picture: string

    @ManyToMany(() => UserEntity)
    @JoinTable()
    friends: UserEntity[];

    @ManyToMany(() => UserEntity)
    @JoinTable()
    blockedUsers: UserEntity[];

    @OneToMany(() => MatchEntity, (match) => match.homePlayer)
    homeMatches: MatchEntity[];

    @OneToMany(() => MatchEntity, (match) => match.awayPlayer)
    awayMatches: MatchEntity[];

    @OneToMany(() => MatchEntity, (match) => match.winner)
    wonMatches: MatchEntity[];

    @OneToMany(() => UserChannelStatus, (status) => status.user)
    userChannelStatus: UserChannelStatus[];

    @OneToMany(() => MessageEntity, (message) => message.author)
    messages: MessageEntity[];
}