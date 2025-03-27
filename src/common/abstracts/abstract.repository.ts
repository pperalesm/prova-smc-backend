import { EntityManager, ObjectLiteral, ObjectType } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class AbstractRepository<T extends ObjectLiteral> {
  constructor(
    protected entityManager: EntityManager,
    private entityType: ObjectType<T>,
  ) {}

  async insertOne(
    values: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ): Promise<number> {
    const entityManager = manager ?? this.entityManager;

    const res = await entityManager
      .createQueryBuilder()
      .insert()
      .into(this.entityType)
      .values(values)
      .execute();

    return res.identifiers[0]["id"];
  }

  async insertOneOrIgnore(
    values: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ): Promise<number | undefined> {
    const entityManager = manager ?? this.entityManager;

    const res = await entityManager
      .createQueryBuilder()
      .insert()
      .into(this.entityType)
      .values(values)
      .orIgnore()
      .execute();

    return res.identifiers[0]?.["id"];
  }

  async insertMany(
    values: QueryDeepPartialEntity<T>[],
    manager?: EntityManager,
  ): Promise<number[]> {
    const entityManager = manager ?? this.entityManager;

    const res = await entityManager
      .createQueryBuilder()
      .insert()
      .into(this.entityType)
      .values(values)
      .execute();

    return res.identifiers.map((item) => item["id"]);
  }

  async updateOneById(
    id: number,
    values: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ) {
    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .update(this.entityType)
      .set(values)
      .where("id = :id", { id })
      .execute();
  }

  async updateManyById(
    ids: number[],
    values: QueryDeepPartialEntity<T>[],
    manager?: EntityManager,
  ) {
    if (!ids.length) {
      return;
    }

    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .update(this.entityType)
      .set(values)
      .whereInIds(ids)
      .execute();
  }

  async deleteOneById(id: number, manager?: EntityManager) {
    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .delete()
      .from(this.entityType)
      .where("id = :id", { id })
      .execute();
  }

  async deleteManyById(ids: number[], manager?: EntityManager) {
    if (!ids.length) {
      return;
    }

    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .delete()
      .from(this.entityType)
      .whereInIds(ids)
      .execute();
  }

  async softDeleteOneById(id: number, manager?: EntityManager) {
    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .softDelete()
      .from(this.entityType)
      .where("id = :id", { id })
      .execute();
  }

  async softDeleteManyById(ids: number[], manager?: EntityManager) {
    if (!ids.length) {
      return;
    }

    const entityManager = manager ?? this.entityManager;

    await entityManager
      .createQueryBuilder()
      .softDelete()
      .from(this.entityType)
      .whereInIds(ids)
      .execute();
  }

  async findOneById(id: number, manager?: EntityManager): Promise<T | null> {
    const entityManager = manager ?? this.entityManager;

    return await entityManager
      .createQueryBuilder(this.entityType, "entity")
      .where("entity.id = :id", { id })
      .getOne();
  }

  async findManyById(ids: number[], manager?: EntityManager): Promise<T[]> {
    if (!ids.length) {
      return [];
    }

    const entityManager = manager ?? this.entityManager;

    return await entityManager
      .createQueryBuilder(this.entityType, "entity")
      .whereInIds(ids)
      .getMany();
  }

  async incrementOneById(
    id: number,
    increments: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ) {
    const entityManager = manager ?? this.entityManager;

    const values: Record<string, () => string> = {};
    for (const key of Object.keys(increments)) {
      values[key] = () => `"${key}" + :${key}`;
    }

    return await entityManager
      .createQueryBuilder()
      .update(this.entityType)
      .set(values)
      .setParameters(increments)
      .where("id = :id", { id })
      .execute();
  }
}
