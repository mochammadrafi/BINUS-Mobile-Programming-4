import { Platform } from 'react-native';

// Export the auth interface
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Export the auth implementation based on platform
let Auth: {
  signInWithGoogle: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<AuthUser | null>;
};

if (Platform.OS === 'web') {
  const { WebAuth } = require('./WebAuth');
  Auth = new WebAuth();
} else {
  const { NativeAuth } = require('./NativeAuth');
  Auth = new NativeAuth();
}

export default Auth;
