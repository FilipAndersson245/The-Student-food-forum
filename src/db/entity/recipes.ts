import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToMany,
  ManyToOne
} from "typeorm";
import { Comments } from "./comments";
import { Accounts } from "./accounts";
import { Votes } from "./votes";

@Entity()
export class Recipes {
  @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({ type: "char", length: 36, primary: true })
  public id!: string;

  @Column({ type: "varchar", length: 64 })
  public title!: string;

  @Column({ type: "varchar", length: 4096 })
  public content!: string;

  @Column({ type: "char", length: 36 })
  public imageId!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;

  @OneToMany((_type) => Comments, (comments) => comments.recipes)
  public comments!: Array<Comments>;

  @ManyToOne((_type) => Accounts, (accounts) => accounts.id, {
    onDelete: "CASCADE"
  })
  public accounts!: Accounts;

  @OneToMany((_type) => Votes, (votes) => votes.recipes)
  public votes!: Array<Votes>;
}
