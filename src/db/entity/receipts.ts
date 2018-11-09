import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Users } from "./users";

@Entity()
export class Receipts {
  @PrimaryGeneratedColumn("uuid")
  @Column({ type: "char", length: 36 })
  public id!: string;

  @Column({ type: "varchar", length: 4096 })
  public content!: string;

  @Column({ type: "char", length: 32, nullable: true })
  public image!: string;

  @Column({ type: "int", default: () => 0 })
  public rating!: number;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;

  @ManyToOne((_type) => Users, (users) => users.receipts)
  public author!: Users;
}
