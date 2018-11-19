import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  ManyToOne
} from "typeorm";
import { Recipes } from "./recipes";
import { Accounts } from "./accounts";

@Entity()
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn({ type: "char", length: 36, primary: true })
  public id!: string;

  @Column({ type: "varchar", length: 512 })
  public content!: string;

  @Column({ type: "timestamp", default: () => `CURRENT_TIMESTAMP` })
  public updatedAt!: string;

  @ManyToOne((_type) => Recipes, (recipes) => recipes.comments)
  public recipes!: Recipes;

  @ManyToOne((_type) => Accounts, (users) => users.id)
  public users!: Accounts;
}
