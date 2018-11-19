import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Comments } from "./comments";
import { Accounts } from "./accounts";
import { Votes } from "./votes";
import { Tags } from "./tags";

@Entity()
export class Recipes {
  @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({ type: "char", length: 36, primary: true })
  public id!: string;

  @Column({ type: "varchar", length: 4096 })
  public content!: string;

  @Column({ type: "char", length: 32, nullable: true })
  public image!: string;

  @Column({ type: "int", default: () => 0 })
  public rating!: number;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;

  @OneToMany((_type) => Comments, (comments) => comments.recipes)
  public comments!: Array<Comments>;

  @ManyToOne((_type) => Accounts, (users) => users.id)
  public users!: Accounts;

  @OneToMany((_type) => Votes, (votes) => votes.recieptId)
  public votes!: Array<Votes>;

  @ManyToMany((_type) => Tags, (tags) => tags.recipes)
  @JoinTable()
  public tags!: Array<Tags>;
}
