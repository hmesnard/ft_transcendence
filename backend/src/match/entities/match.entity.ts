import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('match')
export class MatchEntity extends TimestampEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.homeMatches)
    homePlayer: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.awayMatches)
    awayPlayer: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.wonMatches)
    winner: UserEntity;

    @Column()
    homeScore: number;

    @Column()
    awayScore: number;
}