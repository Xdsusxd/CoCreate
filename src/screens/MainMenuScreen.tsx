import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';
import { useAppStore } from '../store/store';
import { ProjectIcon, PlusIcon, UserIcon, ChevronIcon } from '../components/common/SvgIcons';

interface MainMenuScreenProps {
  username?: string;
  onLogout?: () => void;
}

interface MenuCardItemProps {
  title: string;
  subtitle: string;
  tag?: string;
  icon: React.FC<{ size?: number; color?: string }>;
  accentColor: string;
  onPress: () => void;
  index: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MenuCardItem: React.FC<MenuCardItemProps> = ({
  title,
  subtitle,
  tag,
  icon: IconComp,
  accentColor,
  onPress,
  index,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(450).delay(150 + index * 100)}>
      <AnimatedTouchable
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}12` }]}>
            <IconComp size={24} color={accentColor} />
          </View>
          {tag && (
            <View style={[styles.badgePill, { backgroundColor: `${accentColor}15` }]}>
              <Text style={[styles.badgeText, { color: accentColor }]}>{tag}</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.actionText, { color: accentColor }]}>Ingresar</Text>
          <ChevronIcon direction="right" size={14} color={accentColor} />
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ username, onLogout }) => {
  const { setActiveScreen, projects } = useAppStore();

  const totalProjects = projects.length || 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.preTitle}>HUB DE NAVEGACIÓN</Text>
          <Text style={styles.welcomeTitle}>
            Hola, <Text style={styles.usernameText}>@{username || 'creador'}</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Selecciona una sección para colaborar, publicar o gestionar proyectos con regalías.
          </Text>
        </Animated.View>

        {/* Navigation Cards Grid */}
        <View style={styles.cardsGrid}>
          {/* Option 1: Project Gallery */}
          <MenuCardItem
            index={0}
            title="Galería de Proyectos"
            subtitle="Explora startups, videojuegos y software buscando colaboradores con participación de ganancias."
            tag={totalProjects > 0 ? `${totalProjects} Activos` : 'Explorar'}
            icon={ProjectIcon}
            accentColor={COLORS.kleinBlue}
            onPress={() => setActiveScreen('gallery')}
          />

          {/* Option 2: Create Project */}
          <MenuCardItem
            index={1}
            title="Publicar Nuevo Proyecto"
            subtitle="Crea una propuesta, define hitos clave y asigna porcentaje de regalías para tu equipo."
            tag="Nuevo"
            icon={PlusIcon}
            accentColor={COLORS.neonPink}
            onPress={() => setActiveScreen('create_project')}
          />

          {/* Option 3: My Projects & Applications */}
          <MenuCardItem
            index={2}
            title="Mis Proyectos & Hitos"
            subtitle="Gestiona tus proyectos creados, revisa postulaciones enviadas y monitorea el avance."
            tag="Mi Espacio"
            icon={UserIcon}
            accentColor="#00A892"
            onPress={() => setActiveScreen('my_projects')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  preTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.kleinBlue,
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  usernameText: {
    color: COLORS.kleinBlue,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  cardsGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
