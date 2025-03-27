import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
