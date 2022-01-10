class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = payload.content;
    this.isDeleted = payload.isDeleted;
  }

  _verifyPayload({ id, username, date, content, isDeleted }) {
    if (!id || !username || !date || !content || isDeleted === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string'
      || typeof date !== 'string' || typeof content !== 'string'
      || typeof isDeleted !== 'boolean') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
