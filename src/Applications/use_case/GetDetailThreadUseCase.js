/* eslint-disable no-param-reassign */
class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThread(threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    threadDetail.comments = this.transformComments(threadDetail.comments);
    threadDetail.comments = this.sortCommentsByDateAscending(threadDetail.comments);

    return threadDetail;
  }

  transformComments(comments) {
    return comments.map((comment) => {
      if (comment.isDeleted) {
        comment.content = '**komentar telah dihapus**';
      }
      delete comment.isDeleted;
      return comment;
    });
  }

  sortCommentsByDateAscending(comments) {
    comments.sort((a, b) => {
      const date1 = Date.parse(a.date);
      const date2 = Date.parse(b.date);
      return date1 - date2;
    });
    return comments;
  }
}

module.exports = GetDetailThreadUseCase;
