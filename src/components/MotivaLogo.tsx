import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export default function MotivaLogo({ size = 32, color = '#FFFFFF' }: Props) {
  return (
    <View style={styles.container}>
      {/* M icon simplified from brand */}
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <G>
          <Path
            d="M4 26 L4 8 L10 8 L16 18 L22 8 L28 8 L28 26 L23 26 L23 15 L17.5 24 L14.5 24 L9 15 L9 26 Z"
            fill={color}
          />
        </G>
      </Svg>
      <Text style={[styles.text, { color, fontSize: size * 0.7 }]}>motiva</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
