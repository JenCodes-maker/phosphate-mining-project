import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import api from "../services/api";

const SustainabilityInsights = () => {
  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [latestData, setLatestData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [modelHistory, setModelHistory] = useState(null);
  // =========================================================
// FUTURE WATER PREDICTION
// =========================================================

const [futureInputs, setFutureInputs] = useState({
    phosphate_production: "",
    phosphate_grade: "",
    operating_hours: "",
    equipment_utilization: "",
    temperature: "",
    rainfall: "",
    fuel_consumption: "",
});

const [futurePrediction, setFuturePrediction] = useState(null);
const [predictionLoading, setPredictionLoading] = useState(false);
const [predictionError, setPredictionError] = useState("");

  // =========================================================
  // FETCH SUSTAINABILITY DATA
  // =========================================================

  const fetchInsights = async () => {
    try {
        setLoading(true);
        setError("");

        // -----------------------------------------
        // Sustainability Insights
        // -----------------------------------------

        const insightsResponse = await api.get(
            "/dashboard/sustainability-insights/"
        );

        // -----------------------------------------
        // Historical Sustainable Water Data
        // -----------------------------------------

        const waterResponse = await api.get(
            "/dashboard/sustainable-water/"
        );

        // -----------------------------------------
        // Latest Mining Data
        // -----------------------------------------

        const latest = waterResponse.data?.latest_data || null;

        setData(insightsResponse.data);

        setHistoricalData(
            waterResponse.data?.historical_data || []
        );

        setLatestData(latest);

        // -----------------------------------------
        // Training History
        // -----------------------------------------

        const historyResponse = await api.get(
            "/forecasting/water/training-history/"
        );

        const history =
            historyResponse.data?.history ||
            historyResponse.data?.results ||
            historyResponse.data ||
            [];

        const latestModel =
            Array.isArray(history) && history.length > 0
                ? history[history.length - 1]
                : null;

        setModelHistory(latestModel);

        // -----------------------------------------
        // AI WATER PREDICTION
        // -----------------------------------------

        if (latest) {
            const predictionResponse = await api.post(
                "/forecasting/water/predict/",
                {
                    phosphate_production:
                        Number(latest.phosphate_production || 0),

                    phosphate_grade:
                        Number(latest.phosphate_grade || 0),

                    operating_hours:
                        Number(latest.operating_hours || 0),

                    equipment_utilization:
                        Number(latest.equipment_utilization || 0),

                    temperature:
                        Number(latest.temperature || 0),

                    rainfall:
                        Number(latest.rainfall || 0),

                    fuel_consumption:
                        Number(latest.fuel_consumption || 0),
                }
            );

            setPrediction(
    Number(
        predictionResponse.data?.predicted_water_requirement || 0
    )
);
        }

    } catch (err) {

        console.error(
            "Failed to fetch sustainability insights:",
            err
        );

        setError(
            err.response?.data?.error ||
            err.response?.data?.detail ||
            "Failed to load sustainability insights."
        );

    } finally {
        setLoading(false);
    }
};

// =========================================================
// FUTURE WATER PREDICTION FUNCTION
// =========================================================

const predictFutureWater = async () => {
    try {
        setPredictionLoading(true);
        setPredictionError("");
        setFuturePrediction(null);

        const response = await api.post(
            "/forecasting/water/predict/",
            {
                phosphate_production:
                    Number(futureInputs.phosphate_production),

                phosphate_grade:
                    Number(futureInputs.phosphate_grade),

                operating_hours:
                    Number(futureInputs.operating_hours),

                equipment_utilization:
                    Number(futureInputs.equipment_utilization),

                temperature:
                    Number(futureInputs.temperature),

                rainfall:
                    Number(futureInputs.rainfall),

                fuel_consumption:
                    Number(futureInputs.fuel_consumption),
            }
        );

        setFuturePrediction(
            Number(
                response.data?.predicted_water_requirement || 0
            )
        );

    } catch (err) {

        console.error(
            "Future water prediction failed:",
            err
        );

        setPredictionError(
            err.response?.data?.error ||
            err.response?.data?.detail ||
            "Unable to generate water prediction."
        );

    } finally {
        setPredictionLoading(false);
    }
};

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchInsights();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="sustainability-insights-page" style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loadingIcon}>🌱</div>

          <h3>Loading Sustainability Insights...</h3>

          <p>Analyzing mining sustainability data.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="sustainability-insights-page" style={styles.page}>
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>

          <h3>Unable to Load Sustainability Insights</h3>

          <p>{error}</p>

          <button onClick={fetchInsights} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // INSIGHTS
  // =========================================================

  const insights = data?.insights || {};

  // =========================================================
// AI WATER FORECAST
// =========================================================

const currentWater =
    Number(latestData?.water_consumption || 0);

const predictedWater =
    Number(prediction || 0);

const waterDifference =
    predictedWater - currentWater;

const waterDifferencePercentage =
    currentWater > 0
        ? (Math.abs(waterDifference) / currentWater) * 100
        : 0;

let forecastStatus =
    "Water requirement is within the expected range.";

if (waterDifference > 0) {
    forecastStatus =
        "⚠️ Predicted water requirement is higher than current consumption.";
} else if (waterDifference < 0) {
    forecastStatus =
        "✅ Predicted water requirement is lower than current consumption.";
}

  // =========================================================
  // KPI VALUES
  // =========================================================

  const totalWater = Number(insights.total_water_consumption || 0);

  const totalProduction = Number(insights.total_phosphate_production || 0);

  const totalWaste = Number(insights.total_waste_generated || 0);

  const utilization = Number(insights.average_equipment_utilization || 0);

  const temperature = Number(insights.average_temperature || 0);

  const rainfall = Number(insights.average_rainfall || 0);

  const waterPerProduction = Number(insights.water_per_production_unit || 0);

  const wastePerProduction = Number(insights.waste_per_production_unit || 0);
  
  // =========================================================
  // CHART DATA
  // =========================================================

  const chartData = historicalData.map((record, index) => ({
    date: record.date ? String(record.date).slice(5) : `Record ${index + 1}`,

    water: Number(record.water_consumption || 0),

    production: Number(record.phosphate_production || 0),

    waste: Number(record.waste_generated || 0),

    utilization: Number(record.equipment_utilization || 0),

    temperature: Number(record.temperature || 0),

    rainfall: Number(record.rainfall || 0),
  }));

  // =========================================================
  // STATUS
  // =========================================================

  let waterStatus = "Water usage is being monitored.";

  if (waterPerProduction <= 0.1) {
    waterStatus = "Water efficiency is currently at a good level.";
  } else if (waterPerProduction <= 0.15) {
    waterStatus =
      "Water usage is moderate and should continue to be monitored.";
  } else {
    waterStatus =
      "Water consumption is relatively high compared with production.";
  }

  let utilizationStatus = "Equipment utilization is being monitored.";

  if (utilization >= 85) {
    utilizationStatus =
      "Equipment utilization is at a strong operational level.";
  } else if (utilization >= 70) {
    utilizationStatus = "Equipment utilization is at a moderate level.";
  } else {
    utilizationStatus = "Equipment utilization could be improved.";
  }

  let wasteStatus = "Waste generation is being monitored.";

  if (wastePerProduction === 0) {
    wasteStatus =
      "No recorded waste generation is currently available in the dataset.";
  } else if (wastePerProduction <= 0.05) {
    wasteStatus = "Waste generation per production unit is relatively low.";
  } else {
    wasteStatus =
      "Waste generation should be monitored for sustainability improvement.";
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="sustainability-insights-page" style={styles.page}>
      <style>{`
        .sustainability-insights-page * { box-sizing: border-box; }
        .sustainability-insights-page button { transition: transform .18s ease, box-shadow .18s ease, filter .18s ease; }
        .sustainability-insights-page button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.02); }
        .sustainability-insights-page button:disabled { opacity: .65; cursor: wait; }
        .sustainability-insights-page input:focus { border-color: #0f9b8e !important; box-shadow: 0 0 0 3px rgba(15,155,142,.13); background: #fff !important; }
        .sustainability-insights-page .recharts-cartesian-grid-horizontal line,
        .sustainability-insights-page .recharts-cartesian-grid-vertical line { stroke: #e8eef2; }
        .sustainability-insights-page .recharts-text { fill: #718096; font-size: 11px; }
        @media (max-width: 640px) {
          .sustainability-insights-page { padding: 14px !important; }
          .sustainability-insights-page h1 { line-height: 1.2; }
          .sustainability-insights-page button { max-width: 100%; }
          .sustainability-insights-page .recharts-legend-wrapper { font-size: 11px; }
        }
      `}</style>
      {/* =================================================
                HEADER
            ================================================= */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sustainability Insights</h1>

          <p style={styles.subtitle}>
            Environmental and operational sustainability analysis for phosphate
            mining.
          </p>
        </div>

        <button onClick={fetchInsights} style={styles.refreshButton}>
          ↻ Refresh
        </button>
      </div>

      {/* =================================================
                SUMMARY CARDS
            ================================================= */}

      <div style={styles.cardGrid}>
        {/* WATER */}

        <div style={styles.card}>
          <div style={styles.icon}>💧</div>

          <div>
            <p style={styles.cardLabel}>Total Water Consumption</p>

            <h2 style={styles.cardValue}>{totalWater.toFixed(2)}</h2>

            <p style={styles.cardUnit}>units</p>
          </div>
        </div>

        {/* PRODUCTION */}

        <div style={styles.card}>
          <div style={styles.icon}>⛏️</div>

          <div>
            <p style={styles.cardLabel}>Total Phosphate Production</p>

            <h2 style={styles.cardValue}>{totalProduction.toFixed(2)}</h2>

            <p style={styles.cardUnit}>units</p>
          </div>
        </div>

        {/* WASTE */}

        <div style={styles.card}>
          <div style={styles.icon}>♻️</div>

          <div>
            <p style={styles.cardLabel}>Total Waste Generated</p>

            <h2 style={styles.cardValue}>{totalWaste.toFixed(2)}</h2>

            <p style={styles.cardUnit}>units</p>
          </div>
        </div>

        {/* UTILIZATION */}

        <div style={styles.card}>
          <div style={styles.icon}>⚙️</div>

          <div>
            <p style={styles.cardLabel}>Equipment Utilization</p>

            <h2 style={styles.cardValue}>{utilization.toFixed(2)}%</h2>

            <p style={styles.cardUnit}>average</p>
          </div>
        </div>

        {/* TEMPERATURE */}

        <div style={styles.card}>
          <div style={styles.icon}>🌡️</div>

          <div>
            <p style={styles.cardLabel}>Average Temperature</p>

            <h2 style={styles.cardValue}>{temperature.toFixed(2)}°C</h2>

            <p style={styles.cardUnit}>average</p>
          </div>
        </div>

        {/* RAINFALL */}

        <div style={styles.card}>
          <div style={styles.icon}>🌧️</div>

          <div>
            <p style={styles.cardLabel}>Average Rainfall</p>

            <h2 style={styles.cardValue}>{rainfall.toFixed(2)}</h2>

            <p style={styles.cardUnit}>mm</p>
          </div>
        </div>
      </div>

      {/* =================================================
    AI WATER REQUIREMENT FORECAST
================================================= */}

<div style={styles.section}>

    <h2 style={styles.sectionTitle}>
        🤖 AI-Based Water Requirement Forecast
    </h2>

    <p style={styles.sectionDescription}>
        Ridge Regression predicts the water requirement
        using current mining and environmental conditions.
    </p>

    <div style={styles.aiForecastCard}>

        <div style={styles.forecastGrid}>

            <div style={styles.forecastBox}>
                <div style={styles.forecastIcon}>💧</div>

                <p style={styles.forecastLabel}>
                    Current Water Consumption
                </p>

                <h2 style={styles.forecastValue}>
                    {currentWater.toFixed(2)}
                </h2>

                <span style={styles.forecastUnit}>
                    units
                </span>
            </div>


            <div style={styles.forecastBox}>
                <div style={styles.forecastIcon}>🤖</div>

                <p style={styles.forecastLabel}>
                    AI Predicted Water Requirement
                </p>

                <h2 style={styles.forecastValue}>
                    {predictedWater.toFixed(2)}
                </h2>

                <span style={styles.forecastUnit}>
                    units
                </span>
            </div>


            <div style={styles.forecastBox}>
                <div style={styles.forecastIcon}>📊</div>

                <p style={styles.forecastLabel}>
                    Difference
                </p>

                <h2 style={styles.forecastValue}>
                    {Math.abs(waterDifference).toFixed(2)}
                </h2>

                <span style={styles.forecastUnit}>
                    units
                </span>
            </div>

        </div>


        <div style={styles.forecastStatus}>

            <strong>
                Water Requirement Status
            </strong>

            <p>
                {forecastStatus}
            </p>

            {currentWater > 0 && (
                <p>
                    Difference percentage:{" "}
                    {waterDifferencePercentage.toFixed(2)}%
                </p>
            )}

        </div>


        <div style={styles.modelSection}>

            <h3 style={styles.modelTitle}>
                🧠 Ridge Regression Model
            </h3>

            <div style={styles.modelGrid}>

                <div>
                    <span style={styles.modelLabel}>
                        Model
                    </span>

                    <strong>
                        {modelHistory?.model_name ||
                            "Ridge Regression"}
                    </strong>
                </div>


                <div>
                    <span style={styles.modelLabel}>
                        Target Variable
                    </span>

                    <strong>
                        {modelHistory?.target_variable ||
                            "Water Consumption"}
                    </strong>
                </div>


                <div>
                    <span style={styles.modelLabel}>
                        MAE
                    </span>

                    <strong>
                        {modelHistory?.mae !== undefined
                            ? Number(modelHistory.mae).toFixed(4)
                            : "N/A"}
                    </strong>
                </div>


                <div>
                    <span style={styles.modelLabel}>
                        RMSE
                    </span>

                    <strong>
                        {modelHistory?.rmse !== undefined
                            ? Number(modelHistory.rmse).toFixed(4)
                            : "N/A"}
                    </strong>
                </div>


                <div>
                    <span style={styles.modelLabel}>
                        R² Score
                    </span>

                    <strong>
                        {modelHistory?.r2_score !== undefined
                            ? Number(modelHistory.r2_score).toFixed(4)
                            : "N/A"}
                    </strong>
                </div>


                <div>
                    <span style={styles.modelLabel}>
                        Alpha
                    </span>

                    <strong>
                        {modelHistory?.alpha !== undefined
                            ? Number(modelHistory.alpha).toFixed(2)
                            : "1.00"}
                    </strong>
                </div>

            </div>

        </div>


        {latestData && (
            <div style={styles.inputSection}>

                <h3 style={styles.modelTitle}>
                    📋 Prediction Input Conditions
                </h3>

                <div style={styles.inputGrid}>

                    <span>
                        Production:{" "}
                        <strong>
                            {Number(
                                latestData.phosphate_production || 0
                            ).toFixed(2)}
                        </strong>
                    </span>

                    <span>
                        Grade:{" "}
                        <strong>
                            {Number(
                                latestData.phosphate_grade || 0
                            ).toFixed(2)}
                        </strong>
                    </span>

                    <span>
                        Operating Hours:{" "}
                        <strong>
                            {Number(
                                latestData.operating_hours || 0
                            ).toFixed(2)}
                        </strong>
                    </span>

                    <span>
                        Utilization:{" "}
                        <strong>
                            {Number(
                                latestData.equipment_utilization || 0
                            ).toFixed(2)}%
                        </strong>
                    </span>

                    <span>
                        Temperature:{" "}
                        <strong>
                            {Number(
                                latestData.temperature || 0
                            ).toFixed(2)}°C
                        </strong>
                    </span>

                    <span>
                        Rainfall:{" "}
                        <strong>
                            {Number(
                                latestData.rainfall || 0
                            ).toFixed(2)} mm
                        </strong>
                    </span>

                    <span>
                        Fuel:{" "}
                        <strong>
                            {Number(
                                latestData.fuel_consumption || 0
                            ).toFixed(2)}
                        </strong>
                    </span>

                </div>

            </div>
        )}

    </div>

</div>

  {/* =================================================
      FUTURE WATER PREDICTION
  ================================================= */}

  <div style={styles.section}>

      <h2 style={styles.sectionTitle}>
          🔮 Future Water Requirement Prediction
      </h2>

      <p style={styles.sectionDescription}>
          Enter future mining and environmental conditions
          to estimate the required water consumption using
          the Ridge Regression model.
      </p>

      <div style={styles.futurePredictionCard}>

          <div style={styles.futureInputGrid}>

              {/* PRODUCTION */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Phosphate Production
                  </label>

                  <input
                      type="number"
                      value={futureInputs.phosphate_production}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              phosphate_production: e.target.value,
                          })
                      }
                      placeholder="Example: 1500"
                      style={styles.futureInput}
                  />

              </div>


              {/* GRADE */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Phosphate Grade
                  </label>

                  <input
                      type="number"
                      value={futureInputs.phosphate_grade}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              phosphate_grade: e.target.value,
                          })
                      }
                      placeholder="Example: 31"
                      style={styles.futureInput}
                  />

              </div>


              {/* OPERATING HOURS */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Operating Hours
                  </label>

                  <input
                      type="number"
                      value={futureInputs.operating_hours}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              operating_hours: e.target.value,
                          })
                      }
                      placeholder="Example: 19"
                      style={styles.futureInput}
                  />

              </div>


              {/* EQUIPMENT UTILIZATION */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Equipment Utilization (%)
                  </label>

                  <input
                      type="number"
                      value={futureInputs.equipment_utilization}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              equipment_utilization: e.target.value,
                          })
                      }
                      placeholder="Example: 85"
                      style={styles.futureInput}
                  />

              </div>


              {/* TEMPERATURE */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Temperature (°C)
                  </label>

                  <input
                      type="number"
                      value={futureInputs.temperature}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              temperature: e.target.value,
                          })
                      }
                      placeholder="Example: 31"
                      style={styles.futureInput}
                  />

              </div>


              {/* RAINFALL */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Rainfall (mm)
                  </label>

                  <input
                      type="number"
                      value={futureInputs.rainfall}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              rainfall: e.target.value,
                          })
                      }
                      placeholder="Example: 5"
                      style={styles.futureInput}
                  />

              </div>


              {/* FUEL */}

              <div style={styles.inputField}>

                  <label style={styles.inputLabel}>
                      Fuel Consumption
                  </label>

                  <input
                      type="number"
                      value={futureInputs.fuel_consumption}
                      onChange={(e) =>
                          setFutureInputs({
                              ...futureInputs,
                              fuel_consumption: e.target.value,
                          })
                      }
                      placeholder="Example: 780"
                      style={styles.futureInput}
                  />

              </div>

          </div>


          {/* PREDICT BUTTON */}

          <button
              onClick={predictFutureWater}
              disabled={predictionLoading}
              style={styles.predictButton}
          >
              {predictionLoading
                  ? "🤖 Predicting..."
                  : "🔮 Predict Future Water Requirement"}
          </button>


          {/* ERROR */}

          {predictionError && (
              <div style={styles.predictionError}>
                  ⚠️ {predictionError}
              </div>
          )}


          {/* RESULT */}

          {futurePrediction !== null && (
              <div style={styles.futureResult}>

                  <div style={styles.futureResultIcon}>
                      💧
                  </div>

                  <div>

                      <p style={styles.futureResultLabel}>
                          Predicted Water Requirement
                      </p>

                      <h2 style={styles.futureResultValue}>
                          {futurePrediction.toFixed(2)}
                      </h2>

                      <span style={styles.forecastUnit}>
                          units
                      </span>

                  </div>

              </div>
          )}

      </div>

  </div>




      {/* =================================================
                CHARTS
            ================================================= */}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Sustainability Trends</h2>

        <p style={styles.sectionDescription}>
          Historical environmental and operational indicators from the mining
          dataset.
        </p>

        <div style={styles.chartGrid}>
          {/* ==========================================
                        WATER VS PRODUCTION
                    ========================================== */}

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              💧 Water Consumption vs Production
            </h3>

            <p style={styles.chartDescription}>
              Comparison of water consumption and phosphate production over
              time.
            </p>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water Consumption"
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Phosphate Production"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==========================================
                        WASTE VS PRODUCTION
                    ========================================== */}

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>♻️ Waste Generation vs Production</h3>

            <p style={styles.chartDescription}>
              Monitoring waste generation against phosphate production.
            </p>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="waste"
                    name="Waste Generated"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="production"
                    name="Phosphate Production"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==========================================
                        EQUIPMENT UTILIZATION
                    ========================================== */}

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>⚙️ Equipment Utilization Trend</h3>

            <p style={styles.chartDescription}>
              Historical equipment utilization across mining operations.
            </p>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis domain={[0, 100]} />

                  <Tooltip />

                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="utilization"
                    name="Equipment Utilization (%)"
                    stroke="#7c3aed"
                    fill="#ddd6fe"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==========================================
                        ENVIRONMENTAL INDICATORS
                    ========================================== */}

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🌍 Environmental Indicators</h3>

            <p style={styles.chartDescription}>
              Temperature and rainfall patterns across the historical dataset.
            </p>

            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
                EFFICIENCY METRICS
            ================================================= */}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Sustainability Efficiency Metrics</h2>

        <div style={styles.efficiencyGrid}>
          {/* WATER */}

          <div style={styles.efficiencyCard}>
            <div style={styles.efficiencyHeader}>
              <span>💧</span>

              <h3>Water Efficiency</h3>
            </div>

            <div style={styles.metricValue}>
              {waterPerProduction.toFixed(4)}
            </div>

            <p style={styles.metricDescription}>
              Water consumption per unit of phosphate production.
            </p>

            <div style={styles.statusBox}>{waterStatus}</div>
          </div>

          {/* WASTE */}

          <div style={styles.efficiencyCard}>
            <div style={styles.efficiencyHeader}>
              <span>♻️</span>

              <h3>Waste Efficiency</h3>
            </div>

            <div style={styles.metricValue}>
              {wastePerProduction.toFixed(4)}
            </div>

            <p style={styles.metricDescription}>
              Waste generated per unit of phosphate production.
            </p>

            <div style={styles.statusBox}>{wasteStatus}</div>
          </div>

          {/* EQUIPMENT */}

          <div style={styles.efficiencyCard}>
            <div style={styles.efficiencyHeader}>
              <span>⚙️</span>

              <h3>Equipment Efficiency</h3>
            </div>

            <div style={styles.metricValue}>{utilization.toFixed(2)}%</div>

            <p style={styles.metricDescription}>
              Average utilization of mining equipment.
            </p>

            <div style={styles.statusBox}>{utilizationStatus}</div>
          </div>
        </div>
      </div>

      {/* =================================================
                SUSTAINABILITY MONITORING
            ================================================= */}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Sustainability Monitoring</h2>

        <div style={styles.insightGrid}>
          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>💧</div>

            <div>
              <h3 style={styles.insightTitle}>Water Management</h3>

              <p style={styles.insightText}>
                Water consumption is analyzed relative to phosphate production
                to support efficient water resource management.
              </p>
            </div>
          </div>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>♻️</div>

            <div>
              <h3 style={styles.insightTitle}>Waste Management</h3>

              <p style={styles.insightText}>
                Waste generation is tracked against production to support
                sustainable mining practices.
              </p>
            </div>
          </div>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>⚙️</div>

            <div>
              <h3 style={styles.insightTitle}>Operational Efficiency</h3>

              <p style={styles.insightText}>
                Equipment utilization is monitored to identify opportunities for
                improving operational efficiency.
              </p>
            </div>
          </div>

          <div style={styles.insightCard}>
            <div style={styles.insightIcon}>🌱</div>

            <div>
              <h3 style={styles.insightTitle}>Sustainable Mining</h3>

              <p style={styles.insightText}>
                Environmental and operational indicators can be monitored
                continuously to support more sustainable mining decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
                DATASET INFORMATION
            ================================================= */}

      <div style={styles.datasetCard}>
        <div>
          <h3 style={styles.datasetTitle}>Sustainability Dataset</h3>

          <p style={styles.datasetText}>
            Analysis is based on <strong>{data?.record_count || 0}</strong>{" "}
            mining records available in the system.
          </p>
        </div>

        <div style={styles.activeBadge}>● Monitoring Active</div>
      </div>
    </div>
  );
};

