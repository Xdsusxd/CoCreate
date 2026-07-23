import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/colors';
import {
  CloseIcon,
  HomeIcon,
  ProjectIcon,
  PlusIcon,
  UserIcon,
  LogoutIcon,
} from '../common/SvgIcons';
import { ScreenName } from '../../store/store';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  activeScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onLogout: () => void;
  username?: string;
}

interface MenuItemData {
  id: ScreenName | 'logout';
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
}

const MENU_ITEMS: MenuItemData[] = [
  { id: 'menu', label: 'Menú Principal (Hub)', icon: HomeIcon },
  { id: 'gallery', label: 'Galería de Proyectos', icon: ProjectIcon },
  { id: 'create_project', label: 'Crear Proyecto', icon: PlusIcon },
  { id: 'my_projects', label: 'Mis Proyectos / Hitos', icon: UserIcon },
  { id: 'logout', label: 'Cerrar Sesión', icon: LogoutIcon },
];

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  activeScreen,
  onNavigate,
  onLogout,
  username,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer}>
          {/* Header with Centered Logo and Close Button */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logoCo}>Co</Text>
              <Text style={styles.logoCreate}>Create</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
            >
              <CloseIcon size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* User Profile Badge */}
          {username && (
            <View style={styles.userBadge}>
              <View style={styles.userDot} />
              <Text style={styles.userText}>@{username}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Vertical Menu Options with Staggered Fade & 8px Shift */}
          <View style={styles.itemsContainer}>
            {MENU_ITEMS.map((item, index) => (
              <StaggeredMenuItem
                key={item.id}
                item={item}
                index={index}
                isActive={activeScreen === item.id}
                onSelect={() => {
                  onClose();
                  if (item.id === 'logout') {
                    onLogout();
                  } else {
                    onNavigate(item.id);
                  }
                }}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>CoCreate Platform v2.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface StaggeredItemProps {
  item: MenuItemData;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

const StaggeredMenuItem: React.FC<StaggeredItemProps> = ({
  item,
  index,
  isActive,
  onSelect,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  React.useEffect(() => {
    opacity.value = withDelay(
      index * 50,
      withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      index * 50,
      withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const IconComp = item.icon;

  return (
    <Animated.View style={[styles.menuItemWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onSelect}
        style={styles.itemTouchable}
      >
        <View style={styles.itemContent}>
          <IconComp
            size={20}
            color={isActive ? COLORS.kleinBlue : COLORS.textPrimary}
          />
          <Text
            style={[
              styles.itemLabel,
              isActive && styles.itemLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </View>
        {/* Active Underline Effect: 1px Klein Blue line underneath */}
        {isActive && <View style={styles.activeLine} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: COLORS.background,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLine,
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoCo: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue,
    letterSpacing: -1,
  },
  logoCreate: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: -1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLine,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(44, 78, 194, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(44, 78, 194, 0.2)',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.kleinBlue,
    marginRight: 8,
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.kleinBlue,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLine,
    marginBottom: 24,
  },
  itemsContainer: {
    flex: 1,
  },
  menuItemWrapper: {
    marginBottom: 18,
  },
  itemTouchable: {
    paddingVertical: 6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 14,
    letterSpacing: -0.2,
  },
  itemLabelActive: {
    fontStyle: 'italic',
    color: COLORS.kleinBlue,
    fontWeight: '800',
  },
  activeLine: {
    height: 1.5,
    backgroundColor: COLORS.kleinBlue,
    marginTop: 6,
    width: '100%',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLine,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
