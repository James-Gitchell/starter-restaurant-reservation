// Create the table's table, add a key, table name and capacity. 
exports.up = function(knex) {
    return knex.schema.createTable("tables", (table) => {
        table.increments("table_id").primary();
        table.string("table_name").notNullable();
        table.integer("capacity").unsigned().notNullable();
        table.timestamps(true,true);
    })
  
};

// Drop the table's table on roll back. 
exports.down = function(knex) {
    return knex.raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
        .then(()=>knex.schema.dropTable("tables"));
};