import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a tag name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Tag name cannot be more than 50 characters'],
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ name: 1 });

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;
