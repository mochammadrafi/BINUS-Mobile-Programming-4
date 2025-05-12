import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Ensure the auth check has had time to complete
  useEffect(() => {
    if (!isLoading) {
      setInitialCheckDone(true);
    }
  }, [isLoading]);

  // Don't redirect until initial check is done to prevent flash redirects
  if (!initialCheckDone) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Explicitly redirect to the appropriate screen
  if (user) {
    return <Redirect href="/(app)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
