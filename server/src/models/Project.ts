import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  pages: any[];
  settings: {
    fonts: string[];
    globalStyles: string;
    primaryColor: string;
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name:        { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '' },
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pages:       { type: Schema.Types.Mixed, default: [] },
  settings: {
    fonts:        { type: [String], default: ['Inter'] },
    globalStyles: { type: String, default: '' },
    primaryColor: { type: String, default: '#6370f1' },
  },
  version: { type: Number, default: 1 },
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
