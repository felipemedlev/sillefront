import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants';
import { Feather } from '@expo/vector-icons'; // For potential icons

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { updatePassword, isLoading: isAuthLoading } = useAuth(); // Get updatePassword function
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for validation errors

  const handleUpdatePassword = async () => {
    setError(null); // Clear previous errors

    // Basic Validation
    if (!newPassword || !confirmPassword) {
      setError("Por favor, completa ambos campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    // Optional: Add password complexity rules here (e.g., minimum length)
    if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }


    setIsSaving(true);
    try {
      await updatePassword(newPassword);
      Alert.alert("Éxito", "Contraseña actualizada correctamente.", [
        { text: "OK", onPress: () => router.back() } // Navigate back on success
      ]);
      // Clear fields after successful update
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError(error.message || "No se pudo actualizar la contraseña."); // Show error from context/logic
      Alert.alert("Error", error.message || "No se pudo actualizar la contraseña.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading indicator if auth data is still loading (though less likely needed here)
  if (isAuthLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.ACCENT} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.label}>Nueva Contraseña</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Ingresa tu nueva contraseña"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        secureTextEntry // Hide password input
        textContentType="newPassword" // Helps with password managers
        autoCapitalize="none"
      />

      <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirma tu nueva contraseña"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        secureTextEntry // Hide password input
        textContentType="newPassword" // Helps with password managers
        autoCapitalize="none"
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleUpdatePassword}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.BACKGROUND} />
        ) : (
          <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  scrollContent: {
    padding: SPACING.LARGE,
    paddingBottom: SPACING.XLARGE * 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.SMALL,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  saveButton: {
    backgroundColor: COLORS.ACCENT,
    paddingVertical: SPACING.LARGE,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  saveButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
});