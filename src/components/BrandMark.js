import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/color';

export default function BrandMark({ size = 42 }) {
  const lineWidth = size * 0.38;

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <View style={[styles.backCard, { borderRadius: size * 0.16 }]} />
      <View style={[styles.frontCard, { borderRadius: size * 0.16 }]}>
        <View style={[styles.line, { width: lineWidth }]} />
        <View style={[styles.line, { width: lineWidth * 0.72 }]} />
        <View style={[styles.dot, { width: size * 0.12, height: size * 0.12, borderRadius: radius.pill }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  backCard: {
    position: 'absolute',
    width: '55%',
    height: '64%',
    left: '18%',
    top: '16%',
    backgroundColor: colors.primary,
  },
  frontCard: {
    position: 'absolute',
    width: '55%',
    height: '64%',
    right: '16%',
    top: '20%',
    backgroundColor: colors.surface,
    paddingLeft: '11%',
    paddingTop: '16%',
  },
  line: {
    height: 2,
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  dot: {
    position: 'absolute',
    right: '16%',
    bottom: '13%',
    backgroundColor: colors.primary,
  },
});
