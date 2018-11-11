import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToMany
} from "typeorm";
import { Comments } from "./comments";
import { Votes } from "./votes";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({
    type: "char",
    width: 36,
    readonly: true,
    unique: true,
    primary: true
  })
  public id!: string;

  @Column({ type: "varchar", length: 32, unique: true, primary: true })
  public Nickname!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  public Email!: string;

  @Column({ type: "char", length: 32 })
  public hash!: string;

  @Column({ type: "char", length: 32, nullable: true })
  public image!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;

  @OneToMany((_type) => Comments, (comments) => comments.users)
  public comments!: Array<Comments>;

  @OneToMany((_type) => Votes, (votes) => votes.userId)
  public votes!: Array<Comments>;
}
