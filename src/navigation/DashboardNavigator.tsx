import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useAppStore, ScreenName } from '../store/store';
import { DashboardHeader } from '../components/navigation/DashboardHeader';
import { SideMenu } from '../components/navigation/SideMenu';
import { CurtainTransition } from '../components/navigation/CurtainTransition';

import { MainMenuScreen } from '../screens/MainMenuScreen';
import { ProjectGalleryScreen } from '../screens/ProjectGalleryScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { CreateProjectScreen } from '../screens/CreateProjectScreen';
import { MyProjectsScreen } from '../screens/MyProjectsScreen';

interface DashboardNavigatorProps {
  onLogout: () => void;
  username?: string;
  userId?: string;
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  onLogout,
  username,
  userId,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { activeScreen, setActiveScreen, setUserProfile, selectedProjectId } = useAppStore();

  useEffect(() => {
    if (username && userId) {
      setUserProfile({
        id: userId,
        username,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [username, userId]);

  const handleNavigate = (screen: ScreenName) => {
    setActiveScreen(screen);
  };

  const handleGoBack = () => {
    if (activeScreen === 'project_detail') {
      setActiveScreen('gallery');
    } else {
      setActiveScreen('menu');
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'menu':
        return <MainMenuScreen username={username} onLogout={onLogout} />;
      case 'gallery':
        return <ProjectGalleryScreen />;
      case 'project_detail':
        return <ProjectDetailScreen />;
      case 'create_project':
        return <CreateProjectScreen />;
      case 'my_projects':
        return <MyProjectsScreen />;
      default:
        return <MainMenuScreen username={username} onLogout={onLogout} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Fixed Header */}
        <DashboardHeader
          activeScreen={activeScreen}
          onOpenMenu={() => setMenuVisible(true)}
          onGoBack={handleGoBack}
          onGoHome={() => setActiveScreen('menu')}
          onCreateProject={() => setActiveScreen('create_project')}
        />

        {/* Dynamic Screen View with 1px Black Line Curtain Transition */}
        <CurtainTransition activeKey={`${activeScreen}_${selectedProjectId || ''}`}>
          {renderActiveScreen()}
        </CurtainTransition>

        {/* Side / Header Menu */}
        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          activeScreen={activeScreen}
          onNavigate={handleNavigate}
          onLogout={onLogout}
          username={username}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
