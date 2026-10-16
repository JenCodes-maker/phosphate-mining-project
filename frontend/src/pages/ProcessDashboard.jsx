import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProcessDashboard.css";

function ProcessDashboard() {
  const [miningData, setMiningData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [editingMaterial, setEditingMaterial] = useState(null);
const [newStock, setNewStock] = useState("");
const [updatingStock, setUpdatingStock] = useState(false);
const [stockMessage, setStockMessage] = useState("");
const [stockError, setStockError] = useState("");

  // ==========================================
  // FETCH PROCESS DATA
  // ==========================================

  const fetchMiningData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("access");

      const response = await api.get("/mining/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = [...response.data].sort(
        (a, b) =>
          new Date(a.production_date) -
          new Date(b.production_date)
      );

      setMiningData(sortedData);
    } catch (err) {
      console.error(
        "Process dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError(
          "Failed to load process data."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchMiningData();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="process-dashboard">
        <h2>
          Loading Process Dashboard...
        </h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && miningData.length === 0) {
    return (
      <div className="process-dashboard">
        <p className="process-error">
          {error}
        </p>

        <button
          className="refresh-button"
          onClick={() => fetchMiningData()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================

  const totalProduction =
    miningData.reduce(
      (total, item) =>
        total +
        Number(
          item.phosphate_production || 0
        ),
      0
    );

  const averageUtilization =
    miningData.length > 0
      ? miningData.reduce(
          (total, item) =>
            total +
            Number(
              item.equipment_utilization || 0
            ),
          0
        ) / miningData.length
      : 0;

  const averageOperatingHours =
    miningData.length > 0
      ? miningData.reduce(
          (total, item) =>
            total +
            Number(
              item.operating_hours || 0
            ),
          0
        ) / miningData.length
      : 0;

  const averageTemperature =
    miningData.length > 0
      ? miningData.reduce(
          (total, item) =>
            total +
            Number(
              item.temperature || 0
            ),
          0
        ) / miningData.length
      : 0;

  // ==========================================
  // RESOURCE CALCULATIONS
  // ==========================================

  const totalEnergy =
    miningData.reduce(
      (total, item) =>
        total +
        Number(
          item.energy_consumption || 0
        ),
      0
    );

  const totalWater =
    miningData.reduce(
      (total, item) =>
        total +
        Number(
          item.water_consumption || 0
        ),
      0
    );

  const totalFuel =
    miningData.reduce(
      (total, item) =>
        total +
        Number(
          item.fuel_consumption || 0
        ),
      0
    );

  const totalWaste =
    miningData.reduce(
      (total, item) =>
        total +
        Number(
          item.waste_generated || 0
        ),
      0
    );

  // ==========================================
  // PRODUCTION CHART
  // ==========================================

  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 45;

  const productionValues =
    miningData.map((item) =>
      Number(
        item.phosphate_production || 0
      )
    );

  const minProduction =
    productionValues.length > 0
      ? Math.min(...productionValues)
      : 0;

  const maxProduction =
    productionValues.length > 0
      ? Math.max(...productionValues)
      : 100;

  const productionRange =
    maxProduction - minProduction === 0
      ? 1
      : maxProduction - minProduction;

  const productionPoints =
    miningData
      .map((item, index) => {
        const production = Number(
          item.phosphate_production || 0
        );

        const x =
          padding +
          (index /
            Math.max(
              miningData.length - 1,
              1
            )) *
            (chartWidth -
              padding * 2);

        const y =
          chartHeight -
          padding -
          ((production -
            minProduction) /
            productionRange) *
            (chartHeight -
              padding * 2);

        return `${x},${y}`;
      })
      .join(" ");

  // ==========================================
  // RESOURCE DATA
  // ==========================================

  const resourceData = [
    {
      label: "Energy",
      value: totalEnergy,
    },
    {
      label: "Water",
      value: totalWater,
    },
    {
      label: "Fuel",
      value: totalFuel,
    },
    {
      label: "Waste",
      value: totalWaste,
    },
  ];

  const maxResource =
    Math.max(
      ...resourceData.map(
        (item) => item.value
      ),
      1
    );

  // ==========================================
  // PROCESS STATUS
  // ==========================================

  const utilizationStatus =
    averageUtilization >= 80
      ? "Optimal"
      : averageUtilization >= 60
      ? "Moderate"
      : "Low";

  const temperatureStatus =
    averageTemperature >= 20 &&
    averageTemperature <= 40
      ? "Normal"
      : "Check";

  const productionStatus =
    totalProduction > 0
      ? "Active"
      : "No Data";

  // ==========================================
  // RETURN UI
  // ==========================================

  return (
    <div className="process-dashboard">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="process-header">

        <div>
          <h1>
            Process Unit Dashboard
          </h1>

          <p>
            Phosphate Mining Process
            Monitoring
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() =>
            fetchMiningData(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "🔄 Refresh Data"}
        </button>

      </div>

      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error && (
        <p className="process-error">
          {error}
        </p>
      )}

      {/* ===================================== */}
      {/* PROCESS OVERVIEW */}
      {/* ===================================== */}

      <h2 className="process-section-title">
        Process Overview
      </h2>

      <div className="process-kpi-grid">

        <div className="process-kpi-card">
          <h3>
            Total Production
          </h3>

          <p>
            {totalProduction.toFixed(2)}
          </p>

          <span>
            Historical Production
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Equipment Utilization
          </h3>

          <p>
            {averageUtilization.toFixed(2)}%
          </p>

          <span>
            Average Utilization
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Operating Hours
          </h3>

          <p>
            {averageOperatingHours.toFixed(2)}
          </p>

          <span>
            Average Hours
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Temperature
          </h3>

          <p>
            {averageTemperature.toFixed(2)}
          </p>

          <span>
            Average Temperature
          </span>
        </div>

      </div>

      {/* ===================================== */}
      {/* PROCESS STATUS */}
      {/* ===================================== */}

      <h2 className="process-section-title">
        Process Status
      </h2>

      <div className="status-grid">

        <div className="status-card">

          <div className="status-icon">
            ⚙️
          </div>

          <div>
            <h3>
              Equipment
            </h3>

            <span
              className={
                utilizationStatus ===
                "Optimal"
                  ? "status-normal"
                  : utilizationStatus ===
                    "Moderate"
                  ? "status-warning"
                  : "status-danger"
              }
            >
              ● {utilizationStatus}
            </span>
          </div>

        </div>

        <div className="status-card">

          <div className="status-icon">
            🏭
          </div>

          <div>
            <h3>
              Production
            </h3>

            <span className="status-normal">
              ● {productionStatus}
            </span>
          </div>

        </div>

        <div className="status-card">

          <div className="status-icon">
            🌡️
          </div>

          <div>
            <h3>
              Temperature
            </h3>

            <span
              className={
                temperatureStatus ===
                "Normal"
                  ? "status-normal"
                  : "status-warning"
              }
            >
              ● {temperatureStatus}
            </span>
          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* PRODUCTION TREND */}
      {/* ===================================== */}

      <div className="process-chart-card">

        <h2>
          Production Trend
        </h2>

        <p className="chart-description">
          Historical phosphate production
          monitoring
        </p>

        <div className="process-chart-wrapper">

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="process-production-chart"
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
            />

            {/* PRODUCTION LINE */}

            <polyline
              points={productionPoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
            />

            {/* DATA POINTS */}

            {miningData.map(
              (item, index) => {

                const production =
                  Number(
                    item.phosphate_production ||
                      0
                  );

                const x =
                  padding +
                  (index /
                    Math.max(
                      miningData.length - 1,
                      1
                    )) *
                    (chartWidth -
                      padding * 2);

                const y =
                  chartHeight -
                  padding -
                  ((production -
                    minProduction) /
                    productionRange) *
                    (chartHeight -
                      padding * 2);

                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#2563eb"
                  />
                );
              }
            )}

          </svg>

        </div>

        <div className="chart-summary">

          <span>
            Minimum:{" "}
            {minProduction.toFixed(2)}
          </span>

          <span>
            Maximum:{" "}
            {maxProduction.toFixed(2)}
          </span>

          <span>
            Records:{" "}
            {miningData.length}
          </span>

        </div>

      </div>

      {/* ===================================== */}
      {/* RESOURCE MONITORING */}
      {/* ===================================== */}

      <h2 className="process-section-title">
        Resource Monitoring
      </h2>

      <div className="process-kpi-grid">

        <div className="process-kpi-card">
          <h3>
            Energy
          </h3>

          <p>
            {totalEnergy.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Water
          </h3>

          <p>
            {totalWater.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Fuel
          </h3>

          <p>
            {totalFuel.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="process-kpi-card">
          <h3>
            Waste
          </h3>

          <p>
            {totalWaste.toFixed(2)}
          </p>

          <span>
            Total Generated
          </span>
        </div>

      </div>

      {/* ===================================== */}
      {/* RESOURCE CHART */}
      {/* ===================================== */}

      <div className="resource-chart-card">

        <h2>
          Resource Utilization
        </h2>

        <p>
          Relative comparison of accumulated
          process resources
        </p>

        <div className="resource-bars">

          {resourceData.map(
            (item) => {

              const percentage =
                (item.value /
                  maxResource) *
                100;

              return (
                <div
                  className="resource-row"
                  key={item.label}
                >

                  <div className="resource-label">

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value.toFixed(2)}
                    </strong>

                  </div>

                  <div className="resource-background">

                    <div
                      className="resource-fill"
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

        <p className="resource-note">
          Relative scale: each bar is
          normalized against the largest
          accumulated value.
        </p>

      </div>

      {/* ===================================== */}
      {/* DATASET */}
      {/* ===================================== */}

      <div className="process-data-card">

        <h2>
          Process Dataset
        </h2>

        <p>
          Total monitored records:
          <strong>
            {" "}
            {miningData.length}
          </strong>
        </p>

        <p>
          Data source: Mining Data
          Management Module
        </p>

      </div>

    </div>
  );
}

export default ProcessDashboard;