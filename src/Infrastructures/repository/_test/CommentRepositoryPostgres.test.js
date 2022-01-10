const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  const user = {
    id: 'user-123',
    username: 'dicoding',
    password: 'dicoding',
    fullname: 'dicoding',
  };

  const thread = {
    id: 'thread-123',
    title: '123',
    body: 'Dicoding Indonesia',
    owner: user.id,
  };

  let addedThread;

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(user);
    addedThread = await ThreadsTableTestHelper.addThread(thread);
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // arrange
      const newComment = new NewComment({
        content: '123',
        threadId: addedThread.id,
        owner: user.id,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);
      const foundComment = await CommentsTableTestHelper.findCommentById(addedComment.id);

      // assert
      expect(addedComment).toEqual(new AddedComment({
        id: foundComment.id,
        content: foundComment.content,
        owner: foundComment.owner,
      }));
    });
  });

  describe('isCommentExist function', () => {
    it('should not throw error when comment exist', async () => {
      // arrange
      const newComment = {
        id: '123',
        content: '123',
        threadId: addedThread.id,
        owner: user.id,
      };

      await CommentsTableTestHelper.addComment(newComment);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action & assert
      await expect(commentRepositoryPostgres.isCommentExist(newComment.threadId, newComment.id))
        .resolves
        .not.toThrowError();
    });

    it('should throw error when comment does not exist', async () => {
      // arrange
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action & assert
      await expect(commentRepositoryPostgres.isCommentExist('123123', '123123'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwnerhip function', () => {
    it('should not throw error when userId is the owner', async () => {
      // arrange
      const newComment = {
        id: '123',
        content: '123',
        threadId: addedThread.id,
        owner: user.id,
      };

      await CommentsTableTestHelper.addComment(newComment);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action & assert
      await expect(commentRepositoryPostgres
        .verifyCommentOwnerhip(newComment.id, newComment.owner))
        .resolves
        .not.toThrowError();
    });

    it('should throw error when userId is not the owner', async () => {
      const newComment = {
        id: '123',
        content: '123',
        threadId: addedThread.id,
        owner: user.id,
      };

      await CommentsTableTestHelper.addComment(newComment);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action & assert
      await expect(commentRepositoryPostgres.verifyCommentOwnerhip(newComment.id, '123123'))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment by id', async () => {
      // arrange
      const newComment = {
        id: '123',
        content: '123',
        threadId: addedThread.id,
        owner: user.id,
      };

      await CommentsTableTestHelper.addComment(newComment);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action
      await commentRepositoryPostgres.deleteComment(newComment.id);
      const comment = await CommentsTableTestHelper.findCommentById(newComment.id);

      // assert
      expect(comment.is_deleted).toEqual(true);
    });

    it('should throw error comment not found', async () => {
      // arrange
      const invalidCommentId = 'hmhmhmhmhmhm';

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      // action & assert
      await expect(commentRepositoryPostgres.deleteComment(invalidCommentId))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should get comments by thread id', async () => {
      const threadId = thread.id;
      const comment1 = {
        id: '123',
        threadId,
        owner: user.id,
        content: '123',
        date: new Date().toISOString(),
        isDeleted: false,
      };
      await CommentsTableTestHelper.addComment(comment1);

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeIdGenerator,
      );

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);
      expect(comments).toEqual([
        new DetailComment({ ...comment1, username: user.username }),
      ]);
    });
  });
});
