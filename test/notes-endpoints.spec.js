const knex = require('knex');
const app = require('../src/app');
const { makeNotesArray } = require('./notes.fixtures');
const { makeFoldersArray } = require('./folders.fixtures');

describe('notes endpoints', () => {
  let db;

  before('make a knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () =>
    db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE')
  );

  afterEach('cleanup', () =>
    db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE')
  );

  describe('GET /notes ', () => {
    context(`Given no notes in the db`, () => {
      it('returns 200 and an empty array', () => {
        return supertest(app).get('/api/notes').expect(200, []);
      });
    });

    context(`Given there are notes and folders in the db`, () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert folders and notes into table', () => {
        return db('folders')
          .insert(testFolders)
          .then(() => db('notes').insert(testNotes));
      });

      it('returns 200 with an array of notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0]).to.be.an('object');
            expect(res.body[0]).to.have.all.keys(
              'id',
              'name',
              'modified',
              'folder_id',
              'content'
            );
          });
      });
    });
  });

  describe('POST /notes', () => {
    const testFolders = makeFoldersArray();

    beforeEach('insert folders into table for reference', () => {
      return db('folders').insert(testFolders);
    });

    const validNote = {
      name: 'Test Note',
      content: 'Test note content',
      folder_id: 3
    };

    it('should create a new note when valid info is provided', () => {
      return supertest(app)
        .post('/api/notes')
        .send(validNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(validNote.name);
          expect(res.body.content).to.eql(validNote.content);
          expect(res.body.folder_id).to.eql(validNote.folder_id);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        })
        .then(res => {
          return supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .expect(res.body);
        });
    });

    ['name', 'content', 'folder_id'].forEach(field => {
      it(`should respond with a 400 error if ${field} is missing`, () => {
        const invalidNote = {
          ...validNote
        };
        delete invalidNote[field];
        return supertest(app)
          .post('/api/notes')
          .send(invalidNote)
          .expect(400, {
            error: {
              message: `Missing ${field} in request body`
            }
          });
      });
    });
  });

  describe('DELETE /notes/:note_id', () => {
    context(`Given there are no notes in the db`, () => {
      it('returns 404 error when note id cannot be found', () => {
        const invalidId = 123456789;
        return supertest(app)
          .delete(`/api/notes/${invalidId}`)
          .expect(404, {
            error: {
              message: `Note doesn't exist`
            }
          });
      });
    });
    context(`Given there are notes in the db`, () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert folders and notes into table', () => {
        return db('folders')
          .insert(testFolders)
          .then(() => db('notes').insert(testNotes));
      });

      it('deletes the folder and responds with 204 when given valid id', () => {
        const validId = 2;
        const expectedNotes = testNotes.filter(note => note.id !== validId);
        return supertest(app)
          .delete(`/api/notes/${validId}`)
          .expect(204)
          .then(res => {
            return supertest(app).get('/api/notes').expect(expectedNotes);
          });
      });
    });
  });

  describe('PATCH /notes/:note_id', () => {
    context(`Given no notes in the database`, () => {
      it('returns a 404 error when note_id does not exist', () => {
        const invalidId = 123456789;
        return supertest(app)
          .patch(`/api/notes/${invalidId}`)
          .expect(404, {
            error: {
              message: `Note doesn't exist`
            }
          });
      });
    });

    context(`Given there are notes and folders in the database`, () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert folders and notes into table', () => {
        return db('folders')
          .insert(testFolders)
          .then(() => db('notes').insert(testNotes));
      });

      it('responds with 204 and updates the note', () => {
        const targetId = 2;
        const updatedNote = {
          name: 'Updated note name via patch',
          content: 'Updated note content via patch',
          folder_id: 3
        };

        const expectedNote = {
          ...testNotes[targetId - 1],
          ...updatedNote
        };

        return supertest(app)
          .patch(`/api/notes/${targetId}`)
          .send(updatedNote)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/notes/${targetId}`)
              .expect(expectedNote);
          });
      });
    });
  });
});