// =========================================================
// STYLES
// =========================================================

const styles = {
  page: {
    padding: "clamp(18px, 3vw, 34px)",
    background: "linear-gradient(180deg, #f3f7fb 0%, #f8fafc 45%, #f1f5f9 100%)",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    color: "#102033",
    boxSizing: "border-box",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "28px", gap: "20px", flexWrap: "wrap",
    padding: "28px 30px", borderRadius: "22px",
    background: "linear-gradient(120deg, #073b3a 0%, #0f766e 54%, #159e8b 100%)",
    boxShadow: "0 16px 35px rgba(15, 118, 110, .18)",
    color: "#ffffff",
  },
  title: { margin: 0, fontSize: "clamp(26px, 3vw, 34px)", color: "#ffffff", fontWeight: "800", letterSpacing: "-.7px" },
  subtitle: { marginTop: "9px", marginBottom: 0, color: "#d9f7f0", fontSize: "14px", lineHeight: 1.7, maxWidth: "700px" },
  refreshButton: {
    border: "1px solid rgba(255,255,255,.35)", borderRadius: "11px",
    padding: "12px 18px", background: "#ffffff", color: "#0f766e",
    cursor: "pointer", fontSize: "14px", fontWeight: "750",
    boxShadow: "0 5px 14px rgba(0,0,0,.08)", whiteSpace: "nowrap",
  },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: "16px" },
  card: {
    background: "#ffffff", border: "1px solid #e3ebf2", borderRadius: "17px",
    padding: "21px", display: "flex", alignItems: "center", gap: "15px",
    boxShadow: "0 5px 18px rgba(15, 35, 55, .045)", minWidth: 0,
    transition: "transform .2s ease, box-shadow .2s ease",
  },
  icon: {
    fontSize: "26px", display: "grid", placeItems: "center", flexShrink: 0,
    width: "54px", height: "54px", borderRadius: "15px",
    background: "#e7f8f4",
  },
  cardLabel: { margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "650", lineHeight: 1.5 },
  cardValue: { margin: "7px 0 2px", color: "#102a43", fontSize: "clamp(21px, 2vw, 27px)", fontWeight: "800", letterSpacing: "-.5px", overflowWrap: "anywhere" },
  cardUnit: { margin: 0, color: "#94a3b8", fontSize: "12px" },
  section: { marginTop: "32px" },
  sectionTitle: { margin: "0 0 8px", color: "#102a43", fontSize: "22px", fontWeight: "800", letterSpacing: "-.35px" },
  sectionDescription: { marginTop: 0, marginBottom: "18px", color: "#64748b", fontSize: "14px", lineHeight: 1.7, maxWidth: "850px" },
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 430px), 1fr))", gap: "18px" },
  chartCard: { background: "#ffffff", border: "1px solid #e3ebf2", borderRadius: "18px", padding: "22px", boxShadow: "0 6px 22px rgba(15, 35, 55, .045)", minWidth: 0 },
  chartTitle: { margin: 0, color: "#102a43", fontSize: "16px", fontWeight: "750" },
  chartDescription: { marginTop: "8px", marginBottom: "16px", color: "#718096", fontSize: "13px", lineHeight: 1.6 },
  chartContainer: { width: "100%", height: "290px", minWidth: 0 },
  efficiencyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "17px" },
  efficiencyCard: { background: "#ffffff", border: "1px solid #e3ebf2", borderRadius: "17px", padding: "23px", boxShadow: "0 5px 18px rgba(15, 35, 55, .045)", minWidth: 0 },
  efficiencyHeader: { display: "flex", alignItems: "center", gap: "11px", marginBottom: "16px", color: "#173b4e" },
  metricValue: { fontSize: "30px", fontWeight: "850", color: "#0f8b7d", marginBottom: "8px", letterSpacing: "-.7px" },
  metricDescription: { color: "#64748b", fontSize: "13px", lineHeight: "1.7", marginBottom: "16px" },
  statusBox: { background: "#effaf6", border: "1px solid #c5eee0", color: "#17634f", borderRadius: "11px", padding: "13px", fontSize: "12px", lineHeight: "1.65" },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: "17px" },
  insightCard: { background: "#ffffff", border: "1px solid #e3ebf2", borderRadius: "17px", padding: "21px", display: "flex", gap: "15px", boxShadow: "0 5px 18px rgba(15, 35, 55, .04)", minWidth: 0 },
  insightIcon: { fontSize: "25px", display: "grid", placeItems: "center", width: "48px", height: "48px", flexShrink: 0, borderRadius: "14px", background: "#edf8f5" },
  insightTitle: { margin: "0 0 8px", color: "#173b4e", fontSize: "15px", fontWeight: "750" },
  insightText: { margin: 0, color: "#64748b", fontSize: "13px", lineHeight: "1.7" },
  datasetCard: { marginTop: "30px", background: "linear-gradient(120deg, #ffffff, #f3fbf8)", border: "1px solid #dcebe7", borderRadius: "17px", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" },
  datasetTitle: { margin: "0 0 7px", color: "#173b4e", fontSize: "16px", fontWeight: "800" },
  datasetText: { margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6 },
  activeBadge: { background: "#dff8eb", color: "#13704d", padding: "10px 14px", borderRadius: "30px", fontSize: "12px", fontWeight: "750", whiteSpace: "nowrap", border: "1px solid #b8ecd2" },
  loading: { textAlign: "center", padding: "100px 20px", color: "#64748b", fontSize: "16px", background: "#ffffff", borderRadius: "20px", maxWidth: "620px", margin: "70px auto", boxShadow: "0 12px 35px rgba(15,35,55,.06)" },
  loadingIcon: { fontSize: "45px", marginBottom: "10px" },
  error: { maxWidth: "600px", margin: "80px auto", background: "#ffffff", border: "1px solid #fecaca", borderRadius: "18px", padding: "30px", textAlign: "center", boxShadow: "0 12px 35px rgba(15,35,55,.06)" },
  errorIcon: { fontSize: "40px", marginBottom: "10px" },
  retryButton: { marginTop: "15px", border: "none", borderRadius: "10px", padding: "11px 18px", background: "#dc2626", color: "#ffffff", cursor: "pointer", fontWeight: "700" },
  aiForecastCard: { background: "#ffffff", border: "1px solid #dce8ed", borderRadius: "20px", padding: "clamp(18px, 2.5vw, 28px)", boxShadow: "0 7px 24px rgba(15,35,55,.05)" },
  forecastGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: "16px" },
  forecastBox: { background: "linear-gradient(145deg, #f7fbfc, #eff8f6)", border: "1px solid #dcebe7", borderRadius: "15px", padding: "22px 16px", textAlign: "center", minWidth: 0 },
  forecastIcon: { fontSize: "28px", marginBottom: "8px" },
  forecastLabel: { margin: 0, color: "#64748b", fontSize: "12px", lineHeight: 1.6 },
  forecastValue: { margin: "9px 0 2px", color: "#102a43", fontSize: "clamp(25px, 3vw, 32px)", fontWeight: "850", letterSpacing: "-.5px", overflowWrap: "anywhere" },
  forecastUnit: { color: "#94a3b8", fontSize: "12px" },
  forecastStatus: { marginTop: "20px", padding: "16px 18px", borderRadius: "12px", background: "#effaf6", border: "1px solid #c5eee0", color: "#17634f", lineHeight: "1.7", fontSize: "13px" },
  modelSection: { marginTop: "24px", paddingTop: "22px", borderTop: "1px solid #e5edf2" },
  modelTitle: { margin: "0 0 16px", color: "#173b4e", fontSize: "16px", fontWeight: "800" },
  modelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "12px" },
  modelGridItem: { background: "#f5f9fb", padding: "14px", borderRadius: "10px" },
  modelLabel: { display: "block", color: "#718096", fontSize: "11px", marginBottom: "6px", fontWeight: "650" },
  inputSection: { marginTop: "24px", paddingTop: "22px", borderTop: "1px solid #e5edf2" },
  inputGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "12px", color: "#526578", fontSize: "12px" },
  futurePredictionCard: { background: "#ffffff", border: "1px solid #dce8ed", borderRadius: "20px", padding: "clamp(18px, 2.5vw, 28px)", boxShadow: "0 7px 24px rgba(15,35,55,.05)" },
  futureInputGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 225px), 1fr))", gap: "18px" },
  inputField: { display: "flex", flexDirection: "column", minWidth: 0 },
  inputLabel: { marginBottom: "8px", color: "#334e60", fontSize: "12px", fontWeight: "750" },
  futureInput: { width: "100%", boxSizing: "border-box", padding: "13px 14px", border: "1px solid #d4e0e7", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fbfdfe", color: "#102a43" },
  predictButton: { marginTop: "24px", border: "none", borderRadius: "11px", padding: "14px 20px", background: "linear-gradient(120deg, #0f766e, #0d9488)", color: "#ffffff", cursor: "pointer", fontSize: "14px", fontWeight: "750", boxShadow: "0 7px 16px rgba(15,118,110,.18)", maxWidth: "100%" },
  predictionError: { marginTop: "18px", padding: "13px", borderRadius: "10px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#b91c1c", fontSize: "13px" },
  futureResult: { marginTop: "24px", padding: "22px", borderRadius: "15px", background: "linear-gradient(120deg, #effaf6, #e4f7ed)", border: "1px solid #bdebd4", display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" },
  futureResultIcon: { fontSize: "40px" },
  futureResultLabel: { margin: 0, color: "#17634f", fontSize: "13px", fontWeight: "650" },
  futureResultValue: { margin: "5px 0 0", color: "#14532d", fontSize: "31px", fontWeight: "850" },
};

export default SustainabilityInsights;
