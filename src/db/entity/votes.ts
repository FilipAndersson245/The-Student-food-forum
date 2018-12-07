import { Entity, ManyToOne, Column } from "typeorm";
import { Recipes } from "./recipes";
import { Accounts } from "./accounts";

@Entity()
export class Votes {
  @Column({ type: "tinyint" })
  public vote!: number;

  @ManyToOne((_type) => Recipes, (recipes) => recipes.votes, {
    primary: true
  })
  public recipes!: Recipes;

  @ManyToOne((_type) => Accounts, (accounts) => accounts.votes, {
    primary: true
  })
  public accounts!: Accounts;
}
