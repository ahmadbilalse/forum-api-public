const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const userId = request.auth.credentials.id;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(
      request.payload, request.params.threadId, userId,
    );
    const response = h.response({
      status: 'success',
      data: {
        addedComment: {
          id: addedComment.id,
          content: addedComment.content,
          owner: addedComment.owner,
        },
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const userId = request.auth.credentials.id;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(request.params.threadId, request.params.commentId, userId);
    return h.response({
      status: 'success',
    });
  }
}

module.exports = CommentsHandler;
