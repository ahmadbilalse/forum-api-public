const AddThreadUseCase = require('../AddThreadUseCase');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const userId = '123';
    const payload = {
      title: 'dicoding',
      body: 'secret',
    };
    const newThread = new AddThread({
      ...payload,
      owner: userId,
    });
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: payload.title,
      owner: userId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    /** creating use case instance */
    const getUserUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getUserUseCase.execute(payload, userId);

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledWith(newThread);
    expect(addedThread).toEqual(expectedAddedThread);
  });
});
