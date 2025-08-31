import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useSurveyContext } from '../../context/SurveyContext';
import { useRatings } from '../../context/RatingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { STORAGE_KEYS } from '../../types/constants'; // Unused
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../types/constants';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { returnUrl, finalPrice } = useLocalSearchParams<{ returnUrl?: string, finalPrice?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const { submitSurveyIfAuthenticated } = useSurveyContext();
  const { submitRatingsToBackend } = useRatings();

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error("Por favor, ingresa email y contraseña.");
      }

      // Clear any "hasSubmitted" flags from previous sessions to avoid sync issues
      await AsyncStorage.removeItem('hasSubmittedRatings');

      await login({ email: email.trim(), password });

      // After successful login, attempt to submit any pending survey responses
      try {
        await submitSurveyIfAuthenticated();
      } catch (surveyError) {
        console.error('Error submitting survey after login:', surveyError);
        // Don't fail the login process if survey submission fails
      }

      // Also attempt to submit locally stored ratings to the backend
      try {
        await submitRatingsToBackend();
        // Mark that we've submitted ratings in this session
        await AsyncStorage.setItem('hasSubmittedRatings', 'true');
      } catch (ratingsError) {
        console.error('Error submitting ratings after login:', ratingsError);
        // Don't fail the login process if ratings submission fails
      }

      // Handle navigation based on returnUrl
      if (returnUrl === 'checkout' && finalPrice) {
        // Redirect back to checkout with the original price
        router.replace({
          pathname: '/checkout',
          params: { finalPrice: finalPrice }
        });
      } else {
        // Default navigation to tabs
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing again
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError(null);
  };

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Ionicons name="chevron-back" size={26} color="#333" />
            </TouchableOpacity>

            <View style={styles.authToggle}>
              <TouchableOpacity
                style={styles.authToggleOption}
                onPress={() => router.push({
                  pathname: '/signup',
                  params: { returnUrl, finalPrice }
                })}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.authToggleInactiveText}>Registrarse</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authToggleOption, styles.authToggleActive]}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.authToggleActiveText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Iniciar Sesión</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused.email && styles.inputContainerFocused,
                  !!error && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={isFocused.email ? COLORS.ACCENT : (!!error ? COLORS.ERROR : '#999')}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="mail@ejemplo.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  autoComplete="email"
                />
              </View>

              <Text style={styles.label}>Contraseña</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused.password && styles.inputContainerFocused,
                  !!error && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={isFocused.password ? COLORS.ACCENT : (!!error ? COLORS.ERROR : '#999')}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={isFocused.password ? COLORS.ACCENT : '#999'}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword} disabled={isLoading}>
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Text style={styles.errorTextDisplay}>{error}</Text>
            )}

            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              Al iniciar sesión se encuentra aceptando nuestros{' '}
              <Text style={styles.termsLink}>Términos de Uso</Text> y{' '}
              <Text style={styles.termsLink}>Políticas de Privacidad</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 25,
    padding: 2,
    width: width * 0.7,
  },
  authToggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  authToggleActive: {
    backgroundColor: '#fff',
  },
  authToggleActiveText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  authToggleInactiveText: {
    color: '#666',
    fontSize: 16,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  inputSection: {
    marginBottom: 5,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    fontFamily: FONTS.INSTRUMENT_SANS,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: COLORS.ACCENT,
  },
  inputContainerError: {
    borderColor: COLORS.ERROR,
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  eyeIcon: {
    padding: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingVertical: SPACING.XSMALL,
  },
  forgotPasswordText: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorTextDisplay: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SMALL,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  actionSection: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: COLORS.ACCENT,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#aabbc4',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  termsText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  termsLink: {
    color: COLORS.ACCENT,
    textDecorationLine: 'underline',
  },
});