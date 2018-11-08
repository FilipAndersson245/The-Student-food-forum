import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn({ readonly: true })
  public id!: string;

  @Column()
  public Nickname!: string;

  @Column()
  public Email!: string;

  @Column()
  public hash!: string;

  @Column()
  public image!: string;
}
