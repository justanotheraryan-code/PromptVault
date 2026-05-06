import mongoose from 'mongoose'

const PromptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['writing', 'code', 'strategy', 'analysis'],
      default: 'writing',
    },
    tags: { type: [String], default: [] },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    author: { type: String, required: true, trim: true },
    qualityScore: { type: Number, min: 0, max: 5, default: 0 },
    qualityRatings: { type: Number, default: 0 },
    useCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

PromptSchema.index({ title: 'text', body: 'text', tags: 'text' })

export const Prompt = mongoose.model('Prompt', PromptSchema)
