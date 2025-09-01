import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants';
import { Feather } from '@expo/vector-icons'; // For potential icons

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading: isAuthLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state with user data from context when available
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return; // Should not happen if screen is protected

    setIsSaving(true);
    try {
      await updateProfile({ first_name: firstName, last_name: lastName, phone, address });
      Alert.alert("Éxito", "Información actualizada correctamente.");
      // Optionally navigate back or stay on the screen
      // router.back();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "No se pudo actualizar la información.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading indicator if auth data is still loading
  if (isAuthLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.ACCENT} />
      </View>
    );
  }

  // Ensure user is loaded before rendering the form
  if (!user) {
     // This case should ideally not be reached if layout protection works
     return (
        <View style={[styles.container, styles.loadingContainer]}>
            <Text style={styles.errorText}>Error: Usuario no encontrado.</Text>
        </View>
     );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput
        style={[styles.input, styles.readOnlyInput]}
        value={user.email}
        editable={false} // Email is not editable
        selectTextOnFocus={false}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
      />

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Ingresa tu nombre"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        autoCapitalize="words"
        textContentType="givenName"
      />

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Ingresa tu apellido"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        autoCapitalize="words"
        textContentType="familyName"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej: +56 9 1234 5678"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />

      <Text style={styles.label}>Dirección</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={address}
        onChangeText={setAddress}
        placeholder="Ingresa tu dirección de envío"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        multiline
        numberOfLines={3}
        textAlignVertical="top" // Good for Android multiline
        textContentType="fullStreetAddress" // Helps with autofill
      />

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.BACKGROUND} />
        ) : (
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  scrollContent: {
    padding: SPACING.LARGE,
    paddingBottom: SPACING.XLARGE * 2, // Extra padding at bottom
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
  readOnlyInput: {
    backgroundColor: '#FFFEFC', // Slightly different background for read-only
    color: COLORS.TEXT_SECONDARY,
  },
  textArea: {
    minHeight: 80, // Set a minimum height for the text area
  },
  saveButton: {
    backgroundColor: COLORS.ACCENT,
    paddingVertical: SPACING.LARGE,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY, // Grey out when disabled
  },
  saveButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
   errorText: { // Added style for error text
       fontSize: FONT_SIZES.REGULAR,
       color: COLORS.ERROR,
       fontFamily: FONTS.INSTRUMENT_SANS,
       textAlign: 'center',
   }
});