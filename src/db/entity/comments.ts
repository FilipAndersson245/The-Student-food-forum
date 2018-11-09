import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  @Column({ type: "char", length: 36 })
  public id!: string;

  @Column({ type: "varchar", length: 512 })
  public content!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;
}
