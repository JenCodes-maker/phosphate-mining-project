import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import api from "../services/api";

const SustainableWater = () => {
    const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [prediction, setPrediction] = useState(null);
const [predictionLoading, setPredictionLoading] = useState(false);
const [predictionError, setPredictionError] = useState("");
const [historicalPredictions, setHistoricalPredictions] = useState([]);
const [chartLoading, setChartLoading] = useState(true);
const [chartError, setChartError] = useState("");

const [modelMetrics, setModelMetrics] = useState(null);
const [modelLoading, setModelLoading] = useState(true);
const [modelError, setModelError] = useState("");

    const generateWaterForecast = async () => {
    try {
        setPredictionLoading(true);
        setPredictionError("");

        if (!latestData) {
            setPredictionError(
                "Latest mining data is not available."
            );
            return;
        }

        const response = await api.post(
            "/forecasting/water/predict/",
            {
                phosphate_production:
                    latestData.phosphate_production,

                phosphate_grade:
                    latestData.phosphate_grade || 31,

                operating_hours:
                    latestData.operating_hours || 19,

                equipment_utilization:
                    latestData.equipment_utilization,

                temperature:
                    latestData.temperature,

                rainfall:
                    latestData.rainfall,

                fuel_consumption:
                    latestData.fuel_consumption
            }
        );

        setPrediction(
            response.data.predicted_water_requirement
        );

    } catch (err) {
        console.error(
            "Water prediction error:",
            err
        );

        setPredictionError(
            err.response?.data?.error ||
            "Unable to generate water forecast."
        );

    } finally {
        setPredictionLoading(false);
    }
};

const fetchHistoricalPredictions = async () => {
    try {
        setChartLoading(true);
        setChartError("");

        const response = await api.get(
            "/forecasting/water/historical-predictions/"
        );

        setHistoricalPredictions(
            response.data.historical_predictions || []
        );

    } catch (err) {
        console.error(
            "Historical prediction error:",
            err
        );

        setChartError(
            err.response?.data?.error ||
            "Unable to load historical predictions."
        );

    } finally {
        setChartLoading(false);
    }
};


  const fetchModelMetrics = async () => {
    try {
        setModelLoading(true);
        setModelError("");

        const response = await api.get(
            "/forecasting/water/training-history/"
        );

        const history = response.data.history || [];

        if (history.length > 0) {
            setModelMetrics(history[0]);
        } else {
            setModelMetrics(null);
        }
    } catch (error) {
        console.error("Error fetching model metrics:", error);

        setModelError(
            error.response?.data?.error ||
            "Unable to load model performance."
        );
    } finally {
        setModelLoading(false);
    }
};

    const fetchWaterData = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/dashboard/sustainable-water/"
            );

            setData(response.data);

        } catch (err) {
            console.error(
                "Sustainable water dashboard error:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to load sustainable water data."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaterData();
        fetchHistoricalPredictions();
        fetchModelMetrics();
    }, []);

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading Sustainable Water Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
            <style>{`
                .sw-cards-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .sw-latest-card { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .sw-forecast-grid, .sw-status-content { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .sw-metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; margin-top: 20px; }
                .sw-metrics-grid .metric-box { min-width: 0; padding: 18px; border-radius: 12px; background: #f8fbff; border: 1px solid #e2e8f0; }
                .sw-metrics-grid .metric-box span { display: block; font-size: 12px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                .sw-metrics-grid .metric-box strong { display: block; font-size: 18px; color: #172554; font-weight: 800; overflow-wrap: anywhere; }
                .sw-metrics-grid + .model-status { margin-top: 20px; padding: 14px 18px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 14px; }
                .sw-cards-grid > div, .sw-latest-card > div { min-width: 0; }
                .sw-cards-grid > div:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(15,23,42,0.08); }
                .sw-table tbody tr:hover td { background: #f8fbff; }
                button:focus-visible { outline: 3px solid rgba(59,130,246,.45); outline-offset: 2px; }
                @media (max-width: 1050px) {
                    .sw-cards-grid, .sw-latest-card { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                }
                @media (max-width: 700px) {
                    .sw-cards-grid, .sw-latest-card, .sw-forecast-grid, .sw-status-content, .sw-metrics-grid { grid-template-columns: minmax(0, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    .sw-latest-card { padding: 16px !important; }
                    .sw-cards-grid > div { padding: 18px !important; }
                }
            `}</style>
                <div style={styles.error}>
                    {error}
                </div>
            </div>
        );
    }

    
    const summary = data?.summary || {};
