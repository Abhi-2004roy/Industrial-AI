import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a chat title'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        sources: [
          {
            documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
            pageNumber: Number,
            quote: String,
            score: Number,
          },
        ],
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ user: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
