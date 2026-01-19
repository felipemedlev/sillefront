import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Text } from 'react-native';

interface SurveyProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const DESKTOP_BREAKPOINT = 768;

export const SurveyProgressBar: React.FC<SurveyProgressBarProps> = ({ currentStep, totalSteps }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= DESKTOP_BREAKPOINT;

    // Initialize at the *previous* step to animate from there to the current step
    // If currentStep is 1, previous is 0.
    const initialValue = totalSteps > 0 ? Math.max((currentStep - 1) / totalSteps, 0) : 0;

    const progressAnim = useRef(new Animated.Value(initialValue)).current;

    useEffect(() => {
        // Calculate target percentage (0 to 1)
        const toValue = totalSteps > 0 ? Math.min(Math.max(currentStep / totalSteps, 0), 1) : 0;

        Animated.timing(progressAnim, {
            toValue,
            duration: 500, // Smooth 500ms transition
            useNativeDriver: false, // width is not supported by native driver
        }).start();
    }, [currentStep, totalSteps]);

    // Interpolate width based on percentage
    const widthInterpolation = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (totalSteps <= 0) return null;

    return (
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
            <View style={styles.progressBarBackground}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        { width: widthInterpolation },
                    ]}
                />
            </View>
            <Text style={styles.progressText}>
                {currentStep}/{totalSteps}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        maxWidth: 600,
        alignSelf: 'center',
        flexDirection: 'row', // Align bar and text in a row
        alignItems: 'center',
        gap: 10,
    },
    desktopContainer: {
        maxWidth: 800,
        paddingHorizontal: 0,
        marginTop: 20,
        marginBottom: 20,
    },
    progressBarBackground: {
        flex: 1, // Take up remaining space
        height: 6, // Minimal height
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#8E44AD', // Primary purple color
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        minWidth: 30, // Prevent layout jump when numbers change digits
        textAlign: 'right',
    },
});
