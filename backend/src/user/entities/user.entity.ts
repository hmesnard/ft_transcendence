import { Exclude } from "class-transformer";
import { JoinedUserStatus } from "src/chat/entities/joinedUserStatus.entity";
import { MessageEntity } from "src/chat/entities/message.entity";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { MatchEntity } from "src/match/entities/match.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn} from "typeorm";

export enum UserLevel
{
    beginner = 'beginner',
    advanced = 'advanced',
    pro = 'pro',
    expert = 'expert',
}

export enum UserStatus
{
    online = 'online',
    offline = 'offline',
    playing = 'playing',
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

    @Column({ default: "default.png" })
    picture: string

    @Column({ type: "enum", enum: UserStatus, default: UserStatus.offline })
    status: UserStatus;

    @Column({ type: "enum", enum: UserLevel, default: UserLevel.beginner })
    level: UserLevel;

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    losses: number;

    @Column({ default: 0 })
    rank: number;

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

    @OneToMany(() => MessageEntity, (message) => message.author)
    messages: MessageEntity[];

    @OneToMany(() => JoinedUserStatus, (joinedUserStatus: JoinedUserStatus) => joinedUserStatus.user)
    @Exclude({ toPlainOnly: true })
    joinedUserStatus: JoinedUserStatus[];
}