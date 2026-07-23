import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, Text } from 'react-native';
import { MotiView } from 'moti';
import { EngravedText } from '../components/common/EngravedText';
import { SkeuomorphicPanel } from '../components/common/SkeuomorphicPanel';
import { SkeuomorphicButton } from '../components/common/SkeuomorphicButton';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { User } from '@supabase/supabase-js';

interface HomeScreenProps {
  user: User | null;
  onSignOut: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onSignOut }) => {
  const userEmail = user?.email || 'creador@cocreate.app';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Entrance animation header */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 16 }}
          style={styles.header}
        >
          <View style={styles.badge}>
            <Text style={[TYPOGRAPHY.label, styles.badgeText]}>SESIÓN ACTIVA</Text>
          </View>

          <EngravedText variant="monumental" color={COLORS.textPrimary}>
            ESTUDIO
          </EngravedText>

          <Text style={[TYPOGRAPHY.body, styles.welcomeSub]}>
            Bienvenido de vuelta, <Text style={styles.emailHighlight}>{userEmail}</Text>
          </Text>
        </MotiView>

        {/* Dashboard Grid Cards */}
        <MotiView
          from={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, delay: 250 }}
        >
          <SkeuomorphicPanel style={styles.mainCard}>
            <Text style={[TYPOGRAPHY.label, styles.cardCategory]}>RESUMEN DE ESPACIO</Text>
            <Text style={[TYPOGRAPHY.title, styles.cardTitle]}>CoCreate Hub v2.0</Text>
            <Text style={[TYPOGRAPHY.body, styles.cardDesc]}>
              Tu espacio de trabajo colaborativo en tiempo real está sincronizado. Comienza a crear proyectos con mentes visionarias alrededor del mundo.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Proyectos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>98.4%</Text>
                <Text style={styles.statLabel}>Rendimiento</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>60 FPS</Text>
                <Text style={styles.statLabel}>UI Native</Text>
              </View>
            </View>
          </SkeuomorphicPanel>
        </MotiView>

        {/* Action Panel */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, delay: 400 }}
          style={styles.actionSection}
        >
          <SkeuomorphicButton
            title="Crear Nuevo Proyecto"
            onPress={() => {}}
            variant="bronze"
          />

          <View style={styles.spacing} />

          <SkeuomorphicButton
            title="Cerrar Sesión"
            onPress={onSignOut}
            variant="secondary"
          />
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.successBackground,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.successText,
    fontSize: 9,
  },
  welcomeSub: {
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  emailHighlight: {
    color: COLORS.textBronze,
    fontWeight: 'bold',
  },
  mainCard: {
    marginVertical: 12,
  },
  cardCategory: {
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textPlaceholder,
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionSection: {
    marginTop: 20,
  },
  spacing: {
    height: 10,
  },
});
