import { useEffect, useState } from "react";
import api from "../services/api";
import "./Forecasting.css";

function Forecasting() {
  const [formData, setFormData] = useState({
    lag_1: "",
    lag_7: "",
    rolling_7: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [forecastDate, setForecastDate] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [waterHistory, setWaterHistory] = useState([]);
  const [waterHistoryError, setWaterHistoryError] = useState("");
  const [waterHistoryLoading, setWaterHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH MINING DATA
  // ==========================================

  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await api.get("/mining/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Sort data by production date
        const sortedData = [...response.data].sort(
          (a, b) =>
            new Date(a.production_date) -
            new Date(b.production_date)
        );

        const formattedData = sortedData.map((item) => ({
          date: item.production_date,
          production: Number(
            item.phosphate_production || 0
          ),
        }));

        setChartData(formattedData);

        // Automatically fill forecasting inputs
        // using the latest historical data

        if (formattedData.length >= 8) {
          const latestProduction =
            formattedData[
              formattedData.length - 1
            ].production;

          const sevenDaysAgo =
            formattedData[
              formattedData.length - 8
            ].production;

          const lastSeven =
            formattedData.slice(-7);

          const average =
            lastSeven.reduce(
              (total, item) =>
                total + item.production,
              0
            ) / lastSeven.length;

          setFormData({
            lag_1: latestProduction.toFixed(2),
            lag_7: sevenDaysAgo.toFixed(2),
            rolling_7: average.toFixed(2),
          });
        }
      } catch (err) {
        console.error(
          "Failed to fetch mining data:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Session expired. Please login again."
          );
        } else {
          setError(
            "Failed to load mining production data."
          );
        }
      }
    };

    fetchMiningData();
  }, []);

  // ==========================================
  // FETCH HISTORICAL ACTUAL VS PREDICTED WATER
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchWaterHistory = async () => {
      setWaterHistoryLoading(true);
      setWaterHistoryError("");

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          throw new Error("Please login again to view water predictions.");
        }

        const response = await api.get(
          "/forecasting/water/historical-predictions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

  const rows = (response.data?.historical_predictions || [])
  .map((item) => ({
    date: item.date,
    actual:
      item.actual_water === null ||
      item.actual_water === undefined
        ? null
        : Number(item.actual_water),
    predicted: Number(item.predicted_water),
  }))
  .filter(
    (item) =>
      item.date &&
      (item.actual === null || Number.isFinite(item.actual)) &&
      Number.isFinite(item.predicted)
  )
  .sort((a, b) => new Date(a.date) - new Date(b.date));


        if (!cancelled) {
          setWaterHistory(rows);
          if (rows.length === 0) {
            setWaterHistoryError(
              response.data?.message || "No historical water prediction records are available."
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setWaterHistory([]);
          setWaterHistoryError(
            err.response?.data?.error ||
              err.message ||
              "Could not load historical water predictions."
          );
        }
      } finally {
        if (!cancelled) setWaterHistoryLoading(false);
      }
    };

    fetchWaterHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // GENERATE FORECAST
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPrediction(null);
    setForecastDate(null);
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access");

      const response = await api.post(
        "/forecasting/production/",
        {
          lag_1: Number(formData.lag_1),
          lag_7: Number(formData.lag_7),
          rolling_7: Number(formData.rolling_7),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const predictedValue =
        response.data.predicted_production;

      setPrediction(predictedValue);

      // Calculate next forecast date
      if (chartData.length > 0) {
        const lastDate = new Date(
          chartData[chartData.length - 1].date
        );

        lastDate.setDate(
          lastDate.getDate() + 1
        );

        setForecastDate(
          lastDate.toISOString().split("T")[0]
        );
      }
    } catch (err) {
      console.error(
        "Forecast generation error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.error ||
            "Failed to generate forecast."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHART DATA
  // ==========================================

  const displayData = [...chartData];

  if (
    prediction !== null &&
    forecastDate
  ) {
    displayData.push({
      date: forecastDate,
      production: Number(prediction),
      isForecast: true,
    });
  }

  const chartWidth = 800;
  const chartHeight = 350;
  const padding = 50;

  const values = displayData.map(
    (item) => item.production
  );

  const minValue =
    values.length > 0
      ? Math.min(...values)
      : 0;

  const maxValue =
    values.length > 0
      ? Math.max(...values)
      : 100;

  const range =
    maxValue - minValue === 0
      ? 1
      : maxValue - minValue;

  // ==========================================
  // CREATE CHART POINTS
  // ==========================================

  const points = displayData
    .map((item, index) => {
      const x =
        padding +
        (index /
          Math.max(
            displayData.length - 1,
            1
          )) *
          (chartWidth - padding * 2);

      const y =
        chartHeight -
        padding -
        ((item.production - minValue) /
          range) *
          (chartHeight - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="forecasting-container">

      {/* ===================================== */}
      {/* FORECASTING CARD */}
      {/* ===================================== */}

      <div className="forecasting-card">

        <h1 className="forecasting-title">
          Phosphate Production Forecast
        </h1>

        <p className="forecasting-description">
          Machine learning based production
          forecasting using historical mining
          production data.
        </p>

        {/* ================================= */}
        {/* FORECAST FORM */}
        {/* ================================= */}

        <form
          className="forecasting-form"
          onSubmit={handleSubmit}
        >

          {/* LAG 1 */}

          <div className="forecasting-field">

            <label>
              Previous Day Production
            </label>

            <input
              type="number"
              step="any"
              name="lag_1"
              value={formData.lag_1}
              onChange={handleChange}
              placeholder="Enter production"
              required
            />

          </div>

          {/* LAG 7 */}

          <div className="forecasting-field">

            <label>
              Production 7 Days Ago
            </label>

            <input
              type="number"
              step="any"
              name="lag_7"
              value={formData.lag_7}
              onChange={handleChange}
              placeholder="Enter production"
              required
            />

          </div>

          {/* ROLLING 7 */}

          <div className="forecasting-field">

            <label>
              7-Day Average Production
            </label>

            <input
              type="number"
              step="any"
              name="rolling_7"
              value={formData.rolling_7}
              onChange={handleChange}
              placeholder="Enter average"
              required
            />

          </div>

          {/* BUTTON */}

          <button
            className="forecasting-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Forecast"}
          </button>

        </form>

        {/* ================================= */}
        {/* ERROR MESSAGE */}
        {/* ================================= */}

        {error && (
          <p className="forecasting-error">
            {error}
          </p>
        )}

      </div>

      {/* ===================================== */}
      {/* FORECAST RESULT */}
      {/* ===================================== */}

      {prediction !== null && (
        <div className="forecast-result-card">

          <div className="forecast-result-content">

            <h2>
              🔮 Predicted Production
            </h2>

            <p>
              Machine learning forecast
            </p>

          </div>

          <div className="forecast-result-value">

            {Number(prediction).toFixed(2)}

          </div>

        </div>
      )}

      {/* ===================================== */}
      {/* FORECAST INPUT SUMMARY */}
      {/* ===================================== */}

      {prediction !== null && (
        <div className="forecast-input-summary">

          <h2>
            Forecast Input Summary
          </h2>

          <div className="forecast-input-grid">

            <div className="input-summary-card">

              <span>
                Lag 1
              </span>

              <strong>
                {Number(
                  formData.lag_1
                ).toFixed(2)}
              </strong>

            </div>

            <div className="input-summary-card">

              <span>
                Lag 7
              </span>

              <strong>
                {Number(
                  formData.lag_7
                ).toFixed(2)}
              </strong>

            </div>

            <div className="input-summary-card">

              <span>
                7-Day Average
              </span>

              <strong>
                {Number(
                  formData.rolling_7
                ).toFixed(2)}
              </strong>

            </div>

            <div className="input-summary-card">

              <span>
                Forecast Date
              </span>

              <strong>
                {forecastDate || "-"}
              </strong>

            </div>

          </div>

        </div>
      )}

      {/* ===================================== */}
      {/* PRODUCTION HISTORY */}
      {/* ===================================== */}

      {chartData.length > 0 && (
        <div className="chart-section">

          <h2>
            Production History & Forecast
          </h2>

          <div className="chart-wrapper">

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="production-chart"
              preserveAspectRatio="none"
            >

              {/* X AXIS */}

              <line
                x1={padding}
                y1={
                  chartHeight - padding
                }
                x2={
                  chartWidth - padding
                }
                y2={
                  chartHeight - padding
                }
                stroke="#999"
                strokeWidth="1"
              />

              {/* Y AXIS */}

              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={
                  chartHeight - padding
                }
                stroke="#999"
                strokeWidth="1"
              />

              {/* PRODUCTION LINE */}

              <polyline
                points={points}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />

              {/* DATA POINTS */}

              {displayData.map(
                (item, index) => {

                  const x =
                    padding +
                    (index /
                      Math.max(
                        displayData.length - 1,
                        1
                      )) *
                      (chartWidth -
                        padding * 2);

                  const y =
                    chartHeight -
                    padding -
                    ((item.production -
                      minValue) /
                      range) *
                      (chartHeight -
                        padding * 2);

                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={
                        item.isForecast
                          ? "7"
                          : "3"
                      }
                      fill={
                        item.isForecast
                          ? "#dc2626"
                          : "#2563eb"
                      }
                    />
                  );
                }
              )}

            </svg>

          </div>

          {/* ================================= */}
          {/* CHART INFORMATION */}
          {/* ================================= */}

          <div className="chart-info">

            <span>
              Minimum:{" "}
              {minValue.toFixed(2)}
            </span>

            <span>
              Maximum:{" "}
              {maxValue.toFixed(2)}
            </span>

            <span>
              Historical Records:{" "}
              {chartData.length}
            </span>

            {prediction !== null && (
              <span>
                Forecast:{" "}
                {Number(
                  prediction
                ).toFixed(2)}
              </span>
            )}

          </div>

          {/* LEGEND */}

          <div className="forecast-chart-legend">

            <span>
              <i className="legend-history"></i>
              Historical Production
            </span>

            <span>
              <i className="legend-forecast"></i>
              ML Forecast
            </span>

          </div>

        </div>
      )}

      {/* ===================================== */}
      {/* ACTUAL VS PREDICTED WATER CONSUMPTION */}
      {/* ===================================== */}
      <div className="chart-section">
        <h2>💧 Actual vs Predicted Water Consumption</h2>
        <p className="water-chart-note">
          Historical comparison from the Ridge Regression model. These predictions
          are generated for existing records; because the model may have been trained
          on these records, this chart is for visualization and is not an unbiased
          test-set accuracy report.
        </p>

        {waterHistoryLoading ? (
          <p className="water-chart-status">Loading historical water predictions...</p>
        ) : waterHistoryError ? (
          <p className="forecasting-error">{waterHistoryError}</p>
        ) : (
          <>
            {(() => {
              // Only compare rows that have a known, finite actual measurement.
              const knownRows = waterHistory.filter(
                (row) => row.actual !== null && Number.isFinite(row.actual)
              );
              const errors = knownRows.map((row) => row.predicted - row.actual);
              const mae = errors.length
                ? errors.reduce((sum, value) => sum + Math.abs(value), 0) / errors.length
                : null;
              const rmse = errors.length
                ? Math.sqrt(
                    errors.reduce((sum, value) => sum + value * value, 0) / errors.length
                  )
                : null;

              const width = 800;
              const height = 350;
              const pad = 48;
              const values = waterHistory.flatMap((row) =>
                row.actual === null ? [row.predicted] : [row.actual, row.predicted]
              );
              const min = values.length ? Math.min(...values) : 0;
              const max = values.length ? Math.max(...values) : 1;
              const range = max - min || 1;

              const pointFor = (value, index) => {
                const x =
                  pad +
                  (index / Math.max(waterHistory.length - 1, 1)) *
                    (width - pad * 2);
                const y =
                  height - pad - ((value - min) / range) * (height - pad * 2);
                return `${x},${y}`;
              };

              // Keep the original row index for correct x-axis placement.
              const actualPoints = waterHistory
                .map((row, index) =>
                  row.actual === null ? null : pointFor(row.actual, index)
                )
                .filter(Boolean)
                .join(" ");
              const predictedPoints = waterHistory
                .map((row, index) => pointFor(row.predicted, index))
                .join(" ");

              return (
                <>
                  <div className="forecast-input-grid water-metric-grid">
                    <div className="input-summary-card">
                      <span>Records compared</span>
                      <strong>{knownRows.length}</strong>
                    </div>
                    <div className="input-summary-card">
                      <span>MAE (known actual values)</span>
                      <strong>{mae === null ? "—" : mae.toFixed(2)}</strong>
                    </div>
                    <div className="input-summary-card">
                      <span>RMSE (known actual values)</span>
                      <strong>{rmse === null ? "—" : rmse.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="chart-wrapper">
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      className="production-chart"
                      role="img"
                      aria-label="Actual and predicted historical water consumption line chart"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1={pad}
                        y1={height - pad}
                        x2={width - pad}
                        y2={height - pad}
                      />
                      <line
                        x1={pad}
                        y1={pad}
                        x2={pad}
                        y2={height - pad}
                      />
                      {knownRows.length > 0 && (
                        <polyline
                          points={actualPoints}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3"
                        />
                      )}
                      <polyline
                        points={predictedPoints}
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="3"
                        strokeDasharray="7 5"
                      />
                      {waterHistory.map((row, index) =>
                        row.actual === null ? null : (
                          <circle
                            key={`actual-${row.date}-${index}`}
                            cx={Number(pointFor(row.actual, index).split(",")[0])}
                            cy={Number(pointFor(row.actual, index).split(",")[1])}
                            r="3"
                            fill="#2563eb"
                          >
                            <title>{`${row.date} actual: ${row.actual.toFixed(2)}`}</title>
                          </circle>
                        )
                      )}
                      {waterHistory.map((row, index) => (
                        <circle
                          key={`predicted-${row.date}-${index}`}
                          cx={Number(pointFor(row.predicted, index).split(",")[0])}
                          cy={Number(pointFor(row.predicted, index).split(",")[1])}
                          r="2"
                          fill="#dc2626"
                        >
                          <title>{`${row.date} predicted: ${row.predicted.toFixed(2)}`}</title>
                        </circle>
                      ))}
                    </svg>
                  </div>

                  <div className="forecast-chart-legend">
                    <span><i className="legend-history" />Actual water consumption</span>
                    <span><i className="legend-forecast" />Predicted water consumption</span>
                  </div>

                  <div className="analytics-table-container water-history-table">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Actual Water</th>
                          <th>Predicted Water</th>
                          <th>Prediction Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waterHistory.map((row, index) => (
                          <tr key={`${row.date}-${index}`}>
                            <td>{row.date}</td>
                            <td>
                              {row.actual === null ? "Unknown" : row.actual.toFixed(2)}
                            </td>
                            <td>{row.predicted.toFixed(2)}</td>
                            <td>
                              {row.actual === null
                                ? "—"
                                : (row.predicted - row.actual).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* ===================================== */}
      {/* MODEL INFORMATION */}
      {/* ===================================== */}

      <div className="model-info-card">

        <h2>
          Forecasting Model
        </h2>

        <p>
          The production forecast uses a
          Random Forest Regression model trained
          using historical phosphate production
          data.
        </p>

        <div className="model-feature-grid">

          <div>
            <strong>
              Lag 1
            </strong>

            <span>
              Previous production value
            </span>
          </div>

          <div>
            <strong>
              Lag 7
            </strong>

            <span>
              Production value from 7 days ago
            </span>
          </div>

          <div>
            <strong>
              Rolling 7
            </strong>

            <span>
              Average production over 7 records
            </span>
          </div>

        </div>

      </div>

  

    </div>
  );
}

export default Forecasting;