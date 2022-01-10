const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const userId = '123';
    const threadId = '123';
    const payload = {
      content: 'dicoding',
    };
    const newComment = new NewComment({
      ...payload,
      owner: userId,
      threadId,
    });
    const expectedAddedComment = new AddedComment({
      id: '123',
      content: payload.content,
      owner: userId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(payload, threadId, userId);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(newComment);
    expect(addedComment).toEqual(expectedAddedComment);
  });
});
