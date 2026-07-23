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
import { ProjectType, RequiredRole } from '../types/project';
import { NeoInput } from '../components/common/NeoInput';
import { NeoButton } from '../components/common/NeoButton';
import { NeoCard } from '../components/common/NeoCard';
import { PlusIcon, CloseIcon, GameIcon, CodeIcon } from '../components/common/SvgIcons';

interface LocalMilestone {
  id: string;
  title: string;
  description: string;
  required_role: RequiredRole;
  revenue_share_percent: number;
}

export const CreateProjectScreen: React.FC = () => {
  const { createProject, isSubmitting, userProfile, setActiveScreen } = useAppStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('game');
  const [description, setDescription] = useState('');
  const [maxRevenueShare, setMaxRevenueShare] = useState('30');
  const [error, setError] = useState<string | null>(null);

  // Milestones local state
  const [milestones, setMilestones] = useState<LocalMilestone[]>([]);
  const [msTitle, setMsTitle] = useState('');
  const [msDescription, setMsDescription] = useState('');
  const [msRole, setMsRole] = useState<RequiredRole>('code');
  const [msShare, setMsShare] = useState('5');
  const [msError, setMsError] = useState<string | null>(null);

  const rolesList: Array<{ id: RequiredRole; label: string }> = [
    { id: 'code', label: 'Código' },
    { id: 'design', label: 'Diseño' },
    { id: 'music', label: 'Música' },
    { id: 'marketing', label: 'Marketing' },
  ];

  const totalCommittedMilestones = milestones.reduce(
    (acc, m) => acc + m.revenue_share_percent,
    0
  );

  const parsedMaxShare = parseFloat(maxRevenueShare) || 0;

  const handleAddMilestone = () => {
    setMsError(null);

    if (!msTitle.trim()) {
      setMsError('El título del hito es obligatorio.');
      return;
    }
    const shareNum = parseFloat(msShare);
    if (isNaN(shareNum) || shareNum <= 0) {
      setMsError('El % de regalías debe ser un número mayor a 0.');
      return;
    }

    // UI Pre-validation: Check against max_revenue_share before sending
    if (totalCommittedMilestones + shareNum > parsedMaxShare) {
      setMsError(
        `Límite excedido: La suma de hitos (${totalCommittedMilestones + shareNum}%) superaría el máximo permitido (${parsedMaxShare}%).`
      );
      return;
    }

    const newMs: LocalMilestone = {
      id: Date.now().toString(),
      title: msTitle.trim(),
      description: msDescription.trim(),
      required_role: msRole,
      revenue_share_percent: shareNum,
    };

    setMilestones([...milestones, newMs]);
    setMsTitle('');
    setMsDescription('');
    setMsShare('5');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
    setMsError(null);
  };

  const handleSubmitProject = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'Debes tener una sesión activa para publicar.');
      return;
    }
    if (name.trim().length < 3) {
      setError('El nombre del proyecto debe tener al menos 3 caracteres.');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es requerida.');
      return;
    }
    if (parsedMaxShare <= 0 || parsedMaxShare > 100) {
      setError('El límite máximo de regalías debe estar entre 1% y 100%.');
      return;
    }
    if (totalCommittedMilestones > parsedMaxShare) {
      setError(`La suma de hitos (${totalCommittedMilestones}%) supera el máximo (${parsedMaxShare}%).`);
      return;
    }

    setError(null);

    const success = await createProject(userProfile.id, {
      name: name.trim(),
      type,
      description: description.trim(),
      max_revenue_share: parsedMaxShare,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description || undefined,
        required_role: m.required_role,
        revenue_share_percent: m.revenue_share_percent,
      })),
    });

    if (success) {
      Alert.alert('¡Proyecto Creado!', 'Tu propuesta ha sido agregada a la Galería CoCreate.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.pretitle}>NUEVO PROYECTO</Text>
        <Text style={styles.mainTitle}>Publica tu Idea</Text>
        <Text style={styles.subtitle}>
          Define el tipo de proyecto, el tope de regalías y los hitos clave para reclutar talento.
        </Text>
      </View>

      {error && (
        <View style={styles.neoErrorBox}>
          <Text style={styles.neoErrorText}>{error}</Text>
        </View>
      )}

      {/* Main Project Details Card */}
      <NeoCard borderRadius={16}>
        <NeoInput
          label="NOMBRE DEL PROYECTO"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Starfield Odyssey / SynthEngine AI"
        />

        <Text style={styles.fieldLabel}>TIPO DE PROYECTO</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setType('game')}
            style={[styles.typeButton, type === 'game' && styles.typeButtonActive]}
          >
            <GameIcon size={16} color={type === 'game' ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.typeButtonText, type === 'game' && styles.typeButtonTextActive]}>
              Juego
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setType('software')}
            style={[styles.typeButton, type === 'software' && styles.typeButtonActive]}
          >
            <CodeIcon size={16} color={type === 'software' ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.typeButtonText, type === 'software' && styles.typeButtonTextActive]}>
              Software
            </Text>
          </TouchableOpacity>
        </View>

        <NeoInput
          label="DESCRIPCIÓN GENERAL"
          value={description}
          onChangeText={setDescription}
          placeholder="Explica la visión del proyecto, stack técnico y objetivos..."
          multiline
          numberOfLines={4}
          style={{ height: 80 }}
        />

        <NeoInput
          label="MÁXIMO DE REGALÍAS COMPROMETIDAS (%)"
          value={maxRevenueShare}
          onChangeText={setMaxRevenueShare}
          placeholder="30.0"
          keyboardType="numeric"
        />
      </NeoCard>

      {/* Milestone Creation Sub-form */}
      <View style={styles.milestonesSection}>
        <View style={styles.milestoneSectionHeader}>
          <Text style={styles.sectionTitle}>HITOS DE REGALÍAS</Text>
          <Text style={styles.shareTracker}>
            Acumulado: <Text style={{ color: COLORS.kleinBlue, fontWeight: '900' }}>{totalCommittedMilestones}%</Text> / {parsedMaxShare}% MÁX
          </Text>
        </View>

        {/* Existing Added Milestones */}
        {milestones.map((ms) => (
          <View key={ms.id} style={styles.milestoneItemRow}>
            <View style={styles.milestoneItemInfo}>
              <Text style={styles.milestoneItemTitle}>{ms.title}</Text>
              <Text style={styles.milestoneItemSub}>
                Rol: {ms.required_role.toUpperCase()} | +{ms.revenue_share_percent}% Regalías
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveMilestone(ms.id)} style={styles.removeBtn}>
              <CloseIcon size={14} color={COLORS.errorNeo} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Neo Red UI Error Banner */}
        {msError && (
          <View style={styles.neoErrorBox}>
            <Text style={styles.neoErrorText}>{msError}</Text>
          </View>
        )}

        {/* Add New Milestone Card */}
        <NeoCard borderRadius={16} backgroundColor="#F9F9F6">
          <Text style={styles.addMsTitle}>AÑADIR HITO AL PROYECTO</Text>

          <NeoInput
            value={msTitle}
            onChangeText={setMsTitle}
            placeholder="Título del hito (ej. Motor Físico 2D)"
          />

          <NeoInput
            value={msDescription}
            onChangeText={setMsDescription}
            placeholder="Descripción corta del entregable..."
          />

          <Text style={styles.subFieldLabel}>ROL REQUERIDO</Text>
          <View style={styles.rolesRow}>
            {rolesList.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setMsRole(r.id)}
                style={[styles.roleChip, msRole === r.id && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, msRole === r.id && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <NeoInput
            label="PORCENTAJE DE REGALÍAS (%)"
            value={msShare}
            onChangeText={setMsShare}
            placeholder="5.0"
            keyboardType="numeric"
          />

          <NeoButton
            title="AGREGAR HITO A LA LISTA"
            variant="klein"
            onPress={handleAddMilestone}
            icon={<PlusIcon size={16} color="#FFFFFF" />}
          />
        </NeoCard>
      </View>

      {/* Submit Action */}
      <View style={styles.submitSection}>
        <NeoButton
          title={isSubmitting ? 'PUBLICANDO PROYECTO...' : 'PUBLICAR PROYECTO EN GALERÍA'}
          variant="primary"
          onPress={handleSubmitProject}
          loading={isSubmitting}
        />

        <TouchableOpacity
          onPress={() => setActiveScreen('gallery')}
          style={styles.cancelLink}
        >
          <Text style={styles.cancelLinkText}>CANCELAR Y VOLVER</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  header: {
    marginBottom: 16,
  },
  pretitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: 1.5,
    marginBottom: 4,
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
    color: COLORS.textSecondary,
  },
  neoErrorBox: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 2,
    borderColor: COLORS.errorNeo,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  neoErrorText: {
    fontSize: 12,
    color: COLORS.errorNeo,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  typeButtonActive: {
    borderColor: '#000000',
    backgroundColor: COLORS.kleinBlue,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
    marginLeft: 6,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  milestonesSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  milestoneSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  shareTracker: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  milestoneItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  milestoneItemInfo: {
    flex: 1,
  },
  milestoneItemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  milestoneItemSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 8,
  },
  addMsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: 1,
    marginBottom: 10,
  },
  subFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    marginBottom: 6,
  },
  roleChipActive: {
    backgroundColor: COLORS.vibrantGreen,
    borderColor: '#000000',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  submitSection: {
    marginTop: 4,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  cancelLinkText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
