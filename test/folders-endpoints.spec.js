const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');

describe('Folders endpoints', () => {
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

  describe('GET /api/folders', () => {
    context(`Given there are NO folders in the db`, () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app).get('/api/folders').expect(200, []);
      });
    });

    context(`Given there are folders in the db`, () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert test folders', () => {
        return db('folders').insert(testFolders);
      });

      it('responds with 200 and all folders', () => {
        return supertest(app).get('/api/folders').expect(200, testFolders);
      });
    });
  });

  describe('POST /api/folders', () => {
    const validFolder = {
      name: 'Valid Folder'
    };

    it('should create a new folder when name is provided', () => {
      return supertest(app)
        .post('/api/folders')
        .send(validFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(validFolder.name);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(res => {
          return supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body);
        });
    });

    it('should send back a 400 error if name is not provided', () => {
      const invalidFolder = {
        invalid: 'invalid'
      };
      return supertest(app)
        .post('/api/folders')
        .send(invalidFolder)
        .expect(400);
    });
  });

  describe('DELETE /api/folder/:folder_id', () => {
    context(`Given there are folders in the db`, () => {
      const testFolders = makeFoldersArray();
      beforeEach('insert folders', () =>
        db.into('folders').insert(testFolders)
      );

      it('deletes a folder when the provided id is valid', () => {
        const folderId = 2;
        return supertest(app).delete(`/api/folders/${folderId}`).expect(204);
      });
    });

    context(`Given there are no folders in the db`, () => {
      it('sends back a 404 error when folder id cannot be found', () => {
        const invalidFolderId = 123456789;
        return supertest(app)
          .delete(`/api/folders/${invalidFolderId}`)
          .expect(404);
      });
    });
  });

  describe('PATCH /api/folder/:folder_id', () => {
    context(`Given no folders in the db`, () => {
      it('returns a 404 error when folder_id does not exist', () => {
        const invalidFolderId = 123456789;
        return supertest(app)
          .patch(`/api/folders/${invalidFolderId}`)
          .expect(404, {
            error: {
              message: `Folder doesn't exist`
            }
          });
      });
    });

    context(`Given there are folders in the db`, () => {
      const testFolders = makeFoldersArray();
      beforeEach('insert folders', () =>
        db.into('folders').insert(testFolders)
      );

      it('responds with 204 and upadtes the folder', () => {
        const targetId = 2;
        const updatedFolder = {
          name: 'Folder Update Name 987'
        };

        const expectedFolder = {
          ...testFolders[targetId - 1],
          ...updatedFolder
        };

        return supertest(app)
          .patch(`/api/folders/${targetId}`)
          .send(updatedFolder)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/folders/${targetId}`)
              .expect(expectedFolder);
          });
      });
    });
  });
});
