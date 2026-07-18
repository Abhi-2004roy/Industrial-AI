export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, options = {}) {
    return await this.model.findById(id, options.select || '-__v').populate(options.populate || []);
  }

  async findOne(query, options = {}) {
    return await this.model.findOne(query, options.select || '-__v').populate(options.populate || []);
  }

  async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '-__v',
      populate = [],
    } = options;

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.model.find(query, select).populate(populate).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return await this.model.countDocuments(query);
  }
}

export default BaseRepository;