const latest = data?.latest_data || {};
const historical = data?.historical_data || [];

const latestData = data?.latest_data || null;

    return (
        <div style={styles.container}>
            <style>{`
                .sw-cards-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .sw-latest-card { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .sw-forecast-grid, .sw-status-content { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .sw-metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; margin-top: 20px; }
                .sw-metrics-grid .metric-box { min-width: 0; padding: 18px; border-radius: 12px; background: #f8fbff; border: 1px solid #e2e8f0; }
                .sw-metrics-grid .metric-box span { display: block; font-size: 12px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
                .sw-metrics-grid .metric-box strong { display: block; font-size: 18px; color: #172554; font-weight: 800; overflow-wrap: anywhere; }
                .sw-metrics-grid + .model-status { margin-top: 20px; padding: 14px 18px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 14px; }
                .sw-cards-grid > div, .sw-latest-card > div { min-width: 0; }
                .sw-cards-grid > div:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(15,23,42,0.08); }
                .sw-table tbody tr:hover td { background: #f8fbff; }
                button:focus-visible { outline: 3px solid rgba(59,130,246,.45); outline-offset: 2px; }
                @media (max-width: 1050px) {
                    .sw-cards-grid, .sw-latest-card { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                }
                @media (max-width: 700px) {
                    .sw-cards-grid, .sw-latest-card, .sw-forecast-grid, .sw-status-content, .sw-metrics-grid { grid-template-columns: minmax(0, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    .sw-latest-card { padding: 16px !important; }
                    .sw-cards-grid > div { padding: 18px !important; }
                }
            `}</style>

            {/* =================================================
                HEADER
            ================================================= */}

            <div style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        Sustainable Water Management
                    </h1>

                    <p style={styles.subtitle}>
                        Phosphate Mining Resource Monitoring
                    </p>
                </div>

                <button
                    style={styles.refreshButton}
                    onClick={fetchWaterData}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                MAIN WATER CARDS
            ================================================= */}

            <div className="sw-cards-grid" style={styles.cardsGrid}>

                <MetricCard
                    title="Total Water Consumption"
                    value={
                        summary.total_water_consumption
                    }
                    unit="units"
                />

                <MetricCard
                    title="Average Water Consumption"
                    value={
                        summary.average_water_consumption
                    }
                    unit="units"
                />

                <MetricCard
                    title="Total Phosphate Production"
                    value={
                        summary.total_phosphate_production
                    }
                    unit="units"
                />

                <MetricCard
                    title="Average Production"
                    value={
                        summary.average_phosphate_production
                    }
                    unit="units"
                />

            </div>


            {/* =================================================
                ENVIRONMENTAL & OPERATIONAL CARDS
            ================================================= */}

            <h2 style={styles.sectionTitle}>
                Environmental & Operational Indicators
            </h2>

            <div className="sw-cards-grid" style={styles.cardsGrid}>

                <MetricCard
                    title="Average Temperature"
                    value={
                        summary.average_temperature
                    }
                    unit="°C"
                />

                <MetricCard
                    title="Average Rainfall"
                    value={
                        summary.average_rainfall
                    }
                    unit="mm"
                />

                <MetricCard
                    title="Average Fuel Consumption"
                    value={
                        summary.average_fuel_consumption
                    }
                    unit="units"
                />

                <MetricCard
                    title="Equipment Utilization"
                    value={
                        summary.average_equipment_utilization
                    }
                    unit="%"
                />

            </div>


            {/* =================================================
                LATEST MINING DATA
            ================================================= */}

            <h2 style={styles.sectionTitle}>
                Latest Mining Data
            </h2>

            <div className="sw-latest-card" style={styles.latestCard}>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Date
                    </span>

                    <strong>
                        {latest.date || "--"}
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Water Consumption
                    </span>

                    <strong>
                        {latest.water_consumption ?? "--"}
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Phosphate Production
                    </span>

                    <strong>
                        {latest.phosphate_production ?? "--"}
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Temperature
                    </span>

                    <strong>
                        {latest.temperature ?? "--"} °C
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Rainfall
                    </span>

                    <strong>
                        {latest.rainfall ?? "--"} mm
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Fuel Consumption
                    </span>

                    <strong>
                        {latest.fuel_consumption ?? "--"}
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Equipment Utilization
                    </span>

                    <strong>
                        {latest.equipment_utilization ?? "--"}%
                    </strong>
                </div>

                <div style={styles.latestItem}>
                    <span style={styles.latestLabel}>
                        Waste Generated
                    </span>

                    <strong>
                        {latest.waste_generated ?? "--"}
                    </strong>
                </div>

            </div>

            {/* =================================================
    WATER REQUIREMENT FORECAST
================================================= */}

