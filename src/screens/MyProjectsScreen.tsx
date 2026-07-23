import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useAppStore } from '../store/store';
import { Application } from '../types/project';
import { supabase } from '../lib/supabase';
import { acceptApplicationRPC } from '../services/projectService';
import { SkeuomorphicSpinner } from '../components/common/SkeuomorphicSpinner';
import { NeoButton } from '../components/common/NeoButton';
import { NeoCard } from '../components/common/NeoCard';
import { UserIcon, PlusIcon } from '../components/common/SvgIcons';

interface PendingApplicationDetail extends Application {
  applicant_username: string;
  milestone_title: string;
}

export const MyProjectsScreen: React.FC = () => {
  const { userProfile, projects, loadProjects, setActiveScreen } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<PendingApplicationDetail[]>([]);
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);

  const myProjects = projects.filter((p) => p.owner_id === userProfile?.id);

  const fetchMyPendingApplications = async () => {
    if (!userProfile) return;
    setLoading(true);

    try {
      const projectIds = myProjects.map((p) => p.id);
      if (projectIds.length === 0) {
        setPendingApplications([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          milestone_id,
          applicant_id,
          portfolio_link,
          status,
          created_at,
          profiles:applicant_id (username),
          milestones:milestone_id (title, project_id)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data) {
        setPendingApplications([]);
        setLoading(false);
        return;
      }

      const myApps = data
        .filter((row: any) => projectIds.includes(row.milestones?.project_id))
        .map((row: any) => ({
          id: row.id,
          milestone_id: row.milestone_id,
          applicant_id: row.applicant_id,
          portfolio_link: row.portfolio_link,
          status: row.status,
          created_at: row.created_at,
          applicant_username: row.profiles?.username || 'Anónimo',
          milestone_title: row.milestones?.title || 'Hito',
        }));

      setPendingApplications(myApps);
    } catch (err) {
      console.error('[MyProjectsScreen] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    fetchMyPendingApplications();
  }, []);

  const handleAcceptApplication = async (appId: string, applicantUsername: string) => {
    Alert.alert(
      'Aceptar Colaborador',
      `¿Deseas asignar el hito a @${applicantUsername}? Esta acción rechazará automáticamente las demás postulaciones para este hito.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar Colaborador',
          style: 'default',
          onPress: async () => {
            setProcessingAppId(appId);
            try {
              await acceptApplicationRPC(appId);
              Alert.alert('¡Colaborador Asignado!', `Se ha asignado el hito a @${applicantUsername}.`);
              await fetchMyPendingApplications();
              await loadProjects();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al aceptar la postulación.');
            } finally {
              setProcessingAppId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace.');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pretitle}>PANEL DE AUTOR</Text>
        <Text style={styles.mainTitle}>Mis Proyectos e Hitos</Text>
        <Text style={styles.subtitle}>
          Gestiona tus propuestas y aprueba postulaciones de colaboradores en tiempo real.
        </Text>
      </View>

      {/* Action Banner */}
      <NeoButton
        title="CREAR UN NUEVO PROYECTO"
        variant="primary"
        onPress={() => setActiveScreen('create_project')}
        icon={<PlusIcon size={18} color="#FFFFFF" />}
      />

      {/* Pending Applications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>POSTULACIONES PENDIENTES DE REVISIÓN</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <SkeuomorphicSpinner size={24} color={COLORS.kleinBlue} />
          </View>
        ) : pendingApplications.length === 0 ? (
          <NeoCard borderRadius={16} backgroundColor="#F9F9F6">
            <Text style={styles.emptyText}>No tienes postulaciones pendientes de revisión.</Text>
          </NeoCard>
        ) : (
          pendingApplications.map((app) => (
            <NeoCard key={app.id} borderRadius={16} backgroundColor="#FFFFFF">
              <View style={styles.appCardHeader}>
                <View style={styles.applicantBadge}>
                  <UserIcon size={14} color={COLORS.kleinBlue} />
                  <Text style={styles.applicantName}>@{app.applicant_username}</Text>
                </View>
                <Text style={styles.appMilestoneTag}>{app.milestone_title}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleOpenLink(app.portfolio_link)}
                style={styles.portfolioLinkBox}
              >
                <Text style={styles.portfolioLabel}>Portafolio / Enlace:</Text>
                <Text style={styles.portfolioUrl} numberOfLines={1}>
                  {app.portfolio_link}
                </Text>
              </TouchableOpacity>

              <NeoButton
                title={processingAppId === app.id ? 'PROCESANDO...' : 'ACEPTAR Y ASIGNAR HITO'}
                variant="primary"
                onPress={() => handleAcceptApplication(app.id, app.applicant_username)}
                loading={processingAppId === app.id}
              />
            </NeoCard>
          ))
        )}
      </View>

      {/* Owned Projects List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROYECTOS PUBLICADOS ({myProjects.length})</Text>

        {myProjects.length === 0 ? (
          <NeoCard borderRadius={16} backgroundColor="#F9F9F6">
            <Text style={styles.emptyText}>Aún no has creado ningún proyecto.</Text>
          </NeoCard>
        ) : (
          myProjects.map((p) => (
            <NeoCard key={p.id} borderRadius={16} backgroundColor="#FFFFFF">
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectDesc} numberOfLines={2}>
                {p.description}
              </Text>
              <View style={styles.projectFooter}>
                <Text style={styles.projectReg}>
                  Regalías: {p.committed_revenue_share}% / {p.max_revenue_share}% MÁX
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveScreen('project_detail', p.id)}
                  style={styles.viewDetailBtn}
                >
                  <Text style={styles.viewDetailText}>VER DETALLES</Text>
                </TouchableOpacity>
              </View>
            </NeoCard>
          ))
        )}
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
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  centerBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  applicantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    marginLeft: 6,
  },
  appMilestoneTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    backgroundColor: '#F4F4F0',
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  portfolioLinkBox: {
    backgroundColor: '#F9F9F6',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 14,
  },
  portfolioLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  portfolioUrl: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.kleinBlue,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.borderLine,
  },
  projectReg: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.kleinBlue,
  },
  viewDetailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  viewDetailText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
