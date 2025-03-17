import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function RegistrationScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Registro' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Pantalla de Registro</Text>
        <Text style={styles.description}>
          Esta es una pantalla de marcador de posición para el registro de usuario.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'InstrumentSans',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'InstrumentSans',
  },
});