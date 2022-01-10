const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, threadId, owner } = comment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, threadId, owner, content, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async isCommentExist(threadId, commentId) {
    const query = {
      text: `SELECT *
              FROM comments AS c
              INNER JOIN threads AS t
              ON c.thread_id = t.id
              WHERE t.id = $1
              AND c.id = $2
      `,
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwnerhip(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('tidak memiliki hak akses');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: `UPDATE comments
              SET is_deleted=TRUE
              WHERE id=$1 RETURNING id
            `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id,
              u.username,
              c.date,
              c.content,
              c.is_deleted
              FROM comments AS c
              INNER JOIN users AS u
              ON c.owner = u.id
              WHERE c.thread_id = $1`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows.map((entry) => new DetailComment({
      ...entry, isDeleted: entry.is_deleted,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
