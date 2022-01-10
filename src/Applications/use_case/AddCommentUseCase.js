const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({
    threadRepository, commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(commentPayload, threadId, userId) {
    await this._threadRepository.getThread(threadId);
    const newComment = new NewComment({
      ...commentPayload, owner: userId, threadId,
    });
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
