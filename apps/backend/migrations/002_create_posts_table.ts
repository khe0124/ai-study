/**
 * Posts 테이블 생성 마이그레이션
 */

import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("posts", (table) => {
    table.string("id").primary();
    table.string("title", 200).notNullable();
    table.text("content").notNullable();
    table.string("author_id").notNullable();
    table.text("thumbnail_image").nullable();
    table.specificType("attachments", "text[]").defaultTo("{}");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Foreign key
    table
      .foreign("author_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // 인덱스
    table.index("author_id");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("posts");
}
