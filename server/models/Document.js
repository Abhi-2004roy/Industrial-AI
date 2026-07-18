import mongoose from 'mongoose';
import { DOCUMENT_STATUS } from '../constants/index.js';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a document title'],
      trim: true,
      maxlength: [255, 'Title cannot be more than 255 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      default: 'local',
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PENDING,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    metadata: {
      pageCount: Number,
      wordCount: Number,
      extractedText: String,
    },
    processingError: String,
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ title: 'text', description: 'text' });
documentSchema.index({ uploader: 1, createdAt: -1 });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
