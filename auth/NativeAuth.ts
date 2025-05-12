import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Define the auth interface
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Configuration for Google OAuth
const config = {
  clientId: '985304237129-6311jtqjg56c17mpvamsomqoh5noipak.apps.googleusercontent.com', // Your Google Client ID here
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'binusta4'
  }),
  scopes: ['profile', 'email']
};

export class NativeAuth {
  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      // Google OAuth flow
      const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
      const request = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
      });
      
      const result = await request.promptAsync(discovery);
      
      if (result.type === 'success') {
        // Get user info from Google
        const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${result.authentication?.accessToken}` }
        });
        
        const userData = await response.json();
        
        // Save user data
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', result.authentication?.accessToken || '');
        
        return userData as AuthUser;
      }
      return null;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData) as AuthUser;
    }
    return null;
  }
}
