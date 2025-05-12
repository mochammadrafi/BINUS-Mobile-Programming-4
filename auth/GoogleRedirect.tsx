import { useEffect } from 'react';
import { Text, View } from 'react-native';

// This component is used as a redirect target for Google OAuth on web platform
export default function GoogleRedirect() {
  useEffect(() => {
    const handleRedirect = () => {
      // The hash contains the access token, parse it
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      
      if (token) {
        // Send the token back to the opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: 'google_auth', token },
            window.location.origin
          );
        }
      }
      
      // Close this window/tab
      window.close();
    };

    handleRedirect();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Completing authentication...</Text>
    </View>
  );
}
