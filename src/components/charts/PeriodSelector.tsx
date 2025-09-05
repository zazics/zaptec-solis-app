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
   * Navigate to previous period
   */
  const goToPreviousPeriod = () => {
    if (!selectedDate || !onDateChange) return;
    
    const currentDate = new Date(selectedDate);
    
    switch (selectedPeriod) {
      case 'day':
        currentDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    
    const newDate = currentDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  /**
   * Navigate to next period
   */
  const goToNextPeriod = () => {
    if (!selectedDate || !onDateChange) return;
    
    const currentDate = new Date(selectedDate);
    
    switch (selectedPeriod) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
    
    const newDate = currentDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  /**
   * Go to current period (today)
   */
  const goToCurrentPeriod = () => {
    if (!onDateChange) return;
    
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  /**
   * Format date for display based on selected period
   */
  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    
    switch (selectedPeriod) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        });
      case 'week':
        // Calculate week start (Monday)
        const dayOfWeek = date.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - daysToMonday);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`;
      case 'month':
        return date.toLocaleDateString('fr-FR', { 
          month: 'long',
          year: 'numeric'
        });
      case 'year':
        return date.getFullYear().toString();
      default:
        return dateStr;
    }
  };

  /**
   * Check if the selected date is in current period
   */
  const isCurrentPeriod = (): boolean => {
    if (!selectedDate) return true;
    
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        return selectedDate === today.toISOString().split('T')[0];
      case 'week':
        // Check if selected date is in current week
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return selectedDateObj >= startOfWeek && selectedDateObj <= endOfWeek;
      case 'month':
        return selectedDateObj.getMonth() === today.getMonth() && 
               selectedDateObj.getFullYear() === today.getFullYear();
      case 'year':
        return selectedDateObj.getFullYear() === today.getFullYear();
      default:
        return false;
    }
  };

  /**
   * Check if the selected date is in the future
   */
  const isFuturePeriod = (): boolean => {
    if (!selectedDate) return false;
    
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        return selectedDate > today.toISOString().split('T')[0];
      case 'week':
        // Check if selected date's week is in the future
        return selectedDateObj > today;
      case 'month':
        const thisMonth = today.getFullYear() * 12 + today.getMonth();
        const selectedMonth = selectedDateObj.getFullYear() * 12 + selectedDateObj.getMonth();
        return selectedMonth > thisMonth;
      case 'year':
        return selectedDateObj.getFullYear() > today.getFullYear();
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Période d'affichage</Text>
      
      {/* Period navigation for all periods */}
      {selectedDate && onDateChange && (
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToPreviousPeriod}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dateDisplay, !isCurrentPeriod() && styles.dateDisplayPast]}
            onPress={goToCurrentPeriod}
          >
            <Text style={[styles.dateText, !isCurrentPeriod() && styles.dateTextPast]}>
              {formatDateForDisplay(selectedDate)}
            </Text>
            {!isCurrentPeriod() && (
              <Text style={styles.todayHint}>Tap for current</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, isFuturePeriod() && styles.navButtonDisabled]}
            onPress={goToNextPeriod}
            disabled={isFuturePeriod()}
          >
            <Text style={[styles.navButtonText, isFuturePeriod() && styles.navButtonTextDisabled]}>→</Text>
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