import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useAppStore } from '../store/store';
import { Milestone } from '../types/project';
import { MilestoneCard } from '../components/dashboard/MilestoneCard';
import { ApplicationModal } from '../components/dashboard/ApplicationModal';
import { SkeuomorphicSpinner } from '../components/common/SkeuomorphicSpinner';
import { GameIcon, CodeIcon, ChevronIcon } from '../components/common/SvgIcons';
import { NeoCard } from '../components/common/NeoCard';

export const ProjectDetailScreen: React.FC = () => {
  const {
    selectedProject,
    selectedProjectMilestones,
    isLoadingMilestones,
    userProfile,
    applyToMilestone,
    isSubmitting,
    errorMessage,
    clearError,
    setActiveScreen,
  } = useAppStore();

  const [targetMilestone, setTargetMilestone] = useState<Milestone | null>(null);

  if (isLoadingMilestones || !selectedProject) {
    return (
      <View style={styles.centerContainer}>
        <SkeuomorphicSpinner size={32} color={COLORS.kleinBlue} />
        <Text style={styles.loadingText}>Cargando hito y detalles del proyecto...</Text>
      </View>
    );
  }

  const isOwner = userProfile?.id === selectedProject.owner_id;
  const isGame = selectedProject.type === 'game';
  const IconComp = isGame ? GameIcon : CodeIcon;

  const committed = selectedProject.committed_revenue_share || 0;
  const maxShare = selectedProject.max_revenue_share || 30;
  const percentUsed = Math.min(100, (committed / maxShare) * 100);

  const handleOpenApplyModal = (milestone: Milestone) => {
    if (!userProfile) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para postularte a un hito.');
      return;
    }
    if (isOwner) {
      Alert.alert('Acción restringida', 'Eres el dueño de este proyecto.');
      return;
    }
    setTargetMilestone(milestone);
  };

  const handleConfirmApplication = async (portfolioLink: string) => {
    if (!targetMilestone || !userProfile) return;

    const success = await applyToMilestone(
      userProfile.id,
      targetMilestone.id,
      portfolioLink
    );

    if (success) {
      setTargetMilestone(null);
      Alert.alert('¡Postulación enviada!', 'El creador del proyecto revisará tu portafolio.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Link */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveScreen('gallery')}
          style={styles.backLink}
        >
          <ChevronIcon direction="left" size={16} color={COLORS.kleinBlue} />
          <Text style={styles.backLinkText}>VOLVER A LA GALERÍA</Text>
        </TouchableOpacity>

        {/* Top Header Card */}
        <NeoCard borderRadius={16} backgroundColor="#FFFFFF">
          <View style={styles.topBadgeRow}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: isGame ? COLORS.vibrantGreen : COLORS.kleinBlue },
              ]}
            >
              <IconComp size={14} color="#FFFFFF" />
              <Text style={styles.typeBadgeText}>
                {isGame ? 'JUEGO' : 'SOFTWARE'}
              </Text>
            </View>
            <Text style={styles.ownerText}>por @{selectedProject.owner_username}</Text>
          </View>

          {/* Monumental Title */}
          <Text style={styles.monumentalTitle}>{selectedProject.name}</Text>

          {/* Description */}
          <Text style={styles.descriptionText}>{selectedProject.description}</Text>

          {/* Revenue Breakdown */}
          <View style={styles.revenueBox}>
            <View style={styles.revenueHeaderRow}>
              <Text style={styles.revenueBoxTitle}>REPARTO DE REGALÍAS HASTA EL MOMENTO</Text>
              <Text style={styles.revenuePercentText}>
                {committed}% / {maxShare}% MÁX
              </Text>
            </View>

            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percentUsed}%`,
                    backgroundColor: percentUsed >= 100 ? COLORS.errorNeo : COLORS.vibrantGreen,
                  },
                ]}
              />
            </View>
          </View>
        </NeoCard>

        {/* Error Banner */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>Descartar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Milestones Section */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>HITOS DE REGALÍAS DISPONIBLES</Text>
          <Text style={styles.sectionSubtitle}>
            Postúlate aportando tu talento. Al ser aceptado recibirás el % de regalías estipulado.
          </Text>

          {selectedProjectMilestones.length === 0 ? (
            <NeoCard borderRadius={16} backgroundColor="#F9F9F6">
              <Text style={styles.emptyMilestoneText}>
                Este proyecto aún no tiene hitos de regalías publicados.
              </Text>
            </NeoCard>
          ) : (
            selectedProjectMilestones.map((ms) => (
              <MilestoneCard
                key={ms.id}
                milestone={ms}
                isOwner={isOwner}
                onApply={handleOpenApplyModal}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Application Modal */}
      <ApplicationModal
        visible={!!targetMilestone}
        milestone={targetMilestone}
        onClose={() => setTargetMilestone(null)}
        onSubmit={handleConfirmApplication}
        isSubmitting={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backLinkText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: 1,
    marginLeft: 4,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 4,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  monumentalTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 18,
  },
  revenueBox: {
    backgroundColor: '#F4F4F0',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueBoxTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.8,
  },
  revenuePercentText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.kleinBlue,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: '#E0E0DB',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  errorBox: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 2,
    borderColor: COLORS.errorNeo,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.errorNeo,
    fontWeight: '700',
    flex: 1,
  },
  errorDismiss: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.errorNeo,
    marginLeft: 8,
  },
  milestonesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 16,
  },
  emptyMilestoneText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
