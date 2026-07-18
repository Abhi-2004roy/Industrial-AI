import User from '../models/User.js';
import BaseRepository from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findByRefreshToken(token) {
    return await User.findOne({ refreshToken: token });
  }

  async updateRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(userId, { refreshToken: token }, { new: true });
  }
}

export default new UserRepository();
