import { useEffect, useState } from "react";
import api from "../services/api";
import "./ContractorDashboard.css";

function ContractorDashboard() {
  const [miningData, setMiningData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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
        "Contractor dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError(
          "Failed to load contractor data."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMiningData();
  }, []);

  if (loading) {
    return (
      <div className="contractor-dashboard">
        <h2>
          Loading Contractor Dashboard...
        </h2>
      </div>
    );
  }

  if (error && miningData.length === 0) {
    return (
      <div className="contractor-dashboard">
        <p className="contractor-error">
          {error}
        </p>

        <button
          className="contractor-refresh-button"
          onClick={() => fetchMiningData()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalProduction = miningData.reduce(
    (total, item) =>
      total +
      Number(
        item.phosphate_production || 0
      ),
    0
  );

  const averageGrade =
    miningData.length > 0
      ? miningData.reduce(
          (total, item) =>
            total +
            Number(
              item.phosphate_grade || 0
            ),
          0
        ) / miningData.length
      : 0;

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

  const totalFuel = miningData.reduce(
    (total, item) =>
      total +
      Number(
        item.fuel_consumption || 0
      ),
    0
  );

  const totalWaste = miningData.reduce(
    (total, item) =>
      total +
      Number(
        item.waste_generated || 0
      ),
    0
  );

  const productionStatus =
    totalProduction > 0
      ? "Active"
      : "No Data";

  const utilizationStatus =
    averageUtilization >= 80
      ? "Good"
      : averageUtilization >= 60
      ? "Moderate"
      : "Low";

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="contractor-dashboard">

      {/* HEADER */}

      <div className="contractor-header">

        <div>
          <h1>
            Contractor Dashboard
          </h1>

          <p>
            Mining Production &
            Contractor Monitoring
          </p>
        </div>

        <button
          className="contractor-refresh-button"
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

      {error && (
        <p className="contractor-error">
          {error}
        </p>
      )}

      {/* OVERVIEW */}

      <h2 className="contractor-section-title">
        Contractor Overview
      </h2>

      <div className="contractor-kpi-grid">

        <div className="contractor-kpi-card">
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

        <div className="contractor-kpi-card">
          <h3>
            Average Grade
          </h3>

          <p>
            {averageGrade.toFixed(2)}
          </p>

          <span>
            Phosphate Grade
          </span>
        </div>

        <div className="contractor-kpi-card">
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

        <div className="contractor-kpi-card">
          <h3>
            Records
          </h3>

          <p>
            {miningData.length}
          </p>

          <span>
            Mining Records
          </span>
        </div>

      </div>

      {/* STATUS */}

      <h2 className="contractor-section-title">
        Current Status
      </h2>

      <div className="contractor-status-grid">

        <div className="contractor-status-card">

          <div className="contractor-status-icon">
            🏭
          </div>

          <div>
            <h3>
              Production
            </h3>

            <span className="status-active">
              ● {productionStatus}
            </span>
          </div>

        </div>

        <div className="contractor-status-card">

          <div className="contractor-status-icon">
            ⚙️
          </div>

          <div>
            <h3>
              Equipment
            </h3>

            <span className="status-active">
              ● {utilizationStatus}
            </span>
          </div>

        </div>

        <div className="contractor-status-card">

          <div className="contractor-status-icon">
            ⛽
          </div>

          <div>
            <h3>
              Fuel Monitoring
            </h3>

            <span className="status-info">
              ● Monitored
            </span>
          </div>

        </div>

      </div>

      {/* CONTRACTOR INFORMATION */}

      <h2 className="contractor-section-title">
        Contractor Information
      </h2>

      <div className="contractor-info-grid">

        <div className="contractor-info-card">

          <span>
            Fuel Consumption
          </span>

          <strong>
            {totalFuel.toFixed(2)}
          </strong>

          <small>
            Total recorded consumption
          </small>

        </div>

        <div className="contractor-info-card">

          <span>
            Waste Generated
          </span>

          <strong>
            {totalWaste.toFixed(2)}
          </strong>

          <small>
            Total recorded waste
          </small>

        </div>

        <div className="contractor-info-card">

          <span>
            Monitoring Records
          </span>

          <strong>
            {miningData.length}
          </strong>

          <small>
            Available mining records
          </small>

        </div>

      </div>

      {/* DATASET */}

      <div className="contractor-data-card">

        <h2>
          Mining Dataset
        </h2>

        <p>
          Total available records:
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

export default ContractorDashboard;