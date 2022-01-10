class DeleteCommentUseCase {
  constructor({
    commentRepository,
  }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._commentRepository.isCommentExist(threadId, commentId);
    await this._commentRepository.verifyCommentOwnerhip(commentId, userId);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
