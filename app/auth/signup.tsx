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
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../types/constants'; // Import constants

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading indicator
  const { signUp } = useAuth(); // Get signUp function from context

  const handleSignUp = async () => {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error("Por favor, ingresa email y contraseña.");
      }
      // Add more validation if needed (e.g., email format, password strength)

      await signUp(email.trim(), password); // Trim email
      // Navigation is handled by the root layout (_layout.tsx) upon successful signup/login
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante el registro.');
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
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
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
            keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/landing')} // Go back to landing
                disabled={isLoading}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>

              <View style={styles.authToggle}>
                <TouchableOpacity
                  style={[styles.authToggleOption, styles.authToggleActive]}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.authToggleActiveText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.authToggleOption}
                  onPress={() => router.push('/auth/login')}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.authToggleInactiveText}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Bienvenido</Text>
                <Text style={styles.welcomeSubtitle}>
                  Crea una cuenta para comenzar
                </Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isFocused.email && styles.inputContainerFocused,
                    !!error && styles.inputContainerError, // Add error style
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
                    placeholder="mail@ejemplo.com" // Updated placeholder
                    value={email}
                    onChangeText={handleEmailChange} // Use handler to clear error
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, email: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, email: false }))
                    }
                    placeholderTextColor="#999"
                    editable={!isLoading} // Disable input when loading
                    autoComplete="email" // Added for convenience
                  />
                </View>

                <Text style={styles.label}>Contraseña</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isFocused.password && styles.inputContainerFocused,
                     !!error && styles.inputContainerError, // Add error style
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
                    onChangeText={handlePasswordChange} // Use handler to clear error
                    secureTextEntry={!showPassword}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, password: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, password: false }))
                    }
                    placeholderTextColor="#999"
                    editable={!isLoading} // Disable input when loading
                    autoComplete="password-new" // Added for convenience
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
              </View>

              {/* Display Error Message */}
              {error && (
                <Text style={styles.errorTextDisplay}>{error}</Text>
              )}

              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Registrarse</Text>
                  )}
                </TouchableOpacity>

                {/* Removed Guest Access Button */}
              </View>

              <Text style={styles.termsText}>
                Al registrarse se encuentra aceptando nuestros{' '}
                <Text style={styles.termsLink}>Términos de Uso</Text> y{' '}
                <Text style={styles.termsLink}>Políticas de Privacidad</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
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
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  authToggleInactiveText: {
    color: '#666',
    fontSize: 16,
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
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
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: '#666',
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  inputSection: {
    marginBottom: 5, // Reduced margin to make space for error text
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER, // Use constant
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 2, // Softer shadow
  },
  inputContainerFocused: {
    borderColor: COLORS.ACCENT, // Use constant
  },
   inputContainerError: { // Style for error state
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
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  eyeIcon: {
    padding: 15,
  },
  errorTextDisplay: { // Style for the error message text
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SMALL,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  actionSection: {
    marginBottom: 20,
  },
  signUpButton: {
    backgroundColor: COLORS.ACCENT, // Use constant
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
   buttonDisabled: { // Style for disabled button
    backgroundColor: '#aabbc4', // Lighter accent color
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  // Removed guestButton styles
  termsText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONTS.INSTRUMENT_SANS, // Use constant
  },
  termsLink: {
    color: COLORS.ACCENT, // Use constant
    textDecorationLine: 'underline',
  },
});
