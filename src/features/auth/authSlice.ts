import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: 'admin' | 'planner' | 'client' | null;
  name: string | null; // Add name
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role') as 'admin' | 'planner' | 'client' | null,
  name: localStorage.getItem('name'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ token: string; role: 'admin' | 'planner' | 'client'; name: string }>
    ) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.name = action.payload.name;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('name', action.payload.name);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.name = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;


