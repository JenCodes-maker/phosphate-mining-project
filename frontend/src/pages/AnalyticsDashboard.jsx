import { useEffect, useState } from "react";
import api from "../services/api";
import "./AnalyticsDashboard.css";

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [featureImportance, setFeatureImportance] = useState([]);
  const [featureImportanceMessage, setFeatureImportanceMessage] = useState(
    "Feature importance data has not been loaded yet."
  );

  useEffect(() => {
    let cancelled = false;

    const loadFeatureImportance = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}water_requirement_feature_importance.json`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Feature importance JSON is not available in the frontend public folder.");
        }

        const payload = await response.json();
        const rawItems = Array.isArray(payload)
          ? payload
          : payload.results || payload.features || payload.importances || [];

        const normalized = rawItems
          .map((item) => ({
            name: item.feature || item.name || item.feature_name,
            importance: Number(item.importance ?? item.importance_mean ?? item.score),
            std: Number(item.std ?? item.importance_std ?? 0),
          }))
          .filter((item) => item.name && Number.isFinite(item.importance))
          .sort((a, b) => b.importance - a.importance);

        if (!cancelled) {
          setFeatureImportance(normalized);
          setFeatureImportanceMessage(
            normalized.length
              ? ""
              : "The JSON file was found, but its structure did not contain feature importance entries."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setFeatureImportance([]);
          setFeatureImportanceMessage(
            "To display this chart, copy forecasting/saved_models/water_requirement_feature_importance.json into frontend/public/water_requirement_feature_importance.json."
          );
        }
      }
    };

    loadFeatureImportance();
    return () => {
      cancelled = true;
    };
  }, []);

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");


const fetchAnalytics = async (
  selectedFromDate = "",
  selectedToDate = ""
) => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access");

    if (!token) {
      setError("Please login again.");
      return;
    }

    const params = {};

    if (selectedFromDate) {
      params.from_date = selectedFromDate;
    }

    if (selectedToDate) {
      params.to_date = selectedToDate;
    }

    console.log(
      "Fetching analytics with:",
      params
    );

    const response = await api.get(
      "/dashboard/analytics/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      }
    );

    console.log(
      "Analytics response:",
      response.data
    );

    setData(response.data);

  } catch (err) {

    console.error(
      "Analytics error:",
      err
    );

    if (err.response?.status === 401) {
      setError(
        "Session expired. Please logout and login again."
      );
    } else if (err.response?.status === 403) {
      setError(
        "You are not authorized to view analytics."
      );
    } else {
      setError(
        err.response?.data?.error ||
        "Failed to load analytics data."
      );
    }

  } finally {
    setLoading(false);
  }
};

const handleApplyFilter = async () => {
  setError("");

  if (!fromDate || !toDate) {
    setError("Please select both From Date and To Date.");
    return;
  }

  if (fromDate > toDate) {
    setError(
      "From Date cannot be greater than To Date."
    );
    return;
  }

  await fetchAnalytics(fromDate, toDate);
};

const handleResetFilter = async () => {
  setFromDate("");
  setToDate("");
  setError("");

  await fetchAnalytics("", "");
};

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          {error}
        </div>

        <button
          className="analytics-refresh-button"
          onClick={fetchAnalytics}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const sustainability = data?.sustainability || {};
  const productionTrend = data?.production_trend || [];

  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-header">
  <div>
    <h1>📊 Advanced Analytics</h1>

    <p>
      Mining production, operational and
      sustainability analysis
    </p>
  </div>

  <div className="analytics-header-actions">

    <button
      className="download-report-button"
      onClick={async () => {
        try {
          const token = localStorage.getItem("access");

          const params = {};

          if (fromDate) {
            params.from_date = fromDate;
          }

          if (toDate) {
            params.to_date = toDate;
          }

          const response = await api.get(
            "/dashboard/report/csv/",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: params,
              responseType: "blob",
            }
          );

          const blob = new Blob(
            [response.data],
            { type: "text/csv" }
          );

          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement("a");

          link.href = url;
          link.download = "mining_report.csv";

          document.body.appendChild(link);

          link.click();

          link.remove();

          window.URL.revokeObjectURL(url);

        } catch (err) {
  console.error(
    "Report download error:",
    err
  );

  if (err.response?.status === 401) {
    setError(
      "Session expired. Please logout and login again."
    );
  } else if (err.response?.status === 403) {
    setError(
      "You are not authorized to download this report."
    );
  } else if (err.response?.status === 404) {
    setError(
      "CSV report API endpoint was not found."
    );
  } else {
    setError(
      `Failed to download mining report. Status: ${
        err.response?.status || "Unknown"
      }`
    );
  }
}
      }}
    >
      📥 Download CSV
    </button>

    <button
      className="analytics-refresh-button"
      onClick={fetchAnalytics}
    >
      🔄 Refresh
    </button>

  </div>
</div>

<div className="analytics-filter">

  <div className="filter-group">
    <label>From Date</label>

    <input
      type="date"
      value={fromDate}
      onChange={(e) => {
        setFromDate(e.target.value);
        setError("");
      }}
    />
  </div>

  <div className="filter-group">
    <label>To Date</label>

    <input
      type="date"
      value={toDate}
      onChange={(e) => {
        setToDate(e.target.value);
        setError("");
      }}
    />
  </div>

  <button
    type="button"
    className="apply-filter-button"
    onClick={handleApplyFilter}
    disabled={loading}
  >
    {loading ? "Loading..." : "🔍 Apply Filter"}
  </button>

  <button
    type="button"
    className="reset-filter-button"
    onClick={handleResetFilter}
    disabled={loading}
  >
    🔄 Reset
  </button>

</div>

      {/* Summary Cards */}
      <div className="analytics-grid">

        <div className="analytics-card">
          <div className="analytics-card-icon">
            📦
          </div>

          <div>
            <h3>Total Production</h3>
            <p>
              {Number(
                summary.total_production || 0
              ).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            🧪
          </div>

          <div>
            <h3>Average Grade</h3>
            <p>
              {summary.average_grade || 0}
            </p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            ⚙️
          </div>

          <div>
            <h3>Equipment Utilization</h3>
            <p>
              {summary.average_utilization || 0}%
            </p>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-icon">
            ⏱️
          </div>

          <div>
            <h3>Operating Hours</h3>
            <p>
              {summary.average_operating_hours || 0}
            </p>
          </div>
        </div>

      </div>


      {/* AI Feature Importance */}
      <div className="analytics-section feature-importance-section">
        <div className="section-title">
          <h2>🤖 AI Feature Importance</h2>
          <span>Permutation importance · Ridge Regression</span>
        </div>
        <p className="feature-importance-description">
          Higher positive scores indicate that shuffling a feature reduced test-set
          performance more. Negative scores do not mean a feature reduces water
          consumption; they can indicate noise or uncertainty in this evaluation.
        </p>

        {featureImportance.length === 0 ? (
          <div className="feature-importance-empty">
            <strong>Feature importance chart is ready.</strong>
            <p>{featureImportanceMessage}</p>
          </div>
        ) : (
          <div className="feature-importance-chart" role="list" aria-label="Feature importance ranking">
            {featureImportance.map((item) => {
              const maxMagnitude = Math.max(
                ...featureImportance.map((entry) => Math.abs(entry.importance)),
                1
              );
              const width = (Math.abs(item.importance) / maxMagnitude) * 100;
              const label = item.name
                .replaceAll("_", " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase());

              return (
                <div className="feature-importance-row" key={item.name} role="listitem">
                  <div className="feature-importance-label">
                    <span>{label}</span>
                    <strong>{item.importance.toFixed(4)}</strong>
                  </div>
                  <div className="feature-importance-track">
                    <div
                      className={`feature-importance-bar ${item.importance < 0 ? "is-negative" : ""}`}
                      style={{ width: `${width}%` }}
                      title={`Importance: ${item.importance.toFixed(4)}${Number.isFinite(item.std) ? ` (std: ${item.std.toFixed(4)})` : ""}`}
                    />
                  </div>
                  {Number.isFinite(item.std) && item.std > 0 && (
                    <small>Variation (std): {item.std.toFixed(4)}</small>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Production Trend */}
      <div className="analytics-section">

        <div className="section-title">
          <h2>📈 Production Trend</h2>
          <span>
            {summary.total_records || 0} records
          </span>
        </div>

        <div className="production-chart">

          {productionTrend.length === 0 ? (
            <p className="no-data">
              No production data available.
            </p>
          ) : (
            <>
              <div className="chart-bars">

                {productionTrend.map(
                  (item, index) => {

                    const maxProduction = Math.max(
                      ...productionTrend.map(
                        (record) =>
                          Number(
                            record.production
                          ) || 0
                      )
                    );

                    const height =
                      maxProduction > 0
                        ? (Number(
                            item.production
                          ) /
                            maxProduction) *
                          100
                        : 0;

                    return (
                      <div
                        className="chart-bar-wrapper"
                        key={index}
                        title={`${
                          item.date
                        } : ${
                          item.production
                        }`}
                      >
                        <div
                          className="chart-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        <span className="chart-date">
                          {String(
                            item.date
                          ).slice(5)}
                        </span>
                      </div>
                    );
                  }
                )}

              </div>
            </>
          )}

        </div>
      </div>

      {/* Operational Analysis */}
      <div className="analytics-section">

        <div className="section-title">
          <h2>⚙️ Operational Analysis</h2>
        </div>

        <div className="analysis-grid">

          <div className="analysis-card">

            <div className="analysis-header">
              <span>Equipment Utilization</span>
              <strong>
                {summary.average_utilization || 0}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Number(
                      summary.average_utilization
                    ) || 0,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

          <div className="analysis-card">

            <div className="analysis-header">
              <span>Average Grade</span>
              <strong>
                {summary.average_grade || 0}
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Number(
                      summary.average_grade
                    ) * 2 || 0,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

          <div className="analysis-card">

            <div className="analysis-header">
              <span>Operating Hours</span>
              <strong>
                {summary.average_operating_hours ||
                  0}
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    ((Number(
                      summary.average_operating_hours
                    ) || 0) /
                      24) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>

          </div>

        </div>

      </div>

      {/* Sustainability */}
      <div className="analytics-section">

        <div className="section-title">
          <h2>🌱 Sustainability Analysis</h2>
        </div>

        <div className="sustainability-grid">

          <div className="sustainability-card">
            <span>⚡</span>
            <h3>Energy Consumption</h3>
            <strong>
              {Number(
                sustainability.total_energy || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="sustainability-card">
            <span>💧</span>
            <h3>Water Consumption</h3>
            <strong>
              {Number(
                sustainability.total_water || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="sustainability-card">
            <span>⛽</span>
            <h3>Fuel Consumption</h3>
            <strong>
              {Number(
                sustainability.total_fuel || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="sustainability-card">
            <span>♻️</span>
            <h3>Waste Generated</h3>
            <strong>
              {Number(
                sustainability.total_waste || 0
              ).toLocaleString()}
            </strong>
          </div>

        </div>

      </div>

      {/* Detailed Data */}
      <div className="analytics-section">

        <div className="section-title">
          <h2>📋 Production Details</h2>
        </div>

        <div className="analytics-table-container">

          <table className="analytics-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Production</th>
                <th>Grade</th>
                <th>Utilization</th>
                <th>Operating Hours</th>
              </tr>
            </thead>

            <tbody>

              {productionTrend.map(
                (item, index) => (
                  <tr key={index}>

                    <td>
                      {item.date}
                    </td>

                    <td>
                      {Number(
                        item.production
                      ).toLocaleString()}
                    </td>

                    <td>
                      {item.grade}
                    </td>

                    <td>
                      {item.utilization}%
                    </td>

                    <td>
                      {item.operating_hours}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AnalyticsDashboard;