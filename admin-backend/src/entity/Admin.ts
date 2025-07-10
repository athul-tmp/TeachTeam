import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  adminID: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
