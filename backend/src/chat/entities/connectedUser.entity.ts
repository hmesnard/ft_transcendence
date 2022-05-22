import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketId: string;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.connections)
    @JoinColumn()
    user: UserEntity;
}