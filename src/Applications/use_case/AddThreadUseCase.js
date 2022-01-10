const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadPayload, userId) {
    const addThread = new AddThread({ ...threadPayload, owner: userId });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
