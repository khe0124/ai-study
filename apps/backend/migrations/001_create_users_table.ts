/**
 * Users 테이블 생성 마이그레이션
 */

import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.string("id").primary();
    table.string("email", 255).notNullable().unique();
    table.text("password").nullable();
    table.string("provider", 50).notNullable().defaultTo("email");
    table.string("provider_id", 255).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // 인덱스
    table.index("email");
    table.index("provider");
    table.index(["provider", "provider_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
