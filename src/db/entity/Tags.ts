import { Entity, PrimaryColumn, ManyToMany } from "typeorm";
import { Recipes } from "./recipes";
@Entity()
export class Tags {
  @PrimaryColumn({
    type: "varchar",
    width: 64,
    readonly: true,
    unique: true,
    primary: true
  })
  public id!: string;

  @ManyToMany((_type) => Recipes, (recipes) => recipes.tags)
  public recipes!: Array<Recipes>;
}
