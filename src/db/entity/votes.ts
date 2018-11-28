import { Entity, ManyToOne, Column } from "typeorm";
import { Recipes } from "./recipes";
import { Accounts } from "./accounts";

@Entity()
export class Votes {
  @Column({ type: "tinyint" })
  public vote!: number;

  @ManyToOne((_type) => Recipes, (recipes) => recipes.id, { primary: true })
  public recieptId!: string;

  @ManyToOne((_type) => Accounts, (account) => account.id, { primary: true })
  public accountId!: string;
}
