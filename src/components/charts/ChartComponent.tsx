/**
 * Composant de base pour les graphiques
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import Slider from '@react-native-community/slider';
import { ChartDataPoint } from "../../types/chart.types";

const screenWidth = Dimensions.get("window").width;

interface ChartComponentProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
  unit?: string;
  chartType?: "line" | "bar";
  height?: number;
  showValues?: boolean;
  period?: "quarterly" | "hourly" | "daily" | "monthly" | "yearly";
  totalEnergy?: number; // Total energy in kWh (only for solar production charts)
}

const ChartComponent: React.FC<ChartComponentProps> = ({ title, data, color, unit = "W", chartType = "line", height = 220, showValues = false, period, totalEnergy }) => {
  // Ne rien afficher s'il n'y a pas de données
  if (data.length === 0) {
    return null;
  }

  // État pour gérer le point sélectionné via slider
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  // Calculer les paramètres d'échantillonnage
  const calculateSamplingParams = () => {

    let maxPoints = 12;
    let labelStep = 1;

    // Pour les données par quart d'heure (jour), afficher TOUS les points
    if (data.length > 80) {
      // Probablement des quarts d'heure
      maxPoints = data.length; // Afficher TOUS les points pour les quarts d'heure
      labelStep = 8; // Afficher les labels seulement toutes les 2 heures pour éviter l'encombrement
    } else if (data.length > 40) {
      maxPoints = data.length; // Afficher tous les points pour les données horaires aussi
      labelStep = 2; // Labels toutes les 2 heures
    }

    const step = Math.ceil(data.length / maxPoints);
    return { maxPoints, labelStep, step };
  };

  const { step, labelStep } = calculateSamplingParams();

  // Préparer les données pour react-native-chart-kit
  const prepareChartData = () => {

    const sampledData = data.filter((_, index) => index % step === 0);

    const labels = sampledData.map((point, index) => {
      const date = new Date(point.timestamp);
      const minutes = date.getMinutes();

      // Utiliser la période si fournie, sinon détecter le type de données
      if (period === "quarterly") {
        // Données par quart d'heure - afficher les labels stratégiquement
        if (index % labelStep === 0) {
          return minutes === 0 ? `${date.getHours()}h` : `${date.getHours()}h${minutes.toString().padStart(2, "0")}`;
        }
        return ""; // Label vide pour éviter l'encombrement
      } else if (period === "hourly") {
        // Affichage par heure avec jour pour les données de semaine
        if (index % labelStep === 0) {
          // Afficher le jour à certains moments clés (8h et 20h)
          if (date.getHours() === 8 || date.getHours() === 20 || date.getHours() === 0) {
            const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });
            return `${dayName} ${date.getHours()}h`;
          }
          return `${date.getHours()}h`;
        }
        return "";
      } else if (period === "daily") {
        // Affichage par jour
        return `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (period === "monthly") {
        // Affichage par mois avec nom du mois
        return date.toLocaleDateString("fr-FR", { month: "short" });
      } else {
        // Fallback : détecter le type de données par longueur
        if (data.length > 80) {
          // Données par quart d'heure - afficher les labels stratégiquement
          if (index % labelStep === 0) {
            return minutes === 0 ? `${date.getHours()}h` : `${date.getHours()}h${minutes.toString().padStart(2, "0")}`;
          }
          return "";
        } else if (data.length > 20 && data.length <= 24) {
          // Affichage par heure (données d'une journée)
          return `${date.getHours()}h`;
        } else if (data.length <= 20) {
          // Affichage par heure pour données moins fréquentes
          if (index % labelStep === 0) {
            return `${date.getHours()}h`;
          }
          return "";
        } else {
          // Affichage par jour
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      }
    });

    const values = sampledData.map((point) => Math.round(point.value));

    return {
      labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => color.replace("1)", `${opacity})`),
          strokeWidth: 2
        }
      ]
    };
  };

  const chartData = prepareChartData();

  // Gestion du clic sur un point pour positionner le slider
  const handleDataPointClick = (dataPoint: any) => {
    const originalDataIndex = dataPoint.index * step;
    if (originalDataIndex < data.length) {
      setSelectedIndex(originalDataIndex);
    }
  };

  // Calculer la largeur du graphique basée sur le nombre de points
  const calculateChartWidth = () => {
    const minWidth = screenWidth - 32; // Largeur minimum
    const pointWidth = period === "quarterly" ? 15 : period === "hourly" ? 25 : 40; // Largeur par point
    const calculatedWidth = chartData.labels.length * pointWidth;
    return Math.max(minWidth, calculatedWidth);
  };

  const chartWidth = calculateChartWidth();

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => color.replace("1)", `${opacity})`),
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: period === "quarterly" ? "3" : "4", // Smaller dots for dense data
      strokeWidth: "2",
      stroke: color,
      fill: color
    },
    decimalPlaces: 0,
    formatYLabel: (value: string) => `${value}${unit}`,
    // Reduce label size for daily charts with many data points
    propsForLabels: {
      fontSize: period === "quarterly" ? 8 : 12, // Smaller font for 15-min data
    },
  };

  // Formatage de la date pour l'affichage
  const formatDateTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    };
    return date.toLocaleString("fr-FR", options);
  };

  // Obtenir le point sélectionné
  const selectedPoint = data[selectedIndex];

  const Chart = chartType === "line" ? LineChart : BarChart;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Navigation par slider si on a des données */}
      {data.length > 1 && (
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderHint}>📍 Naviguez avec le curseur ou tapez sur un point du graphique</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(0, data.length - 1)}
            step={1}
            value={selectedIndex}
            onValueChange={(value) => setSelectedIndex(Math.round(value))}
            minimumTrackTintColor={color}
            maximumTrackTintColor="#E0E0E0"
          />
        </View>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollView} contentContainerStyle={styles.chartScrollContent}>
        <Chart
          data={chartData}
          width={chartWidth}
          height={height}
          chartConfig={chartConfig}
          bezier={chartType === "line"}
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
      </ScrollView>
      {/* Détails du point sélectionné */}
      {selectedPoint && (
        <View style={styles.selectedPointContainer}>
          <Text style={styles.selectedPointTitle}>📊 Point sélectionné ({selectedIndex + 1}/{data.length})</Text>
          <View style={styles.selectedPointDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valeur :</Text>
              <Text style={[styles.detailValue, { color }]}>
                {Math.round(selectedPoint.value)} {unit}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date/Heure :</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(selectedPoint.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {showValues && data.length > 0 && (
        <View style={styles.statsContainer}>
          {totalEnergy !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{totalEnergy.toFixed(1)} kWh</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={styles.statValue}>
              {Math.round(Math.max(...data.map((d) => d.value)))}
              {unit}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Moy</Text>
            <Text style={styles.statValue}>
              {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
              {unit}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min</Text>
            <Text style={styles.statValue}>
              {Math.round(Math.min(...data.map((d) => d.value)))}
              {unit}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12
  },
  sliderContainer: {
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  sliderHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
  },
  slider: {
    width: '100%',
    height: 40,
  },
  selectedPointContainer: {
    backgroundColor: "#F8F9FA",
    marginVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedPointTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  selectedPointDetails: {
    gap: 4,
  },
  chartScrollView: {
    marginVertical: 8
  },
  chartScrollContent: {
    paddingRight: 16
  },
  chart: {
    borderRadius: 16
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  statItem: {
    alignItems: "center"
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333"
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    marginLeft: 12
  }
});

export default ChartComponent;