<div style={styles.forecastCard}>

    <div style={styles.forecastHeader}>

        <div>
            <h2 style={styles.forecastTitle}>
                🔮 Water Requirement Forecast
            </h2>

            <p style={styles.forecastSubtitle}>
                Ridge Regression prediction based on
                current mining conditions
            </p>
        </div>

        <button
            style={styles.forecastButton}
            onClick={generateWaterForecast}
            disabled={predictionLoading}
        >
            {predictionLoading
                ? "⏳ Predicting..."
                : "🔮 Generate Forecast"}
        </button>

    </div>


    {predictionError && (
        <div style={styles.forecastError}>
            {predictionError}
        </div>
    )}


    <div className="sw-forecast-grid" style={styles.forecastGrid}>

        <div style={styles.forecastBox}>

            <span style={styles.forecastLabel}>
                Current Water Consumption
            </span>

            <strong style={styles.forecastValue}>
                {latest.water_consumption ?? "--"}
            </strong>

            <span style={styles.forecastUnit}>
                units
            </span>

        </div>


        <div style={styles.forecastBox}>

            <span style={styles.forecastLabel}>
                Predicted Water Requirement
            </span>

            <strong style={styles.predictedValue}>
                {prediction !== null
                    ? prediction
                    : "--"}
            </strong>

            <span style={styles.forecastUnit}>
                units
            </span>

        </div>


        <div style={styles.forecastBox}>

            <span style={styles.forecastLabel}>
                Difference
            </span>

            <strong style={styles.forecastValue}>

                {prediction !== null
                    ? (
                        prediction -
                        Number(
                            latest.water_consumption || 0
                        )
                    ).toFixed(2)
                    : "--"}

            </strong>

            <span style={styles.forecastUnit}>
                units
            </span>

        </div>

    </div>

</div>

<div className="dashboard-card">
    <h2>🤖 Model Performance</h2>

    {modelLoading ? (
        <p>Loading model performance...</p>
    ) : modelError ? (
        <p className="error-message">{modelError}</p>
    ) : modelMetrics ? (
        <>
            <div className="sw-metrics-grid metrics-grid">

                <div className="metric-box">
                    <span>Model</span>
                    <strong>{modelMetrics.model_name}</strong>
                </div>

                <div className="metric-box">
                    <span>Target</span>
                    <strong>{modelMetrics.target_variable}</strong>
                </div>

                <div className="metric-box">
                    <span>MAE</span>
                    <strong>
                        {Number(modelMetrics.mae).toFixed(2)}
                    </strong>
                </div>

                <div className="metric-box">
                    <span>RMSE</span>
                    <strong>
                        {Number(modelMetrics.rmse).toFixed(2)}
                    </strong>
                </div>

                <div className="metric-box">
                    <span>R² Score</span>
                    <strong>
                        {Number(modelMetrics.r2_score).toFixed(2)}
                    </strong>
                </div>

                <div className="metric-box">
                    <span>Alpha</span>
                    <strong>
                        {Number(modelMetrics.alpha).toFixed(2)}
                    </strong>
                </div>

            </div>

            <div className="model-status">
                🔄 Continuous Learning: <strong>Active</strong>
            </div>
        </>
    ) : (
        <p>No model training history available.</p>
    )}
