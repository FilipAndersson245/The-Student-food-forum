import { Entity, ManyToOne, Column } from "typeorm";
import { Recipes } from "./recipes";
import { Accounts } from "./accounts";

@Entity()
export class Votes {
  @Column({ type: "tinyint" })
  public vote!: number;

  @ManyToOne((_type) => Recipes, (recipes) => recipes.id, { primary: true })
  public recipesId!: string;

  @ManyToOne((_type) => Accounts, (accounts) => accounts.id, { primary: true })
  public accountsId!: string;
}
