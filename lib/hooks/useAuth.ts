import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { 
  loginAsync, 
  logoutAsync, 
  initializeSessionAsync,
  selectHasPermission 
} from '../slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, role, loading } = useAppSelector((state) => state.auth);
  const hasPermission = useAppSelector(selectHasPermission);

  useEffect(() => {
    dispatch(initializeSessionAsync());
  }, [dispatch]);

  const login = async (credentials: any) => {
    await dispatch(loginAsync(credentials));
  };

  const logout = () => {
    dispatch(logoutAsync());
  };

  return {
    isAuthenticated,
    user,
    role,
    loading,
    login,
    logout,
    hasPermission,
  };
}
