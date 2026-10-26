import mongoose from 'mongoose';
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_STATUS,
  DEPARTMENTS
} from '../config/constants.js';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Author reference is required']
    },
    audience: {
      type: String,
      enum: ANNOUNCEMENT_AUDIENCES,
      default: 'ALL',
      index: true
    },
    department: {
      type: String,
      enum: [...DEPARTMENTS, null, ''],
      default: null
    },
    priority: {
      type: String,
      enum: ANNOUNCEMENT_PRIORITIES,
      default: 'NORMAL',
      index: true
    },
    publicationStatus: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_STATUS),
      default: ANNOUNCEMENT_STATUS.PUBLISHED,
      index: true
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
