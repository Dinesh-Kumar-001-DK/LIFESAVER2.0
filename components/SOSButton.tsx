import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

interface SOSButtonProps {
  isActive: boolean;
  onPress: () => void;
  size?: number;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  isActive,
  onPress,
  size = 200,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 750,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 750,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 750,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 750,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    }
  }, [isActive, pulseAnim, opacityAnim]);

  useEffect(() => {
    if (isActive) {
      const flashAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      );

      flashAnimation.start();

      return () => {
        flashAnimation.stop();
      };
    }
  }, [isActive, flashAnim]);

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {!isActive && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.buttonOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isActive ? '#FF3B30' : '#FF3B30',
            opacity: isActive ? flashAnim : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              width: size - 10,
              height: size - 10,
              borderRadius: (size - 10) / 2,
            },
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isActive && styles.stopText]}>
            {isActive ? 'STOP' : 'SOS'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FF3B30',
    backgroundColor: 'transparent',
  },
  buttonOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  button: {
    backgroundColor: '#CC2F26',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  stopText: {
    fontSize: 32,
  },
});
