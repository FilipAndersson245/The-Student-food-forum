import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";
import { Receipts } from "./recipes";

@Entity()
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({ type: "char", length: 36, primary: true })
  public id!: string;

  @Column({ type: "varchar", length: 512 })
  public content!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;
}
