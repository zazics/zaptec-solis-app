/**
 * Composant de base pour les graphiques
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
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
  // État pour gérer les détails du point sélectionné
  const [selectedPoint, setSelectedPoint] = useState<{
    value: number;
    timestamp: Date;
    index: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Calculer les paramètres d'échantillonnage
  const calculateSamplingParams = () => {
    if (data.length === 0) return { maxPoints: 12, labelStep: 1, step: 1 };

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
    if (data.length === 0) {
      return {
        labels: ["Pas de données"],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`
          }
        ]
      };
    }

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
        // Affichage par mois
        return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
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

  // Gestion du clic sur un point
  const handleDataPointClick = (dataPoint: any) => {
    const originalDataIndex = dataPoint.index * step; // Retrouver l'index dans les données originales
    const originalPoint = data[originalDataIndex];

    if (originalPoint) {
      setSelectedPoint({
        value: originalPoint.value,
        timestamp: originalPoint.timestamp,
        index: dataPoint.index
      });
      setShowModal(true);
    }
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

  const Chart = chartType === "line" ? LineChart : BarChart;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {data.length > 10 && (
        <Text style={styles.tapHint}>💡 Tapez sur un point du graphique pour voir les détails</Text>
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
          onDataPointClick={handleDataPointClick}
          withShadow={false}
          withDots={true}
        />
      </ScrollView>
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

      {/* Modal pour les détails du point */}
      <Modal visible={showModal} transparent={true} animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Détails du point</Text>

            {selectedPoint && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valeur :</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(selectedPoint.value)} {unit}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date/Heure :</Text>
                  <Text style={styles.detailValue}>{formatDateTime(selectedPoint.timestamp)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Position :</Text>
                  <Text style={styles.detailValue}>Point #{selectedPoint.index + 1}</Text>
                </View>

                {totalEnergy !== undefined && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total période :</Text>
                    <Text style={styles.detailValue}>{totalEnergy.toFixed(1)} kWh</Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tapHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500"
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    marginLeft: 12
  },
  closeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignSelf: "center"
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  }
});

export default ChartComponent;
