import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi.js';

const initialToken = localStorage.getItem('staffsync_token');
let initialUser = null;
try {
  initialUser = JSON.parse(localStorage.getItem('staffsync_user'));
} catch {
  initialUser = null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('staffsync_token', token);
      localStorage.setItem('staffsync_user', JSON.stringify(user));
      return { token, user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      const user = response.data;
      localStorage.setItem('staffsync_user', JSON.stringify(user));
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch current user';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      if (state.user) {
        state.user.employee = action.payload;
        localStorage.setItem('staffsync_user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Current User
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

export const { logout, clearError, updateProfileSuccess } = authSlice.actions;
export default authSlice.reducer;
