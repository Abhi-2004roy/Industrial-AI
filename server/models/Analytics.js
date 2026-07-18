import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      dailyUploads: { type: Number, default: 0 },
      dailyViews: { type: Number, default: 0 },
      dailyDownloads: { type: Number, default: 0 },
      dailyChats: { type: Number, default: 0 },
      dailySearches: { type: Number, default: 0 },
      topCategories: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        count: { type: Number, default: 0 },
      }],
      topDocuments: [{
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        count: { type: Number, default: 0 },
      }],
      searchQueries: [{
        query: String,
        count: { type: Number, default: 0 },
      }],
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ date: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
