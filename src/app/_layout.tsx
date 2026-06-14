import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '@/components/AuthScreen';
import { TabBar } from '@/components/TabBar';
import { useStore } from '@/data/store';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="spesa" />
      <Tabs.Screen name="ricette" />
    </Tabs>
  );
}

function Gate() {
  const { palette } = useTheme();
  const { session, loading, configured } = useAuth();
  const hydrate = useStore((s) => s.hydrate);

  // Al login (sessione presente) carica i dati della household da Supabase.
  useEffect(() => {
    if (session) hydrate();
  }, [session, hydrate]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg }}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  // Senza credenziali Supabase l'app resta usabile in locale (fase offline-first).
  if (configured && !session) return <AuthScreen />;
  return <AppTabs />;
}

export default function RootLayout() {
  const { scheme } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Gate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
