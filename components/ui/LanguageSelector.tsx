import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
            <Feather name="globe" size={20} color="#666" style={styles.icon} />
            <Text style={styles.text}>
                {i18n.language === 'en' ? 'EN' : 'ES'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    icon: {
        marginRight: 6,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});
