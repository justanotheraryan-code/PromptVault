import mongoose from 'mongoose'

const PromptUseSchema = new mongoose.Schema(
  {
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    author: { type: String, required: true, trim: true },
    usedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
)

export const PromptUse = mongoose.model('PromptUse', PromptUseSchema)
