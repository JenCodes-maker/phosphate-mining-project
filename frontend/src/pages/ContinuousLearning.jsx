import React, { useEffect, useState } from "react";
import api from "../services/api";

const ContinuousLearning = () => {
    const [history, setHistory] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [retraining, setRetraining] = useState(false);
const [success, setSuccess] = useState("");

    const fetchTrainingHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/forecasting/water/training-history/"
            );

            setHistory(response.data.history || []);

        } catch (err) {
            console.error("Training history error:", err);

            setError(
                err.response?.data?.error ||
                "Unable to load training history."
            );

        } finally {
            setLoading(false);
        }
    };

    const retrainModel = async () => {
    try {
        setRetraining(true);
        setError("");
        setSuccess("");

        const response = await api.post(
            "/forecasting/water/retrain/"
        );

        setSuccess(
            response.data.message ||
            "Model retrained successfully."
        );

        // Refresh training history
        await fetchTrainingHistory();

    } catch (err) {
        console.error("Model retraining error:", err);

        setError(
            err.response?.data?.error ||
            "Unable to retrain the model."
        );

    } finally {
        setRetraining(false);
    }
};

    useEffect(() => {
        fetchTrainingHistory();
    }, []);

    const latestTraining = history.length > 0
        ? history[0]
        : null;

    return (
        <div style={styles.container}>

            {/* PAGE HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Continuous Learning
                    </h1>

                    <p style={styles.subtitle}>
                        Ridge Regression Water Forecasting Model
                    </p>
                </div>

                <div style={styles.statusBadge}>
                    ● Model Active
                </div>
            </div>


            {/* ERROR */}
            {success && (
    <div style={styles.success}>
        ✓ {success}
    </div>
)}


            {/* LOADING */}
            {loading ? (
                <div style={styles.loading}>
                    Loading training history...
                </div>
            ) : (
                <>
                    {/* MODEL INFORMATION */}
                    <div style={styles.infoCard}>

                        <div>
                            <span style={styles.label}>
                                MODEL
                            </span>

                            <h2 style={styles.value}>
                                Ridge Regression
                            </h2>
                        </div>

                        <div>
                            <span style={styles.label}>
                                TARGET
                            </span>

                            <h2 style={styles.value}>
                                Water Consumption
                            </h2>
                        </div>

                        <div>
                            <span style={styles.label}>
                                STATUS
                            </span>

                            <h2 style={styles.active}>
                                Active
                            </h2>
                        </div>

                    </div>


                    {/* METRIC CARDS */}
                    <div style={styles.metricsGrid}>

                        <MetricCard
                            title="Training Records"
                            value={
                                latestTraining
                                    ? latestTraining.training_records
                                    : "--"
                            }
                        />

                        <MetricCard
                            title="Testing Records"
                            value={
                                latestTraining
                                    ? latestTraining.testing_records
                                    : "--"
                            }
                        />

                        <MetricCard
                            title="MAE"
                            value={
                                latestTraining
                                    ? Number(latestTraining.mae).toFixed(2)
                                    : "--"
                            }
                        />

                        <MetricCard
                            title="RMSE"
                            value={
                                latestTraining
                                    ? Number(latestTraining.rmse).toFixed(2)
                                    : "--"
                            }
                        />

                        <MetricCard
                            title="R² Score"
                            value={
                                latestTraining
                                    ? Number(latestTraining.r2_score).toFixed(2)
                                    : "--"
                            }
                        />

                        <MetricCard
                            title="Alpha"
                            value={
                                latestTraining
                                    ? latestTraining.alpha
                                    : "--"
                            }
                        />

                    </div>


                    {/* LAST TRAINED */}
                    {latestTraining && (
                        <div style={styles.lastTrained}>
                            <strong>Last trained:</strong>{" "}
                            {new Date(
                                latestTraining.trained_at
                            ).toLocaleString()}
                        </div>
                    )}


                    {/* TRAINING HISTORY */}
                    <div style={styles.historyCard}>

                        <div style={styles.historyHeader}>

                            <div>
                                <h2 style={styles.historyTitle}>
                                    Training History
                                </h2>

                                <p style={styles.historySubtitle}>
                                    Previous Ridge Regression training runs
                                </p>
                            </div>

                            <div style={styles.buttonGroup}>

    <button
        style={styles.refreshButton}
        onClick={fetchTrainingHistory}
        disabled={retraining}
    >
        ↻ Refresh
    </button>

    <button
        style={{
            ...styles.retrainButton,
            opacity: retraining ? 0.7 : 1,
        }}
        onClick={retrainModel}
        disabled={retraining}
    >
        {retraining
            ? "⏳ Retraining..."
            : "🔄 Retrain Model"}
    </button>

</div>

                        </div>


                        {history.length === 0 ? (

                            <div style={styles.empty}>
                                No training history available.
                            </div>

                        ) : (

                            <div style={styles.tableWrapper}>

                                <table style={styles.table}>

                                    <thead>
                                        <tr>
                                            <th style={styles.th}>
                                                #
                                            </th>

                                            <th style={styles.th}>
                                                Model
                                            </th>

                                            <th style={styles.th}>
                                                Training
                                            </th>

                                            <th style={styles.th}>
                                                Testing
                                            </th>

                                            <th style={styles.th}>
                                                MAE
                                            </th>

                                            <th style={styles.th}>
                                                RMSE
                                            </th>

                                            <th style={styles.th}>
                                                R²
                                            </th>

                                            <th style={styles.th}>
                                                Alpha
                                            </th>

                                            <th style={styles.th}>
                                                Trained At
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {history.map((record, index) => (

                                            <tr key={record.id}>

                                                <td style={styles.td}>
                                                    {index + 1}
                                                </td>

                                                <td style={styles.td}>
                                                    {record.model_name}
                                                </td>

                                                <td style={styles.td}>
                                                    {record.training_records}
                                                </td>

                                                <td style={styles.td}>
                                                    {record.testing_records}
                                                </td>

                                                <td style={styles.td}>
                                                    {Number(
                                                        record.mae
                                                    ).toFixed(2)}
                                                </td>

                                                <td style={styles.td}>
                                                    {Number(
                                                        record.rmse
                                                    ).toFixed(2)}
                                                </td>

                                                <td style={styles.td}>
                                                    {Number(
                                                        record.r2_score
                                                    ).toFixed(2)}
                                                </td>

                                                <td style={styles.td}>
                                                    {record.alpha}
                                                </td>

                                                <td style={styles.td}>
                                                    {new Date(
                                                        record.trained_at
                                                    ).toLocaleString()}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </>
            )}

        </div>
    );
};


/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = ({ title, value }) => {

    return (
        <div style={styles.metricCard}>

            <span style={styles.metricTitle}>
                {title}
            </span>

            <span style={styles.metricValue}>
                {value}
            </span>

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

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "25px",
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

    statusBadge: {
        background: "#dcfce7",
        color: "#166534",
        padding: "10px 15px",
        border: "1px solid #bbf7d0",
        borderRadius: "999px",
        fontWeight: "750",
        fontSize: "12px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },

    error: {
        background: "#fff1f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        padding: "14px 16px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontSize: "13px",
        lineHeight: 1.5,
    },

    loading: {
        padding: "48px 24px",
        textAlign: "center",
        color: "#1d4ed8",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
        fontWeight: "700",
    },

    infoCard: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "20px",
        background: "#ffffff",
        padding: "25px",
        border: "1px solid #e2e8f0",
        borderRadius: "17px",
        marginBottom: "20px",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
    },

    label: {
        display: "block",
        fontSize: "11px",
        color: "#64748b",
        fontWeight: "800",
        letterSpacing: "0.7px",
        marginBottom: "9px",
    },

    value: {
        margin: 0,
        fontSize: "clamp(17px, 2vw, 21px)",
        lineHeight: 1.35,
        color: "#172554",
        fontWeight: "800",
        overflowWrap: "anywhere",
    },

    active: {
        margin: 0,
        fontSize: "20px",
        color: "#16a34a",
        fontWeight: "800",
    },

    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "17px",
        marginBottom: "20px",
    },

    metricCard: {
        position: "relative",
        minWidth: 0,
        background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)",
        padding: "22px",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(15,23,42,0.045)",
        overflow: "hidden",
    },

    metricTitle: {
        display: "block",
        color: "#64748b",
        fontSize: "12px",
        fontWeight: "750",
        letterSpacing: "0.25px",
        marginBottom: "12px",
        lineHeight: 1.5,
    },

    metricValue: {
        display: "block",
        color: "#1d4ed8",
        fontSize: "clamp(23px, 2.4vw, 30px)",
        fontWeight: "800",
        lineHeight: 1.2,
        overflowWrap: "anywhere",
    },

    lastTrained: {
        background: "#eff6ff",
        border: "1px solid #dbeafe",
        padding: "17px 21px",
        borderRadius: "12px",
        marginBottom: "20px",
        color: "#1e40af",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    historyCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "clamp(18px, 2.5vw, 27px)",
        boxShadow: "0 7px 24px rgba(15,23,42,0.045)",
        minWidth: 0,
    },

    historyHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "21px",
    },

    historyTitle: {
        margin: 0,
        fontSize: "21px",
        color: "#172554",
        fontWeight: "800",
        letterSpacing: "-0.3px",
    },

    historySubtitle: {
        marginTop: "6px",
        marginBottom: 0,
        color: "#64748b",
        fontSize: "13px",
        lineHeight: 1.6,
    },

    buttonGroup: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
    },

    refreshButton: {
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "11px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "750",
        fontSize: "13px",
        transition: "background 160ms ease",
    },

    retrainButton: {
        border: "1px solid transparent",
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        padding: "11px 16px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "750",
        fontSize: "13px",
        boxShadow: "0 5px 12px rgba(37,99,235,0.18)",
    },

    empty: {
        textAlign: "center",
        padding: "34px 20px",
        color: "#64748b",
        background: "#f8fafc",
        border: "1px dashed #cbd5e1",
        borderRadius: "12px",
        fontSize: "14px",
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
        minWidth: "900px",
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
        letterSpacing: "0.45px",
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

    success: {
        background: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
        padding: "14px 16px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontWeight: "700",
        fontSize: "13px",
        lineHeight: 1.5,
    },
};


export default ContinuousLearning;