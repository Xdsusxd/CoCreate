import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { Milestone } from '../../types/project';
import { CloseIcon } from '../common/SvgIcons';
import { NeoInput } from '../common/NeoInput';
import { NeoButton } from '../common/NeoButton';
import { NeoCard } from '../common/NeoCard';

interface ApplicationModalProps {
  visible: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onSubmit: (portfolioLink: string) => void;
  isSubmitting: boolean;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  visible,
  milestone,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [portfolioLink, setPortfolioLink] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!visible || !milestone) return null;

  const handleSubmit = () => {
    const cleanLink = portfolioLink.trim();
    if (!cleanLink) {
      setError('Por favor ingresa un enlace a tu portafolio o GitHub.');
      return;
    }
    if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
      setError('El enlace debe comenzar con http:// o https://');
      return;
    }

    setError(null);
    onSubmit(cleanLink);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <NeoCard borderRadius={16} backgroundColor="#FFFFFF">
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleGroup}>
                <Text style={styles.headerPretitle}>POSTULACIÓN A HITO</Text>
                <Text style={styles.milestoneTitle} numberOfLines={1}>
                  {milestone.title}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeButton}
              >
                <CloseIcon size={18} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={styles.detailsBox}>
              <Text style={styles.detailsText}>
                Regalías: <Text style={styles.boldText}>+{milestone.revenue_share_percent}%</Text>
              </Text>
              <Text style={styles.detailsText}>
                Rol Requerido: <Text style={styles.boldText}>{milestone.required_role.toUpperCase()}</Text>
              </Text>
            </View>

            {/* Portfolio Input */}
            <View style={styles.inputSection}>
              <NeoInput
                label="ENLACE DE PORTAFOLIO / GITHUB"
                value={portfolioLink}
                onChangeText={(txt) => {
                  setPortfolioLink(txt);
                  setError(null);
                }}
                placeholder="https://github.com/tu-usuario"
                autoCapitalize="none"
                keyboardType="url"
                error={error}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <NeoButton
                title={isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR POSTULACIÓN'}
                variant="primary"
                onPress={handleSubmit}
                loading={isSubmitting}
              />
            </View>
          </NeoCard>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  headerPretitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.kleinBlue,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 6,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: '#F4F4F0',
  },
  detailsBox: {
    backgroundColor: '#F4F4F0',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '900',
    color: '#000000',
  },
  inputSection: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 4,
  },
});
