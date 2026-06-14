import { Boxes } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/theme';

import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Screen } from './ui/Screen';
import { Text } from './ui/Text';

export function AuthScreen() {
  const { palette } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    if (!email.includes('@')) return setError('Inserisci un’email valida');
    if (password.length < 6) return setError('La password deve avere almeno 6 caratteri');

    setBusy(true);
    setError(null);
    setInfo(null);

    const creds = { email: email.trim(), password };
    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds);

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    // Se la conferma email è attiva, lo signup non restituisce subito la sessione.
    if (mode === 'signup' && !data.session) {
      setInfo('Account creato. Se richiesto, conferma l’email e poi accedi.');
      setMode('signin');
    }
    // Al successo onAuthStateChange aggiorna la sessione ed entra nell'app.
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.xl }}>
        <View style={{ alignItems: 'center', marginBottom: space.xxl }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.lg,
              backgroundColor: palette.accentWash,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: space.lg,
            }}>
            <Boxes size={32} color={palette.accent} strokeWidth={2.2} />
          </View>
          <Text variant="display">Cambusa</Text>
          <Text variant="body" color="inkSoft" style={{ marginTop: space.xs, textAlign: 'center' }}>
            La tua dispensa, la tua spesa,{'\n'}le ricette con ciò che hai.
          </Text>
        </View>

        <View style={{ gap: space.md }}>
          <Input
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <Button
            title={mode === 'signin' ? 'Accedi' : 'Crea account'}
            onPress={submit}
            loading={busy}
          />
        </View>

        <Pressable
          onPress={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
            setInfo(null);
          }}
          style={{ alignItems: 'center', padding: space.md }}>
          <Text variant="label" color="inkSoft">
            {mode === 'signin' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </Text>
        </Pressable>

        {info ? (
          <Text variant="caption" color="good" style={{ textAlign: 'center' }}>
            {info}
          </Text>
        ) : null}
        {error ? (
          <Text variant="caption" color="danger" style={{ textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
