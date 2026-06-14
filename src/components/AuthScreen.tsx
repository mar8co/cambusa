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
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    if (!supabase || !email.includes('@')) {
      setError('Inserisci un’email valida');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setStep('code');
  };

  const verify = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    if (error) setError(error.message);
    // al successo onAuthStateChange aggiorna la sessione e si entra nell'app
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

        {step === 'email' ? (
          <View style={{ gap: space.md }}>
            <Input
              placeholder="La tua email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={sendCode}
              returnKeyType="go"
            />
            <Button title="Invia codice" onPress={sendCode} loading={busy} />
          </View>
        ) : (
          <View style={{ gap: space.md }}>
            <Text variant="caption" color="inkSoft" style={{ textAlign: 'center' }}>
              Ti abbiamo inviato un codice a {email}
            </Text>
            <Input
              placeholder="Codice a 6 cifre"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              onSubmitEditing={verify}
              returnKeyType="go"
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: 8 }}
            />
            <Button title="Entra" onPress={verify} loading={busy} />
            <Pressable onPress={() => setStep('email')} style={{ alignItems: 'center', padding: space.sm }}>
              <Text variant="label" color="inkSoft">
                Cambia email
              </Text>
            </Pressable>
          </View>
        )}

        {error ? (
          <Text variant="caption" color="danger" style={{ textAlign: 'center', marginTop: space.md }}>
            {error}
          </Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
