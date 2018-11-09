import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  @Column({ type: "char", width: 36, readonly: true, unique: true })
  public id!: string;

  @Column({ type: "varchar", length: 32, unique: true })
  public Nickname!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  public Email!: string;

  @Column({ type: "char", length: 32 })
  public hash!: string;

  @Column({ type: "char", length: 32, nullable: true })
  public image!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;
}
