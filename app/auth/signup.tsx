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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log('Sign up pressed');
  };

  const handleGuestAccess = () => {
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#222" />
            </TouchableOpacity>

            <View style={styles.authToggle}>
              <TouchableOpacity
                style={[styles.authToggleOption, styles.authToggleActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.authToggleActiveText}>Registrarse</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authToggleOption}
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.authToggleInactiveText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>

            {/* Empty View for balanced layout */}
            <View style={styles.backButton} />
          </View>

          <View style={styles.form}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Bienvenido</Text>
              <Text style={styles.welcomeSubtitle}>Crea una cuenta para comenzar</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputContainer,
                isFocused.email && styles.inputContainerFocused
              ]}>
                <Ionicons name="mail-outline" size={20} color={isFocused.email ? "#809CAC" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="mail@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={styles.label}>Contraseña</Text>
              <View style={[
                styles.inputContainer,
                isFocused.password && styles.inputContainerFocused
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isFocused.password ? "#809CAC" : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={isFocused.password ? "#809CAC" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                activeOpacity={0.9}
              >
                <Text style={styles.signUpButtonText}>Registrarse</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleGuestAccess}
              >
                <Text style={styles.guestButtonText}>
                  Prefiero continuar como invitado
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              Al registrarse se encuentra aceptando nuestros{' '}
              <Text style={styles.termsLink}>Términos de Uso</Text> y{' '}
              <Text style={styles.termsLink}>Políticas de Privacidad</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#E9E3DB',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD5C9',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#DDD5C9',
    borderRadius: 12,
    padding: 4,
    width: width * 0.6,
  },
  authToggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authToggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  authToggleActiveText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'InstrumentSans',
  },
  authToggleInactiveText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'InstrumentSans',
  },
  form: {
    flex: 1,
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    fontFamily: 'InstrumentSans',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'InstrumentSans',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 8,
    fontFamily: 'InstrumentSans',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#809CAC',
    borderWidth: 2,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#222',
    fontFamily: 'InstrumentSans',
  },
  eyeIcon: {
    padding: 12,
  },
  actionSection: {
    marginBottom: 24,
  },
  signUpButton: {
    backgroundColor: '#809CAC',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#809CAC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 9,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSans',
  },
  guestButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  guestButtonText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'InstrumentSans',
  },
  termsText: {
    marginTop: 24,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'InstrumentSans',
  },
  termsLink: {
    color: '#809CAC',
    textDecorationLine: 'underline',
  },
});
