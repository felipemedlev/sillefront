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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login pressed');
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
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/landing')}
              >
                <Ionicons name="chevron-back" size={26} color="#333" />
              </TouchableOpacity>

              <View style={styles.authToggle}>
                <TouchableOpacity
                  style={styles.authToggleOption}
                  onPress={() => router.push('/auth/signup')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.authToggleInactiveText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authToggleOption, styles.authToggleActive]}
                  activeOpacity={0.7}
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
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={isFocused.email ? '#809CAC' : '#999'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="mail@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, email: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, email: false }))
                    }
                    placeholderTextColor="#999"
                  />
                </View>

                <Text style={styles.label}>Contraseña</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isFocused.password && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={isFocused.password ? '#809CAC' : '#999'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() =>
                      setIsFocused((prev) => ({ ...prev, password: true }))
                    }
                    onBlur={() =>
                      setIsFocused((prev) => ({ ...prev, password: false }))
                    }
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={isFocused.password ? '#809CAC' : '#999'}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
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
                Al iniciar sesión se encuentra aceptando nuestros{' '}
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
    width: width * 0.6,
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
    fontFamily: 'InstrumentSans',
  },
  authToggleInactiveText: {
    color: '#666',
    fontSize: 15,
    fontFamily: 'InstrumentSans',
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
    fontFamily: 'InstrumentSans',
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: '#666',
    fontFamily: 'InstrumentSans',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'InstrumentSans',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainerFocused: {
    borderColor: '#809CAC',
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#333',
    fontFamily: 'InstrumentSans',
  },
  eyeIcon: {
    padding: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#809CAC',
    fontSize: 14,
    fontFamily: 'InstrumentSans',
  },
  actionSection: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#809CAC',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'InstrumentSans',
  },
  guestButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 15,
  },
  guestButtonText: {
    color: '#333',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'InstrumentSans',
  },
  termsText: {
    marginTop: 20,
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