const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const userId = '123';
    const commentId = '123';
    const threadId = '123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.isCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwnerhip = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, userId);

    // Assert
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(threadId, commentId);
    expect(mockCommentRepository.verifyCommentOwnerhip).toBeCalledWith(commentId, userId);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });
});
