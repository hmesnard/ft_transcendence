import { TimestampEntity } from "src/generics/timestamp.entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('user')
export class UserEntity extends TimestampEntity {
    @PrimaryColumn()
    id: number;

    @Column({
        length: 50,
        unique: true
    })
    username: string;
}