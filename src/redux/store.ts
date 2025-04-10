import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice'; // Correct path with alias

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;