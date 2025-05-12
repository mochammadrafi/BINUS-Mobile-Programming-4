// Web implementation for authentication

import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the auth interface
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Google OAuth client ID
const CLIENT_ID = '985304237129-6311jtqjg56c17mpvamsomqoh5noipak.apps.googleusercontent.com'; // Your Google Client ID here

export class WebAuth {
  // Sign in with Google using web approach
  async signInWithGoogle(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      // Store the original window reference
      const origin = window.location.origin;
      
      // Create Google OAuth URL
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const searchParams = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: `${origin}/auth/google`,
        response_type: 'token',
        scope: 'profile email',
        prompt: 'select_account'
      });
      
      // Open popup
      const popup = window.open(
        `${googleAuthUrl}?${searchParams.toString()}`,
        'Google Sign In',
        'width=500,height=600'
      );
      
      // Handle message from popup
      window.addEventListener('message', async (event) => {
        if (event.origin !== origin) return;
        if (event.data && event.data.type === 'google_auth') {
          const { token } = event.data;
          
          try {
            // Get user profile with token
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const userData = await response.json();
            
            if (userData && userData.email) {
              const user: AuthUser = {
                id: userData.id || userData.sub,
                name: userData.name,
                email: userData.email,
                picture: userData.picture
              };
              
              // Save user data
              await AsyncStorage.setItem('user', JSON.stringify(user));
              await AsyncStorage.setItem('token', token);
              
              resolve(user);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
            resolve(null);
          }
          
          // Close popup
          if (popup) popup.close();
        }
      });
      
      // Backup timeout to close popup if something goes wrong
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close();
          resolve(null);
        }
      }, 60000);
    });
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
