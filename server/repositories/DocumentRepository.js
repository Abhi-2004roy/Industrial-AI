import Document from '../models/Document.js'
import BaseRepository from './BaseRepository.js'

class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document)
  }

  async findByUploader(uploaderId, options = {}) {
    return this.findAll({ uploader: uploaderId }, options)
  }
}

export default new DocumentRepository()
