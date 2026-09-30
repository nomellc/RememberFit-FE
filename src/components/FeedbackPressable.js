import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/color';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FeedbackPressable({
  baseColor,
  hoverColor,
  pressedColor,
  disabled = false,
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  style,
  ...props
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const isHovered = useRef(false);
  const isPressed = useRef(false);
  const reduceMotion = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.() ?? false)
      .then((enabled) => {
        if (mounted) reduceMotion.current = enabled;
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      reduceMotion.current = enabled;
      if (enabled) progress.stopAnimation();
    });

    return () => {
      mounted = false;
      subscription?.remove();
      progress.stopAnimation();
    };
  }, [progress]);

  useEffect(() => {
    if (disabled) progress.setValue(0);
  }, [disabled, progress]);

  const moveTo = (value) => {
    progress.stopAnimation();
    if (reduceMotion.current) {
      progress.setValue(value);
      return;
    }
    Animated.timing(progress, {
      toValue: value,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [baseColor, hoverColor || baseColor, pressedColor || hoverColor || baseColor],
  });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...props}
      disabled={disabled}
      onHoverIn={(event) => {
        isHovered.current = true;
        moveTo(1);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        isHovered.current = false;
        moveTo(isPressed.current ? 2 : 0);
        onHoverOut?.(event);
      }}
      onPressIn={(event) => {
        isPressed.current = true;
        moveTo(2);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        isPressed.current = false;
        moveTo(isHovered.current ? 1 : 0);
        onPressOut?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      style={[style, { backgroundColor }, Platform.OS === 'web' && isFocused && styles.focusRing]}
    />
  );
}

const styles = StyleSheet.create({
  focusRing: {
    outlineColor: colors.primary,
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 3,
  },
});
