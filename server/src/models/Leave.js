import mongoose from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUS } from '../config/constants.js';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: LEAVE_TYPES,
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    daysCount: {
      type: Number,
      required: [true, 'Days count is required'],
      min: [0.5, 'Minimum leave is 0.5 day']
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      trim: true,
      minlength: [5, 'Reason must be at least 5 characters long']
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    reviewReason: {
      type: String,
      default: '',
      trim: true
    },
    reviewTimestamp: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for checking overlapping leaves
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1, status: 1 });

export const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
