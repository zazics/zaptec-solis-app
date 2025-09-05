/**
 * Composant de sélection de période pour les graphiques
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChartPeriodOption, CHART_PERIODS } from '../../types/chart.types';

interface PeriodSelectorProps {
  selectedPeriod: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  availablePeriods?: ChartPeriodOption[];
  selectedDate?: string; // Date in YYYY-MM-DD format
  onDateChange?: (date: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  availablePeriods = CHART_PERIODS,
  selectedDate,
  onDateChange
}) => {
  /**
   * Navigate to previous day
   */
  const goToPreviousDay = () => {
    if (!selectedDate || !onDateChange) return;
    
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = currentDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  /**
   * Navigate to next day
   */
  const goToNextDay = () => {
    if (!selectedDate || !onDateChange) return;
    
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = currentDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  /**
   * Go to today
   */
  const goToToday = () => {
    if (!onDateChange) return;
    
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  /**
   * Format date for display
   */
  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  /**
   * Check if the selected date is today
   */
  const isToday = (): boolean => {
    if (!selectedDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  /**
   * Check if the selected date is in the future
   */
  const isFutureDate = (): boolean => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return selectedDate > today;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Période d'affichage</Text>
      
      {/* Date navigation for daily view */}
      {selectedPeriod === 'day' && selectedDate && onDateChange && (
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToPreviousDay}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dateDisplay, !isToday() && styles.dateDisplayPast]}
            onPress={goToToday}
          >
            <Text style={[styles.dateText, !isToday() && styles.dateTextPast]}>
              {formatDateForDisplay(selectedDate)}
            </Text>
            {!isToday() && (
              <Text style={styles.todayHint}>Tap for today</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, isFutureDate() && styles.navButtonDisabled]}
            onPress={goToNextDay}
            disabled={isFutureDate()}
          >
            <Text style={[styles.navButtonText, isFutureDate() && styles.navButtonTextDisabled]}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        {availablePeriods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedButton
            ]}
            onPress={() => onPeriodChange(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.selectedButtonText
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  periodButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    marginVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: '22%',
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  navButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  navButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: '#6c757d',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  dateDisplayPast: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
  },
  dateTextPast: {
    color: '#856404',
  },
  todayHint: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default PeriodSelector;