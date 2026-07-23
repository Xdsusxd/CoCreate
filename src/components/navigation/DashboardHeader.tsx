import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { MenuIcon, ChevronIcon, PlusIcon } from '../common/SvgIcons';
import { ScreenName } from '../../store/store';

interface DashboardHeaderProps {
  activeScreen: ScreenName;
  onOpenMenu: () => void;
  onGoBack: () => void;
  onGoHome?: () => void;
  onCreateProject: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeScreen,
  onOpenMenu,
  onGoBack,
  onGoHome,
  onCreateProject,
}) => {
  const isDetail = activeScreen === 'project_detail';
  const showBack = activeScreen !== 'menu';

  return (
    <View style={styles.container}>
      {/* Left action button: Back chevron if not in main menu, else Menu icon */}
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onGoBack}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronIcon direction="left" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenMenu}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MenuIcon size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}

      {/* Centered CoCreate Logo (Clickable Home Trigger) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onGoHome}
        style={styles.logoContainer}
      >
        <Text style={styles.logoCo}>Co</Text>
        <Text style={styles.logoCreate}>Create</Text>
      </TouchableOpacity>

      {/* Right action button: Menu drawer toggle or Create project shortcut */}
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenMenu}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MenuIcon size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCreateProject}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <PlusIcon size={18} color={COLORS.kleinBlue} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  iconPlaceholder: {
    width: 38,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoCo: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue,
    letterSpacing: -1,
  },
  logoCreate: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: -1,
  },
});
