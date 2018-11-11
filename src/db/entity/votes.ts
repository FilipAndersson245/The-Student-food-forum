import { Entity, ManyToOne, Column } from "typeorm";
import { Recipes } from "./recipes";
import { Users } from "./users";

@Entity()
export class Votes {
  @Column({ type: "tinyint" })
  public vote!: number;

  @ManyToOne((_type) => Recipes, (recipes) => recipes.id, { primary: true })
  public recieptId!: string;

  @ManyToOne((_type) => Users, (users) => users.id, { primary: true })
  public userId!: string;
}
