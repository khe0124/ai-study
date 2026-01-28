/**
 * Comments 테이블 생성 마이그레이션
 */

import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("comments", (table) => {
    table.string("id").primary();
    table.string("post_id").notNullable();
    table.string("author_id").notNullable();
    table.string("content", 1000).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("post_id")
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE");
    table
      .foreign("author_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // 인덱스
    table.index("post_id");
    table.index("author_id");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("comments");
}
