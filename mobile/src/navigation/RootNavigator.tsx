import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RootNavigator = () => {
  const { token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingSpinner fullScreen message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
