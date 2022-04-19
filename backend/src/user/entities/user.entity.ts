import { ChannelService } from "src/channel/channel.service";
import { ChannelEntity } from "src/channel/entities/channel.entity";
import { TimestampEntity } from "src/generics/timestamp.entity";
import { Column, Entity, EntitySchema, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity('user')
export class UserEntity extends TimestampEntity {
    @PrimaryGeneratedColumn()
	id: number;
	
	@Column({
		length: 50,
        unique: true
	})
	username: string;

	@Column({
		length: 50,
        unique: true
	})
	nickname:string;

	@ManyToMany(() => ChannelEntity, (channel) => channel.id)
	channel_id: ChannelEntity [];

	@Column({ default: false })
    tfaEnabled: boolean;

    @Column({ nullable: true })
    tfaSecret?: string;

    @ManyToMany(type => UserEntity)
    @JoinTable()
    friends: UserEntity[];

    @ManyToMany(type => UserEntity)
    @JoinTable()
    blockedUsers: UserEntity[];
}