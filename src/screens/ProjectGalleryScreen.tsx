import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useAppStore } from '../store/store';
import { FilterBar } from '../components/dashboard/FilterBar';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { SkeuomorphicSpinner } from '../components/common/SkeuomorphicSpinner';
import { ProjectIcon, PlusIcon } from '../components/common/SvgIcons';
import { NeoCard } from '../components/common/NeoCard';
import { NeoButton } from '../components/common/NeoButton';

export const ProjectGalleryScreen: React.FC = () => {
  const {
    projects,
    filterType,
    isLoadingProjects,
    loadProjects,
    setFilterType,
    setActiveScreen,
    selectProject,
    userProfile,
  } = useAppStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId, userProfile?.id);
    setActiveScreen('project_detail', projectId);
  };

  return (
    <View style={styles.container}>
      {/* Editorial Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.bannerTextGroup}>
          <Text style={styles.pretitle}>GALERÍA COCREATE</Text>
          <Text style={styles.mainTitle}>Proyectos</Text>
          <Text style={styles.subtitle}>
            Empresas e ideas colaborativas impulsadas por participación en regalías.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setActiveScreen('create_project')}
          style={styles.createButton}
        >
          <PlusIcon size={16} color="#FFFFFF" />
          <Text style={styles.createButtonText}>NUEVO</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <FilterBar
        activeFilter={filterType}
        onSelectFilter={(filter) => setFilterType(filter)}
      />

      {/* Projects List */}
      {isLoadingProjects && projects.length === 0 ? (
        <View style={styles.centerContainer}>
          <SkeuomorphicSpinner size={32} color={COLORS.kleinBlue} />
          <Text style={styles.loadingText}>Cargando proyectos en tiempo real...</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => handleSelectProject(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingProjects}
              onRefresh={loadProjects}
              tintColor={COLORS.kleinBlue}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <NeoCard borderRadius={16} backgroundColor="#FFFFFF">
                <View style={styles.emptyContent}>
                  <ProjectIcon size={36} color={COLORS.textPrimary} />
                  <Text style={styles.emptyTitle}>No hay proyectos registrados</Text>
                  <Text style={styles.emptySubtitle}>
                    Sé el primero en lanzar una propuesta en la galería de CoCreate.
                  </Text>
                  <NeoButton
                    title="CREAR PROYECTO AHORA"
                    variant="primary"
                    onPress={() => setActiveScreen('create_project')}
                  />
                </View>
              </NeoCard>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  bannerTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  pretitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.kleinBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#080808',
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingVertical: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    padding: 16,
    marginTop: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
