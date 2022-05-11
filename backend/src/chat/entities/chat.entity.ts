import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./message.entity";

export enum ChatStatus {
    public = 'public',
    private = 'private'
}

@Entity('chat')
export class ChatEntity extends TimestampEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.public })
    status: ChatStatus;

    @Column({ nullable: true })
    password: string;

    @ManyToMany(() => UserEntity)
    members: UserEntity[];

    @OneToMany(() => MessageEntity, (message) => message.chat)
    messages: MessageEntity[];
}