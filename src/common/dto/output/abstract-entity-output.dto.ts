import { AbstractEntity } from "../../abstracts/abstract.entity";

export abstract class AbstractEntityOutputDto {
  id: number;
  createdAt: Date;

  constructor(abstractEntity: AbstractEntity) {
    this.id = abstractEntity.id;
    this.createdAt = abstractEntity.createdAt;
  }
}
