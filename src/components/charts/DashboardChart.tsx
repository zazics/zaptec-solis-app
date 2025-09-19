/**
 * Composant de graphique combiné pour le dashboard
 * Affiche plusieurs séries de données sur le même graphique
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DashboardChartData } from '../../types/chart.types';

const screenWidth = Dimensions.get('window').width;

interface DashboardChartProps {
  title: string;
  data: DashboardChartData;
  height?: number;
  totalSolarEnergyKwh?: number; // Total solar energy in kWh for the period
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  height = 250,
  totalSolarEnergyKwh
}) => {
  // Ne rien afficher s'il n'y a pas de données
  if (data.solarProduction.length === 0) {
    return null;
  }

  // État pour gérer le point sélectionné et la ligne verticale
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // -1 indique qu'aucun point n'est sélectionné
  const [verticalLineX, setVerticalLineX] = useState<number>(0);
  const [showVerticalLine, setShowVerticalLine] = useState<boolean>(false);

  // Calculer les paramètres d'échantillonnage
  const calculateSamplingParams = () => {

    let maxPoints = 12;
    let labelStep = 1;
    
    // Pour les données par quart d'heure, afficher TOUS les points
    if (data.period === 'quarterly') {
      maxPoints = data.solarProduction.length; // Afficher TOUS les points
      labelStep = 8; // Labels toutes les 2 heures seulement
    } else if (data.period === 'hourly') {
      maxPoints = data.solarProduction.length; // Afficher tous les points horaires aussi
      labelStep = 2; // Labels toutes les 2 heures
    }
    
    const step = Math.ceil(data.solarProduction.length / maxPoints);
    return { maxPoints, labelStep, step };
  };

  const { step, labelStep } = calculateSamplingParams();

  // Préparer les données pour le graphique combiné
  const prepareChartData = () => {
    
    const labels = data.solarProduction
      .filter((_, index) => index % step === 0)
      .map((point, index) => {
        const date = new Date(point.timestamp);
        const minutes = date.getMinutes();
        
        if (data.period === 'quarterly') {
          // Pour les quarts d'heure, afficher seulement les heures pleines
          if (index % labelStep === 0 && minutes === 0) {
            return `${date.getHours()}h`;
          }
          return '';
        } else if (data.period === 'hourly') {
          // Pour les données horaires, afficher l'heure avec jour pour les semaines
          if (index % labelStep === 0) {
            // Afficher le jour à certains moments clés (8h et 20h)
            if (date.getHours() === 8 || date.getHours() === 20 || date.getHours() === 0) {
              const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
              return `${dayName} ${date.getHours()}h`;
            }
            return `${date.getHours()}h`;
          }
          return '';
        } else if (data.period === 'daily') {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        } else if (data.period === 'monthly') {
          return date.toLocaleDateString('fr-FR', { month: 'short' });
        }
        return date.toLocaleDateString('fr-FR');
      });

    const datasets = [];

    // Production solaire
    if (data.solarProduction.some(d => d.value > 0)) {
      datasets.push({
        data: data.solarProduction
          .filter((_, index) => index % step === 0)
          .map(point => Math.round(point.value)),
        color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Jaune pour solaire
        strokeWidth: 2
      });
    }

    // Consommation maison
    if (data.houseConsumption.some(d => d.value > 0)) {
      datasets.push({
        data: data.houseConsumption
          .filter((_, index) => index % step === 0)
          .map(point => Math.round(point.value)),
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // Bleu pour maison
        strokeWidth: 2
      });
    }

    // Consommation Zaptec
    if (data.zaptecConsumption.some(d => d.value > 0)) {
      datasets.push({
        data: data.zaptecConsumption
          .filter((_, index) => index % step === 0)
          .map(point => Math.round(point.value)),
        color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Vert pour Zaptec
        strokeWidth: 2
      });
    }

    // Import réseau (si significatif)
    if (data.gridImported.some(d => d.value > 100)) {
      datasets.push({
        data: data.gridImported
          .filter((_, index) => index % step === 0)
          .map(point => Math.round(point.value)),
        color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // Rouge pour import
        strokeWidth: 2
      });
    }

    return { labels, datasets };
  };

  const chartData = prepareChartData();
  
  // Utiliser la largeur totale de l'écran sans marges
  const chartWidth = screenWidth; // Largeur complète de l'écran
  
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: data.period === 'quarterly' ? '1' : '1.5', // Much smaller dots
      strokeWidth: '1',
    },
    decimalPlaces: 0,
    formatYLabel: (value: string) => `${value}W`,
    // Reduce label size for daily charts with many data points
    propsForLabels: {
      fontSize: data.period === 'quarterly' ? 8 : 12, // Smaller font for 15-min data
    },
  };

  // Obtenir le point sélectionné (seulement si un index valide est sélectionné)
  const getSelectedPoint = () => {
    if (selectedIndex >= 0 && selectedIndex < data.solarProduction.length) {
      const solarPoint = data.solarProduction[selectedIndex];
      const housePoint = data.houseConsumption[selectedIndex];
      const zaptecPoint = data.zaptecConsumption[selectedIndex];
      const gridImportPoint = data.gridImported[selectedIndex];

      return {
        solar: Math.round(solarPoint?.value || 0),
        house: Math.round(housePoint?.value || 0),
        zaptec: Math.round(zaptecPoint?.value || 0),
        gridImport: Math.round(gridImportPoint?.value || 0),
        timestamp: solarPoint.timestamp,
        index: selectedIndex
      };
    }
    return null;
  };

  const selectedPoint = getSelectedPoint();


  // Gestion du clic sur un point pour afficher les détails
  const handleDataPointClick = (dataPoint: { index: number; value: number; x: number; y: number }) => {
    const originalDataIndex = dataPoint.index * step;
    const clickX = dataPoint.x;

    console.log(`Point cliqué: index=${dataPoint.index}, originalIndex=${originalDataIndex}, clickX=${clickX}`);

    if (originalDataIndex < data.solarProduction.length) {
      setSelectedIndex(originalDataIndex);
      setVerticalLineX(clickX);
      setShowVerticalLine(true);

      // Masquer la ligne après 3 secondes
      setTimeout(() => setShowVerticalLine(false), 3000);
    }
  };

  // Formatage de la date pour l'affichage
  const formatDateTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleString('fr-FR', options);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 193, 7, 1)' }]} />
          <Text style={styles.legendText}>Production</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(0, 123, 255, 1)' }]} />
          <Text style={styles.legendText}>Maison</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(40, 167, 69, 1)' }]} />
          <Text style={styles.legendText}>Zaptec</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'rgba(220, 53, 69, 1)' }]} />
          <Text style={styles.legendText}>Réseau</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            bezier={true}
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={true}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            withShadow={false}
            withDots={true}
            onDataPointClick={handleDataPointClick}
          />
          {showVerticalLine && (
            <View
              style={[
                styles.verticalLine,
                { left: verticalLineX }
              ]}
              pointerEvents="none"
            >
              <View style={styles.verticalLineInner} />
            </View>
          )}
        </View>
      </View>
      
      {/* Détails du point sélectionné */}
      {selectedPoint && (
        <View style={styles.selectedPointContainer}>
          <Text style={styles.selectedPointTitle}>📊 Point sélectionné ({selectedIndex + 1}/{data.solarProduction.length})</Text>
          <View style={styles.selectedPointDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date/Heure :</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(selectedPoint.timestamp)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: 'rgba(255, 193, 7, 1)' }]}>☀️ Production :</Text>
              <Text style={[styles.detailValue, { color: 'rgba(255, 193, 7, 1)' }]}>
                {selectedPoint.solar} W
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: 'rgba(0, 123, 255, 1)' }]}>🏠 Maison :</Text>
              <Text style={[styles.detailValue, { color: 'rgba(0, 123, 255, 1)' }]}>
                {selectedPoint.house} W
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: 'rgba(40, 167, 69, 1)' }]}>🚗 Zaptec :</Text>
              <Text style={[styles.detailValue, { color: 'rgba(40, 167, 69, 1)' }]}>
                {selectedPoint.zaptec} W
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: 'rgba(220, 53, 69, 1)' }]}>🔌 Import :</Text>
              <Text style={[styles.detailValue, { color: 'rgba(220, 53, 69, 1)' }]}>
                {selectedPoint.gridImport} W
              </Text>
            </View>
            {totalSolarEnergyKwh !== undefined && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: 'rgba(255, 193, 7, 1)' }]}>☀️ Total période :</Text>
                <Text style={[styles.detailValue, { color: 'rgba(255, 193, 7, 1)' }]}>
                  {totalSolarEnergyKwh.toFixed(1)} kWh
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Statistiques rapides */}
      {data.solarProduction.length > 0 && (
        <View style={styles.statsContainer}>
          {totalSolarEnergyKwh !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Production Totale</Text>
              <Text style={styles.statValue}>
                {totalSolarEnergyKwh.toFixed(1)} kWh
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Production Max</Text>
            <Text style={styles.statValue}>
              {Math.round(Math.max(...data.solarProduction.map(d => d.value)))}W
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Conso Moy</Text>
            <Text style={styles.statValue}>
              {Math.round(data.houseConsumption.reduce((sum, d) => sum + d.value, 0) / data.houseConsumption.length)}W
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Charge Zaptec</Text>
            <Text style={styles.statValue}>
              {Math.round(data.zaptecConsumption.reduce((sum, d) => sum + d.value, 0) / data.zaptecConsumption.length)}W
            </Text>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 0,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  selectedPointContainer: {
    backgroundColor: '#F8F9FA',
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedPointTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedPointDetails: {
    gap: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    marginVertical: 8,
    position: 'relative'
  },
  chartWrapper: {
    position: 'relative'
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
    pointerEvents: 'none'
  },
  verticalLineInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 2
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12
  },
});

export default DashboardChart;