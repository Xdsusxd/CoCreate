import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { ProjectType } from '../../types/project';
import { FilterIcon, GameIcon, CodeIcon } from '../common/SvgIcons';

interface FilterBarProps {
  activeFilter: ProjectType | 'all';
  onSelectFilter: (filter: ProjectType | 'all') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  const filters: Array<{
    id: ProjectType | 'all';
    label: string;
    icon?: React.FC<{ size?: number; color?: string }>;
  }> = [
    { id: 'all', label: 'Todos' },
    { id: 'game', label: 'Juegos', icon: GameIcon },
    { id: 'software', label: 'Software', icon: CodeIcon },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <FilterIcon size={14} color={COLORS.textPrimary} />
        <Text style={styles.filterLabel}>FILTRAR:</Text>
      </View>

      <View style={styles.buttonsGroup}>
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          const IconComp = f.icon;

          return (
            <TouchableOpacity
              key={f.id}
              activeOpacity={0.8}
              onPress={() => onSelectFilter(f.id)}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
            >
              {IconComp && (
                <IconComp
                  size={14}
                  color={isActive ? '#FFFFFF' : '#000000'}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    backgroundColor: COLORS.background,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginLeft: 6,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#080808',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.kleinBlue,
    borderColor: '#080808',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
