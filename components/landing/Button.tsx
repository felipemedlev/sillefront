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
}

const Button = ({
  title,
  onPress,
  primary = true,
  style,
  textStyle
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
          height: primary ? screenHeight * 0.065 : screenHeight * 0.045, // Smaller height for non-primary
        },
        style
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          primary ? styles.primaryText : styles.secondaryText,
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
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 18,
    fontFamily: 'InstrumentSans',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#000000',
    fontWeight: 'bold'
  },
});

export default Button;