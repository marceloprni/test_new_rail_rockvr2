import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refeicao', (table) => {
    table.uuid('id').primary()
    table.text('refeicao').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('dieta').notNullable()
    table.uuid('user_id').unsigned()
    table.foreign('user_id').references('user.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('refeicao')
}
