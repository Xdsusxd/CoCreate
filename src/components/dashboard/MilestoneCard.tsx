import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Milestone, RequiredRole } from '../../types/project';
import {
  CodeIcon,
  DesignIcon,
  MusicIcon,
  MarketingIcon,
  CheckIcon,
} from '../common/SvgIcons';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';

interface MilestoneCardProps {
  milestone: Milestone;
  isOwner: boolean;
  onApply: (milestone: Milestone) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isOwner,
  onApply,
}) => {
  const getRoleBadge = (role: RequiredRole) => {
    switch (role) {
      case 'code':
        return { label: 'Código', icon: CodeIcon };
      case 'design':
        return { label: 'Diseño', icon: DesignIcon };
      case 'music':
        return { label: 'Música', icon: MusicIcon };
      case 'marketing':
        return { label: 'Marketing', icon: MarketingIcon };
      default:
        return { label: role, icon: CodeIcon };
    }
  };

  const roleInfo = getRoleBadge(milestone.required_role);
  const IconComp = roleInfo.icon;

  const isAssigned = milestone.status === 'assigned';
  const isCompleted = milestone.status === 'completed';

  return (
    <NeoCard borderRadius={16} backgroundColor="#FFFFFF">
      {/* Header: Role tag & Revenue percentage */}
      <View style={styles.header}>
        <View style={styles.roleBadge}>
          <IconComp size={14} color="#000000" />
          <Text style={styles.roleText}>{roleInfo.label}</Text>
        </View>

        <View style={styles.revenuePill}>
          <Text style={styles.revenueText}>+{milestone.revenue_share_percent}% Regalías</Text>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>{milestone.title}</Text>
      {milestone.description && (
        <Text style={styles.description}>{milestone.description}</Text>
      )}

      {/* Footer / Status / Tactile Apply Trigger */}
      <View style={styles.footer}>
        {isAssigned ? (
          <View style={styles.statusBadgeAssigned}>
            <CheckIcon size={14} color={COLORS.kleinBlue} />
            <Text style={styles.statusTextAssigned}>
              Asignado a @{milestone.assigned_username || 'colaborador'}
            </Text>
          </View>
        ) : isCompleted ? (
          <View style={styles.statusBadgeCompleted}>
            <Text style={styles.statusTextCompleted}>Completado</Text>
          </View>
        ) : milestone.user_applied ? (
          <View style={styles.statusBadgeApplied}>
            <Text style={styles.statusTextApplied}>POSTULACIÓN ENVIADA (PENDIENTE)</Text>
          </View>
        ) : (
          <NeoButton
            title="POSTULARSE AL HITO"
            variant="primary"
            onPress={() => onApply(milestone)}
          />
        )}
      </View>
    </NeoCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#F4F4F0',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  revenuePill: {
    backgroundColor: COLORS.vibrantGreen,
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  revenueText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  footer: {
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.borderLine,
  },
  statusBadgeAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EBF0FF',
    borderWidth: 1.5,
    borderColor: COLORS.kleinBlue,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextAssigned: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    marginLeft: 6,
  },
  statusBadgeCompleted: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E0E0DB',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextCompleted: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  statusBadgeApplied: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8E5',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextApplied: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
});
