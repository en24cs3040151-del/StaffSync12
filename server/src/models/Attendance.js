import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../config/constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true
    },
    attendanceDate: {
      type: String, // Normalized YYYY-MM-DD
      required: [true, 'Attendance date is required'],
      index: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD']
    },
    checkInTime: {
      type: Date,
      default: null
    },
    checkOutTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
      index: true
    },
    workedMinutes: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce one attendance record per employee per work date
attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
