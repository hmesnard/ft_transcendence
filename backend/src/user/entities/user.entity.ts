import { Exclude } from "class-transformer";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { Column, Entity, EntitySchema, JoinTable, ManyToMany, PrimaryColumn, Table } from "typeorm";

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

    @Column({
        default: null
    })
    picture: string

    @ManyToMany(type => UserEntity)
    @JoinTable()
    friends: UserEntity[];

    @ManyToMany(type => UserEntity)
    @JoinTable()
    blockedUsers: UserEntity[];
}