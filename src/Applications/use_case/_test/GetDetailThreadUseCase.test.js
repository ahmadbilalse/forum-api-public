const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const threadId = '123';
    const getCommentsByThreadIdComments = [
      new DetailComment({
        id: '222',
        username: '222',
        date: new Date(1000).toISOString(),
        content: '222',
        isDeleted: false,
      }),
      new DetailComment({
        id: '111',
        username: '111',
        date: new Date(0).toISOString(),
        content: '111',
        isDeleted: true,
      }),
    ];

    const transformedComments = [
      {
        id: '111',
        username: '111',
        date: new Date(0).toISOString(),
        content: '**komentar telah dihapus**',
      },
      {
        id: '222',
        username: '222',
        date: new Date(1000).toISOString(),
        content: '222',
      },
    ];

    const sortedComments = [
      {
        id: '111',
        username: '111',
        date: new Date(0).toISOString(),
        content: '**komentar telah dihapus**',
      },
      {
        id: '222',
        username: '222',
        date: new Date(1000).toISOString(),
        content: '222',
      },
    ];

    const getThreadDetailThread = new DetailThread({
      id: threadId,
      title: '123',
      body: '123',
      date: '123',
      username: '123',
      comments: [],
    });

    const expectedDetailThread = new DetailThread({
      id: threadId,
      title: '123',
      body: '123',
      date: '123',
      username: '123',
      comments: sortedComments,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(getThreadDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(getCommentsByThreadIdComments));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const spyTransformComments = jest.spyOn(getDetailThreadUseCase, 'transformComments');
    const spysortCommentsByDateAscending = jest.spyOn(getDetailThreadUseCase, 'sortCommentsByDateAscending');

    // Action
    const detailThread = await getDetailThreadUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(spyTransformComments).toHaveBeenCalledWith(getCommentsByThreadIdComments);
    expect(spysortCommentsByDateAscending).toHaveBeenCalledWith(transformedComments);
    expect(detailThread).toEqual(expectedDetailThread);
  });
});