</div>

{/* =================================================
    WATER REQUIREMENT STATUS
================================================= */}

{prediction !== null && (
    <div style={styles.statusCard}>

        <div style={styles.statusHeader}>

            <div>
                <h3 style={styles.statusTitle}>
                    💧 Water Requirement Status
                </h3>

                <p style={styles.statusSubtitle}>
                    Comparison between current water
                    consumption and predicted requirement
                </p>
            </div>

        </div>


        <div className="sw-status-content" style={styles.statusContent}>

            <div style={styles.statusMetric}>

                <span style={styles.statusLabel}>
                    Current Consumption
                </span>

                <strong style={styles.statusValue}>
                    {Number(
                        latest.water_consumption || 0
                    ).toFixed(2)}
                </strong>

                <span style={styles.statusUnit}>
                    units
                </span>

            </div>


            <div style={styles.statusMetric}>

                <span style={styles.statusLabel}>
                    Predicted Requirement
                </span>

                <strong style={styles.statusValue}>
                    {Number(prediction).toFixed(2)}
                </strong>

                <span style={styles.statusUnit}>
                    units
                </span>

            </div>


            <div style={styles.statusMetric}>

                <span style={styles.statusLabel}>
                    Difference
                </span>

                <strong style={styles.statusValue}>
                    {(
                        Number(prediction) -
                        Number(
                            latest.water_consumption || 0
                        )
                    ).toFixed(2)}
                </strong>

                <span style={styles.statusUnit}>
                    units
                </span>

            </div>

        </div>


        <div style={styles.statusMessage}>

            {Number(prediction) >
            Number(latest.water_consumption || 0) ? (

                <>
                    🔵 Predicted water requirement is
                    higher than the current recorded
                    consumption.
                </>

            ) : Number(prediction) <
              Number(latest.water_consumption || 0) ? (

                <>
                    🟠 Current recorded consumption is
                    higher than the model-predicted
                    requirement.
                </>

            ) : (

                <>
                    🟢 Current consumption and predicted
                    requirement are approximately equal.
                </>

            )}

        </div>

    </div>
)}


            {/* =================================================
                HISTORICAL WATER TABLE
            ================================================= */}

            <div style={styles.historyCard}>

                <div style={styles.historyHeader}>

                    <div>
                        <h2 style={styles.historyTitle}>
                            Historical Water Consumption
                        </h2>

                        <p style={styles.historySubtitle}>
                            Recorded mining water usage
                        </p>
                    </div>

                    <span style={styles.recordBadge}>
                        {historical.length} Records
                    </span>

                </div>


                {historical.length === 0 ? (

                    <div style={styles.empty}>
                        No historical data available.
                    </div>

                ) : (

                    <div style={styles.tableWrapper}>

                        <table className="sw-table" style={styles.table}>

                            <thead>

                                <tr>

                                    <th style={styles.th}>
                                        Date
                                    </th>

                                    <th style={styles.th}>
                                        Water Consumption
                                    </th>

                                    <th style={styles.th}>
                                        Production
                                    </th>

                                    <th style={styles.th}>
                                        Temperature
                                    </th>

                                    <th style={styles.th}>
                                        Rainfall
                                    </th>

                                    <th style={styles.th}>
                                        Fuel
                                    </th>

                                    <th style={styles.th}>
                                        Utilization
                                    </th>

                                    <th style={styles.th}>
                                        Waste
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {historical.map(
                                    (record, index) => (

                                        <tr key={index}>

                                            <td style={styles.td}>
                                                {record.date}
                                            </td>

                                            <td style={styles.td}>
                                                {record.water_consumption}
                                            </td>

                                            <td style={styles.td}>
                                                {record.phosphate_production}
                                            </td>

                                            <td style={styles.td}>
                                                {record.temperature} °C
                                            </td>

                                            <td style={styles.td}>
                                                {record.rainfall} mm
                                            </td>

                                            <td style={styles.td}>
                                                {record.fuel_consumption}
                                            </td>

                                            <td style={styles.td}>
                                                {record.equipment_utilization}%
                                            </td>

                                            <td style={styles.td}>
                                                {record.waste_generated}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =================================================
    ACTUAL VS PREDICTED WATER CHART
================================================= */}

<div style={styles.chartCard}>

    <div style={styles.chartHeader}>

        <div>
            <h2 style={styles.chartTitle}>
                📈 Actual vs Predicted Water Consumption
            </h2>

            <p style={styles.chartSubtitle}>
                Historical water consumption compared
                with Ridge Regression predictions
            </p>
        </div>

    </div>


    {chartError && (
        <div style={styles.forecastError}>
            {chartError}
        </div>
    )}


    {chartLoading ? (

        <div style={styles.chartLoading}>
            Loading prediction chart...
        </div>

    ) : historicalPredictions.length === 0 ? (

        <div style={styles.chartLoading}>
            No prediction data available.
        </div>

    ) : (

        <ResponsiveContainer
            width="100%"
            height={400}
        >

            <LineChart
                data={historicalPredictions}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                }}
            >

                <CartesianGrid
                    strokeDasharray="3 3"
                />

                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                />

                <YAxis
                    tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Legend />

                <Line
                    type="monotone"
                    dataKey="actual_water"
                    name="Actual Water"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                />

                <Line
                    type="monotone"
                    dataKey="predicted_water"
                    name="Predicted Water"
                    stroke="#16a34a"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                />

            </LineChart>

        </ResponsiveContainer>

    )}

</div>

            {/* =================================================
                PROJECT PURPOSE
            ================================================= */}

            <div style={styles.infoCard}>

                <h2 style={styles.infoTitle}>
                    💧 Sustainable Water Monitoring
                </h2>

                <p style={styles.infoText}>
                    This dashboard monitors historical water
                    consumption together with production,
                    environmental and operational factors.
                    These values provide the data foundation
                    for forecasting future water requirements
                    using the Ridge Regression model.
                </p>

            </div>

        </div>
    );
};


