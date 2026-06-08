import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type Props = {
  variant?: 'dark' | 'light';
};

export default function WaveBackground({ variant = 'dark' }: Props) {
  const isDark = variant === 'dark';

  const gradientColors: [string, string, string] = isDark
    ? ['#6B21F5', '#3D0FA8', '#1A0560']
    : ['#F8FAFC', '#E8EDF5', '#D1D9E8'];

  const waveColor1 = isDark ? '#7C3AF0' : '#E2E8F2';
  const waveColor2 = isDark ? '#4A15C4' : '#EDF1F8';
  const waveColor3 = isDark ? '#2D0B8C' : '#F1F5FA';

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Wave blob top-left */}
      <Svg
        style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Path
          d={`M -${width * 0.2} ${height * 0.05}
            C ${width * 0.1} ${-height * 0.1},
              ${width * 0.5} ${height * 0.15},
              ${width * 0.4} ${height * 0.35}
            C ${width * 0.3} ${height * 0.55},
              ${-width * 0.1} ${height * 0.45},
              ${-width * 0.2} ${height * 0.05} Z`}
          fill={waveColor1}
        />
      </Svg>

      {/* Wave blob top-right */}
      <Svg
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Path
          d={`M ${width * 0.6} ${-height * 0.05}
            C ${width * 1.1} ${height * 0.05},
              ${width * 1.2} ${height * 0.3},
              ${width * 0.9} ${height * 0.4}
            C ${width * 0.7} ${height * 0.5},
              ${width * 0.5} ${height * 0.25},
              ${width * 0.6} ${-height * 0.05} Z`}
          fill={waveColor2}
        />
      </Svg>

      {/* Wave blob bottom-center */}
      <Svg
        style={[StyleSheet.absoluteFill, { opacity: 0.65 }]}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Path
          d={`M ${width * 0.1} ${height * 0.6}
            C ${width * 0.3} ${height * 0.5},
              ${width * 0.7} ${height * 0.55},
              ${width * 0.85} ${height * 0.7}
            C ${width} ${height * 0.85},
              ${width * 0.9} ${height * 1.05},
              ${width * 0.3} ${height * 1.1}
            C ${-width * 0.1} ${height * 1.15},
              ${-width * 0.1} ${height * 0.75},
              ${width * 0.1} ${height * 0.6} Z`}
          fill={waveColor3}
        />
      </Svg>

      {/* Wave blob bottom-left */}
      <Svg
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Path
          d={`M ${-width * 0.1} ${height * 0.75}
            C ${width * 0.15} ${height * 0.65},
              ${width * 0.35} ${height * 0.8},
              ${width * 0.2} ${height * 1.05}
            C ${width * 0.05} ${height * 1.2},
              ${-width * 0.15} ${height * 1.1},
              ${-width * 0.1} ${height * 0.75} Z`}
          fill={waveColor1}
        />
      </Svg>
    </View>
  );
}
