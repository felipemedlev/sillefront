import { COLORS, SPACING } from '@/types/constants';
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  primary?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  primary = true,
  style,
  textStyle,
  disabled = false
}: ButtonProps) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? styles.primaryButton : styles.secondaryButton,
        {
          width: screenWidth * 0.7, // Both buttons use same width
          ...(primary
              ? { height: screenHeight * 0.065 } // fixed height for primary
              : { minHeight: screenHeight * 0.045 } // allow secondary to grow with content
          ),
        },
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          primary ? styles.primaryText : styles.secondaryText,
          disabled && styles.disabledText,
          textStyle
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#222222',
  },
  secondaryButton: {
    backgroundColor: COLORS.ACCENT,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  text: {
    fontSize: 18,
    fontFamily: 'InstrumentSans',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  disabledText: {
    color: '#888888',
  },
});

export default Button;