/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = ({
    title,
    value,
    unit
}) => {

    return (
        <div style={styles.metricCard}>

            <span style={styles.metricTitle}>
                {title}
            </span>

            <div style={styles.metricValueRow}>

                <span style={styles.metricValue}>
                    {value ?? "--"}
                </span>

                <span style={styles.metricUnit}>
                    {unit}
                </span>

            </div>

        </div>
    );
};


/* =========================================================
   STYLES
========================================================= */

const styles = {
    container: {
        padding: "clamp(16px, 3vw, 34px)",
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top left, rgba(219,234,254,0.72), transparent 38%), #f4f7fc",
        color: "#1e293b",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: "border-box",
    },

    loading: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontSize: "17px",
        fontWeight: "700",
        color: "#1d4ed8",
        background: "#f4f7fc",
        textAlign: "center",
    },

    error: {
        background: "#fff1f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        padding: "16px",
        borderRadius: "12px",
        lineHeight: 1.6,
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "18px",
        flexWrap: "wrap",
        marginBottom: "28px",
        padding: "26px 28px",
        color: "#ffffff",
        borderRadius: "20px",
        background: "linear-gradient(125deg, #10234f 0%, #1d4ed8 68%, #3b82f6 100%)",
        boxShadow: "0 14px 32px rgba(30,64,175,0.18)",
    },

    title: {
        margin: 0,
        fontSize: "clamp(25px, 3vw, 34px)",
        fontWeight: "800",
        lineHeight: 1.2,
        letterSpacing: "-0.8px",
        color: "#ffffff",
    },

    subtitle: {
        marginTop: "8px",
        marginBottom: 0,
        color: "rgba(239,246,255,0.84)",
        fontSize: "14px",
        lineHeight: 1.6,
    },

    refreshButton: {
        border: "1px solid rgba(255,255,255,0.28)",
        background: "rgba(255,255,255,0.13)",
        color: "#ffffff",
        padding: "11px 17px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "750",
        fontSize: "13px",
        whiteSpace: "nowrap",
    },

    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "17px",
        marginBottom: "25px",
    },

    metricCard: {
        minWidth: 0,
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)",
        padding: "22px",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(15,23,42,0.045)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
    },

    metricTitle: {
        display: "block",
        color: "#64748b",
        fontSize: "12px",
        fontWeight: "750",
        letterSpacing: "0.2px",
        lineHeight: 1.5,
        marginBottom: "12px",
    },

    metricValueRow: {
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: "6px",
    },

    metricValue: {
        fontSize: "clamp(22px, 2.2vw, 29px)",
        lineHeight: 1.2,
        fontWeight: "800",
        color: "#172554",
        overflowWrap: "anywhere",
    },

    metricUnit: {
        fontSize: "12px",
        color: "#64748b",
    },

    sectionTitle: {
        fontSize: "20px",
        color: "#172554",
        fontWeight: "800",
        letterSpacing: "-0.25px",
        marginTop: "30px",
        marginBottom: "15px",
    },

    latestCard: {
        background: "#ffffff",
        padding: "24px",
        border: "1px solid #e2e8f0",
        borderRadius: "17px",
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "22px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
    },

    latestItem: {
        display: "flex",
        minWidth: 0,
        flexDirection: "column",
        gap: "8px",
        padding: "13px",
        borderRadius: "11px",
        background: "#f8fafc",
    },

    latestLabel: {
        fontSize: "11px",
        color: "#64748b",
        fontWeight: "750",
        lineHeight: 1.5,
    },

    historyCard: {
        background: "#ffffff",
        padding: "clamp(18px, 2.5vw, 27px)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        marginTop: "25px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
        minWidth: 0,
    },

    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        marginBottom: "20px",
    },

    historyTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#172554",
        fontWeight: "800",
    },

    historySubtitle: {
        marginTop: "6px",
        marginBottom: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    recordBadge: {
        background: "#eff6ff",
        border: "1px solid #dbeafe",
        color: "#1d4ed8",
        padding: "8px 13px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "750",
        whiteSpace: "nowrap",
    },

    tableWrapper: {
        overflowX: "auto",
        width: "100%",
        border: "1px solid #e8edf5",
        borderRadius: "12px",
    },

    table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: "950px",
        background: "#ffffff",
    },

    th: {
        textAlign: "left",
        padding: "14px 13px",
        background: "#f1f5f9",
        color: "#475569",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
    },

    td: {
        padding: "14px 13px",
        borderBottom: "1px solid #edf2f7",
        color: "#475569",
        fontSize: "12px",
        lineHeight: 1.5,
        verticalAlign: "middle",
    },

    empty: {
        textAlign: "center",
        padding: "32px 20px",
        color: "#64748b",
        background: "#f8fafc",
        border: "1px dashed #cbd5e1",
        borderRadius: "12px",
    },

    infoCard: {
        background: "linear-gradient(135deg, #eff6ff, #ffffff)",
        border: "1px solid #dbeafe",
        padding: "25px",
        borderRadius: "16px",
        marginTop: "25px",
        boxShadow: "0 6px 20px rgba(15,23,42,0.035)",
    },

    infoTitle: {
        marginTop: 0,
        fontSize: "20px",
        color: "#172554",
        fontWeight: "800",
    },

    infoText: {
        color: "#475569",
        lineHeight: 1.8,
        marginBottom: 0,
        fontSize: "14px",
    },

    forecastCard: {
        background: "#ffffff",
        padding: "clamp(18px, 2.5vw, 27px)",
        border: "1px solid #dbeafe",
        borderRadius: "18px",
        marginTop: "25px",
        boxShadow: "0 8px 24px rgba(37,99,235,0.06)",
    },

    forecastHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "23px",
    },

    forecastTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#172554",
        fontWeight: "800",
    },

    forecastSubtitle: {
        marginTop: "7px",
        marginBottom: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    forecastButton: {
        border: "1px solid transparent",
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        padding: "12px 17px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "750",
        fontSize: "13px",
        boxShadow: "0 5px 12px rgba(37,99,235,0.18)",
    },

    forecastError: {
        background: "#fff1f2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        padding: "13px 15px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontSize: "13px",
        lineHeight: 1.5,
    },

    forecastGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "16px",
    },

    forecastBox: {
        minWidth: 0,
        background: "linear-gradient(145deg, #f8fbff, #eff6ff)",
        border: "1px solid #dbeafe",
        padding: "21px",
        borderRadius: "13px",
        display: "flex",
        flexDirection: "column",
        gap: "9px",
    },

    forecastLabel: {
        color: "#64748b",
        fontSize: "12px",
        fontWeight: "700",
        lineHeight: 1.5,
    },

    forecastValue: {
        fontSize: "clamp(23px, 2.4vw, 30px)",
        fontWeight: "800",
        color: "#172554",
        overflowWrap: "anywhere",
    },

    predictedValue: {
        fontSize: "clamp(23px, 2.4vw, 30px)",
        fontWeight: "800",
        color: "#2563eb",
        overflowWrap: "anywhere",
    },

    forecastUnit: {
        color: "#64748b",
        fontSize: "12px",
    },

    chartCard: {
        background: "#ffffff",
        padding: "clamp(18px, 2.5vw, 27px)",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        marginTop: "25px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
        minWidth: 0,
    },

    chartHeader: {
        marginBottom: "20px",
    },

    chartTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#172554",
        fontWeight: "800",
    },

    chartSubtitle: {
        marginTop: "7px",
        marginBottom: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    chartLoading: {
        minHeight: "250px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: "#64748b",
        background: "#f8fafc",
        borderRadius: "12px",
        textAlign: "center",
        fontSize: "14px",
    },

    statusCard: {
        background: "#ffffff",
        padding: "clamp(18px, 2.5vw, 27px)",
        border: "1px solid #dbeafe",
        borderRadius: "18px",
        marginTop: "20px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
    },

    statusHeader: {
        marginBottom: "22px",
    },

    statusTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#172554",
        fontWeight: "800",
    },

    statusSubtitle: {
        marginTop: "7px",
        marginBottom: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    statusContent: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "16px",
    },

    statusMetric: {
        minWidth: 0,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        padding: "20px",
        borderRadius: "13px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },

    statusLabel: {
        color: "#64748b",
        fontSize: "12px",
        fontWeight: "700",
        lineHeight: 1.5,
    },

    statusValue: {
        fontSize: "clamp(22px, 2.2vw, 28px)",
        fontWeight: "800",
        color: "#172554",
        overflowWrap: "anywhere",
    },

    statusUnit: {
        color: "#64748b",
        fontSize: "12px",
    },

    statusMessage: {
        marginTop: "18px",
        padding: "15px 16px",
        background: "#eff6ff",
        border: "1px solid #dbeafe",
        borderRadius: "10px",
        color: "#1e40af",
        fontSize: "13px",
        lineHeight: 1.7,
    },

    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "15px",
        marginTop: "20px",
    },

    metricBox: {
        minWidth: 0,
        padding: "18px",
        borderRadius: "12px",
        background: "#f8fbff",
        border: "1px solid #e2e8f0",
    },

    metricBoxLabel: {
        display: "block",
        fontSize: "12px",
        color: "#64748b",
        fontWeight: "700",
        marginBottom: "8px",
    },

    metricBoxValue: {
        display: "block",
        fontSize: "18px",
        color: "#172554",
        fontWeight: "800",
        overflowWrap: "anywhere",
    },

    modelStatus: {
        marginTop: "20px",
        padding: "14px 18px",
        borderRadius: "10px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#166534",
        fontSize: "14px",
    },
};

/* Responsive styles for this single-file component */
const responsiveStyles = `
  @media (max-width: 1050px) {
    .sustainable-water-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;


export default SustainableWater;