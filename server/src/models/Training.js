import mongoose from 'mongoose';
import { TRAINING_STATUS, DEPARTMENTS } from '../config/constants.js';

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true
    },
    scheduleDate: {
      type: Date,
      required: [true, 'Schedule date is required']
    },
    durationHours: {
      type: Number,
      required: [true, 'Duration in hours is required'],
      min: [0.5, 'Duration must be at least 0.5 hour']
    },
    capacity: {
      type: Number,
      default: 30,
      min: [1, 'Capacity must be at least 1']
    },
    enrollments: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ['ENROLLED', 'COMPLETED', 'CANCELLED'],
          default: 'ENROLLED'
        }
      }
    ],
    status: {
      type: String,
      enum: Object.values(TRAINING_STATUS),
      default: TRAINING_STATUS.UPCOMING,
      index: true
    },
    department: {
      type: String,
      enum: [...DEPARTMENTS, null, '', 'All'],
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Training = mongoose.model('Training', trainingSchema);
export default Training;
