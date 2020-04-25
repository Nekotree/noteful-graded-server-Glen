const FoldersService = {
  getAllFolders(knex) {
    return knex('folders').select('*');
  },
  getById(knex, id) {
    return knex('folders').select('*').where({ id }).first();
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('folders')
      .returning('*')
      .then(rows => rows[0]);
  },
  deleteFolder(knex, id) {
    return knex('folders').where({ id }).delete();
  },
  updateFolder(knex, id, newFolderFields) {
    return knex('folders').where({ id }).update(newFolderFields);
  }
};

module.exports = FoldersService;
