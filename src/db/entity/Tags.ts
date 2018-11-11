import { Entity, PrimaryColumn } from "typeorm";

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
}
