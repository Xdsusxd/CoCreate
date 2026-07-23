import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolateColor,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LINE_MAX_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);

interface SplashScreenProps {
  onFinishSplash: () => void;
}

const GLYPHS_CO = ['C', 'o'];
const GLYPHS_CREATE = ['C', 'r', 'e', 'a', 't', 'e'];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinishSplash }) => {
  // Step 1: Circle to Line Morph shared values
  const dotScale = useSharedValue(0);
  const dotRotation = useSharedValue(0); // 0 -> 180 deg
  const lineMorphScaleX = useSharedValue(0.05);
  const lineMorphScaleY = useSharedValue(1);
  const dotColorProgress = useSharedValue(0);

  // Step 2: Staggered Glyphs animation trigger
  const glyphProgress = useSharedValue(0);

  // Step 3: Chromatic Accent & Footer values
  const lineColorProgress = useSharedValue(0);
  const footerOpacity = useSharedValue(0);
  const footerTranslateY = useSharedValue(8);

  // Step 4: Shared Exit Transition values
  const mainSplashOpacity = useSharedValue(1);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // STEP 1: Klein Blue Circle Elastic Expansion, 180° Spin, and Morph to 1px Black Line
    dotScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 180 }),
      withSpring(1.0, { damping: 14, stiffness: 140 })
    );

    dotRotation.value = withTiming(180, { duration: 600, easing: Easing.out(Easing.cubic) });

    lineMorphScaleX.value = withDelay(
      380,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    lineMorphScaleY.value = withDelay(
      380,
      withTiming(0.06, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    dotColorProgress.value = withDelay(
      380,
      withTiming(1, { duration: 350 })
    );

    // STEP 2: Staggered Letter Revelation (40ms per letter)
    glyphProgress.value = withDelay(
      800,
      withSpring(1, { damping: 16, stiffness: 110 })
    );

    // STEP 3: Chromatic Accent & Footer Fade-in + 8px translateY
    lineColorProgress.value = withDelay(
      1200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
    );

    footerOpacity.value = withDelay(
      1250,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) })
    );
    footerTranslateY.value = withDelay(
      1250,
      withSpring(0, { damping: 14, stiffness: 120 })
    );

    // STEP 4: Shared Continuity Transition after 2.5s hold
    timeoutId = setTimeout(() => {
      mainSplashOpacity.value = withTiming(
        0,
        { duration: 450, easing: Easing.inOut(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(onFinishSplash)();
          }
        }
      );
    }, 2500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    dotScale,
    dotRotation,
    lineMorphScaleX,
    lineMorphScaleY,
    dotColorProgress,
    glyphProgress,
    lineColorProgress,
    footerOpacity,
    footerTranslateY,
    mainSplashOpacity,
    onFinishSplash,
  ]);

  const animatedLineStyle = useAnimatedStyle(() => {
    let backgroundColor = interpolateColor(
      dotColorProgress.value,
      [0, 1],
      [COLORS.kleinBlue, '#000000']
    );

    if (lineColorProgress.value > 0) {
      backgroundColor = interpolateColor(
        lineColorProgress.value,
        [0, 1],
        ['#000000', COLORS.kleinBlue]
      );
    }

    return {
      transform: [
        { scale: dotScale.value },
        { rotate: `${dotRotation.value}deg` },
        { scaleX: lineMorphScaleX.value },
        { scaleY: lineMorphScaleY.value },
      ],
      backgroundColor,
    };
  });

  const animatedFooterStyle = useAnimatedStyle(() => {
    return {
      opacity: footerOpacity.value,
      transform: [{ translateY: footerTranslateY.value }],
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: mainSplashOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.mainContainer, animatedContainerStyle]}>
        <View style={styles.centerSection}>
          <View style={styles.topMaskBox}>
            <View style={styles.glyphRow}>
              {GLYPHS_CO.map((char, index) => (
                <StaggeredGlyph
                  key={`co-${index}`}
                  char={char}
                  index={index}
                  progress={glyphProgress}
                  direction="up"
                  style={styles.logoCoChar}
                />
              ))}
            </View>
          </View>

          <Animated.View style={[styles.morphingElement, animatedLineStyle]} />

          <View style={styles.bottomMaskBox}>
            <View style={styles.glyphRow}>
              {GLYPHS_CREATE.map((char, index) => (
                <StaggeredGlyph
                  key={`create-${index}`}
                  char={char}
                  index={index + GLYPHS_CO.length}
                  progress={glyphProgress}
                  direction="down"
                  style={styles.logoCreateChar}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Footer Element: Uppercase & Larger Font Size */}
        <Animated.View style={[styles.footerContainer, animatedFooterStyle]}>
          <Text style={styles.footerText}>CREADO POR B-AP TEAM</Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

interface StaggeredGlyphProps {
  char: string;
  index: number;
  progress: Animated.SharedValue<number>;
  direction: 'up' | 'down';
  style: object;
}

const StaggeredGlyph: React.FC<StaggeredGlyphProps> = ({
  char,
  index,
  progress,
  direction,
  style,
}) => {
  const animatedGlyphStyle = useAnimatedStyle(() => {
    const initialTranslateY = direction === 'up' ? 36 : -36;
    const translateY = (1 - progress.value) * initialTranslateY;
    const opacity = Math.min(1, Math.max(0, progress.value * 1.5 - index * 0.08));

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedGlyphStyle}>
      <Text style={style}>{char}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Clean chalk white #FAF9F5
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topMaskBox: {
    height: 58,
    width: LINE_MAX_WIDTH,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomMaskBox: {
    height: 58,
    width: LINE_MAX_WIDTH,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  glyphRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  morphingElement: {
    width: LINE_MAX_WIDTH,
    height: 16,
    borderRadius: 8,
    marginVertical: 0,
  },
  logoCoChar: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue,
  },
  logoCreateChar: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '900',
    fontStyle: 'normal',
    color: COLORS.kleinBlue,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  footerText: {
    color: '#000000',
    fontSize: 14, // Larger font size
    letterSpacing: 1.8, // Elegant uppercase tracking
    fontWeight: '700', // Bold uppercase
    textTransform: 'uppercase',
  },
});
