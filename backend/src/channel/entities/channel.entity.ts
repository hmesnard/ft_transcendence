// import { Chat } from "src/chat/entities/chat.entitie";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity('Channel')
export class ChannelEntity extends TimestampEntity {
	
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		unique: true
	})
	name_chan: string;

	@ManyToMany(()=>UserEntity, (user) => user.id)
	@JoinColumn()
	admin_id: UserEntity[];

	@ManyToMany(()=>UserEntity, (user) => user.id)
	@JoinColumn()
	user_id: UserEntity[];

	@ManyToMany(()=>UserEntity, (user) => user.id)
	@JoinColumn()
	user_blocked: UserEntity[];

	// 0 = private
	// 1 = public
	@Column({default: 0})
	access: boolean;

	@Column()
	password : string;

	// @OneToMany(() => Chat, (chat) => chat.id)
	// chat_id: Chat [];

}