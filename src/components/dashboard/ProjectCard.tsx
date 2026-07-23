import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Project } from '../../types/project';
import { GameIcon, CodeIcon, ChevronIcon } from '../common/SvgIcons';
import { GlassPanel } from '../common/GlassPanel';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const isGame = project.type === 'game';
  const IconComp = isGame ? GameIcon : CodeIcon;

  const committed = project.committed_revenue_share || 0;
  const maxShare = project.max_revenue_share || 30;
  const percentUsed = Math.min(100, (committed / maxShare) * 100);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.touchable}
    >
      <GlassPanel pinkBevel style={styles.cardGlass}>
        {/* Top Header: Category Pill & Owner */}
        <View style={styles.topBar}>
          <View
            style={[
              styles.typePill,
              { backgroundColor: isGame ? COLORS.neonPink : COLORS.kleinBlue },
            ]}
          >
            <IconComp size={14} color="#FFFFFF" />
            <Text style={styles.typePillText}>
              {isGame ? 'Juego' : 'Software'}
            </Text>
          </View>

          <Text style={styles.ownerText}>por @{project.owner_username || 'autor'}</Text>
        </View>

        {/* Project Name */}
        <Text style={styles.projectName} numberOfLines={2}>
          {project.name}
        </Text>

        {/* Description Excerpt */}
        <Text style={styles.description} numberOfLines={3}>
          {project.description}
        </Text>

        {/* Interactive Royalty Progress Bar (Mint Green on Glass) */}
        <View style={styles.royaltyBox}>
          <View style={styles.royaltyHeader}>
            <Text style={styles.royaltyTitle}>REGALÍAS ASIGNADAS</Text>
            <Text style={styles.royaltyValueText}>
              <Text style={styles.royaltyHighlight}>{committed}%</Text> / {maxShare}% MÁX
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed >= 100 ? COLORS.errorNeo : COLORS.mintGreen,
                },
              ]}
            />
          </View>
        </View>

        {/* Card Footer Action Trigger */}
        <View style={styles.footer}>
          <Text style={styles.milestoneCountText}>
            {project.milestone_count || 0} hitos disponibles
          </Text>

          <View style={styles.actionPill}>
            <Text style={styles.actionPillText}>VER PROYECTO</Text>
            <ChevronIcon direction="right" size={14} color="#FFFFFF" />
          </View>
        </View>
      </GlassPanel>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardGlass: {
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#080808',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  ownerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  projectName: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  royaltyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: '#080808',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  royaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  royaltyTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  royaltyValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  royaltyHighlight: {
    color: COLORS.neonPink,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(8, 8, 8, 0.08)',
    borderWidth: 1.5,
    borderColor: '#080808',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.borderLine,
  },
  milestoneCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080808',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginRight: 4,
  },
});
