const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  const user = {
    id: 'user-dicoding',
    username: 'dicoding',
    password: 'dicoding',
    fullname: 'dicoding',
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(user);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread user correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: '123',
        body: 'Dicoding Indonesia',
        owner: user.id,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread);
      const result = await ThreadsTableTestHelper.findThreadById('thread-123');

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: '123',
        body: 'Dicoding Indonesia',
        owner: user.id,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: addThread.title,
        owner: addThread.owner,
      }));
    });
  });

  describe('getThread function', () => {
    it('should return NotFoundError when thread is not found', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: '123',
        body: 'Dicoding Indonesia',
        date: new Date().toISOString(),
        owner: user.id,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await ThreadsTableTestHelper.addThread(thread);

      // action & assert
      await expect(threadRepositoryPostgres.getThread('thread-123123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: '123',
        body: 'Dicoding Indonesia',
        date: new Date().toISOString(),
        owner: user.id,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addedThread = await ThreadsTableTestHelper.addThread(thread);

      // action
      const result = await threadRepositoryPostgres.getThread(addedThread.id);

      // assert
      expect(result.id).toStrictEqual(addedThread.id);
      expect(result.title).toStrictEqual(addedThread.title);
      expect(result.body).toStrictEqual(addedThread.body);
      expect(result.username).toStrictEqual(user.username);
      expect(result.date).toStrictEqual(addedThread.date);
    });
  });
});
