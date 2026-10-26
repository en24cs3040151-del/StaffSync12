import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../api/notificationApi.js';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getMyNotifications({ limit: 10 });
      return {
        notifications: response.data,
        unreadCount: response.meta?.unreadCount || 0
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {
    decrementUnread: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { decrementUnread, resetUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
