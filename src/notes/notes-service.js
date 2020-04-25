const NotesService = {
  getAllNotes(knex) {
    return knex('notes').select('*');
  },
  insertNote(knex, newNote) {
    return knex('notes')
      .insert(newNote)
      .returning('*')
      .then(rows => rows[0]);
  },
  getById(knex, id) {
    return knex('notes').select('*').where({ id }).first();
  },
  deleteNote(knex, id) {
    return knex('notes').where({ id }).delete();
  },
  updateNote(knex, id, newNoteFields) {
    return knex('notes').where({ id }).update(newNoteFields);
  }
};

module.exports = NotesService;
