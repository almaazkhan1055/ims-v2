import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionData, UserRole } from '../types';
import { AuthService } from '../auth';

interface AuthState {
  isAuthenticated: boolean;
  user: SessionData | null;
  role: UserRole | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<SessionData>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.role = action.payload.role;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.loading = false;
    },
    initializeSession: (state, action: PayloadAction<SessionData | null>) => {
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
      state.role = action.payload?.role || null;
      state.loading = false;
    },
  },
});

export const { setLoading, loginSuccess, logout, initializeSession } = authSlice.actions;

// Thunk for login
export const loginAsync = (credentials: any) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const session = await AuthService.login(credentials);
    dispatch(loginSuccess(session));
  } catch (error) {
    dispatch(setLoading(false));
    throw error;
  }
};

// Thunk for logout
export const logoutAsync = () => async (dispatch: any) => {
  AuthService.clearSession();
  dispatch(logout());
};

// Thunk for initializing session
export const initializeSessionAsync = () => async (dispatch: any) => {
  try {
    const session = AuthService.getSession();
    dispatch(initializeSession(session));
  } catch (error) {
    console.error('Failed to initialize auth session:', error);
    dispatch(initializeSession(null));
  }
};

// Selector for permissions
export const selectPermissions = (state: { auth: AuthState }) => {
  const { role } = state.auth;

  const rolePermissions = {
    admin: [
      'view_dashboard',
      'manage_candidates',
      'view_candidates',
      'manage_roles',
      'view_feedback',
      'view_all_feedback',
      'submit_feedback'
    ],
    ta_member: [
      'view_dashboard',
      'manage_candidates',
      'view_candidates',
      'view_feedback',
      'view_all_feedback'
    ],
    panelist: [
      'view_dashboard',
      'view_candidates',
      'view_own_feedback',
      'submit_feedback'
    ],
  };

  return rolePermissions[role as keyof typeof rolePermissions] || [];
};

// Selector for hasPermission
export const selectHasPermission = (state: { auth: AuthState }) => {
  const permissions = selectPermissions(state);
  return (permission: string): boolean => {
    return permissions.includes(permission);
  };
};

export default authSlice.reducer;
