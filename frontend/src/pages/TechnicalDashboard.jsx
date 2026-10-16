import { useEffect, useState } from "react";
import api from "../services/api";
import "./TechnicalDashboard.css";

function TechnicalDashboard() {
  const [miningData, setMiningData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState([]);

  // Forecast states
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        const token = localStorage.getItem("access");

        // =====================================
        // 1. FETCH MINING DATA
        // =====================================

        const response = await api.get("/mining/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // =====================================
        // 2. SORT DATA BY DATE
        // =====================================

        const sortedData = [...response.data].sort(
          (a, b) =>
            new Date(a.production_date) -
            new Date(b.production_date)
        );

        setMiningData(sortedData);

        // =====================================
        // 3. PREPARE CHART DATA
        // =====================================

        setChartData(
          sortedData.map((item) => ({
            date: item.production_date,
            production: Number(
              item.phosphate_production || 0
            ),
          }))
        );

        // =====================================
        // 4. GENERATE ML FORECAST
        // =====================================

        if (sortedData.length >= 8) {
          const lastProduction =
            Number(
              sortedData[sortedData.length - 1]
                ?.phosphate_production || 0
            );

          const sevenDaysAgoProduction =
            Number(
              sortedData[sortedData.length - 8]
                ?.phosphate_production || 0
            );

          const lastSevenRecords =
            sortedData.slice(-7);

          const rollingAverage =
            lastSevenRecords.reduce(
              (total, item) =>
                total +
                Number(
                  item.phosphate_production || 0
                ),
              0
            ) / lastSevenRecords.length;

          const forecastResponse = await api.post(
            "/forecasting/production/",
            {
              lag_1: lastProduction,
              lag_7: sevenDaysAgoProduction,
              rolling_7: rollingAverage,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setForecast(
            forecastResponse.data.predicted_production
          );
        } else {
          console.warn(
            "Not enough data to generate forecast."
          );
        }
      } catch (err) {
        console.error(
          "Technical Dashboard Error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Session expired. Please login again."
          );
        } else {
          setError(
            "Failed to load technical dashboard data."
          );
        }
      } finally {
        setLoading(false);
        setForecastLoading(false);
      }
    };

    fetchMiningData();
  }, []);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="technical-dashboard">
        <h2>
          Loading Technical Dashboard...
        </h2>
      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="technical-dashboard">
        <p className="dashboard-error">
          {error}
        </p>
      </div>
    );
  }

  // =====================================
  // KPI CALCULATIONS
  // =====================================

  const totalProduction =
    miningData.reduce(
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

  // =====================================
  // SUSTAINABILITY CALCULATIONS
  // =====================================

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

  // =====================================
  // PRODUCTION CHART
  // =====================================

  const chartWidth = 800;
  const chartHeight = 320;
  const padding = 45;

  const productionValues =
    chartData.map(
      (item) => item.production
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

  const chartPoints =
    chartData
      .map((item, index) => {
        const x =
          padding +
          (index /
            Math.max(
              chartData.length - 1,
              1
            )) *
            (chartWidth -
              padding * 2);

        const y =
          chartHeight -
          padding -
          ((item.production -
            minProduction) /
            productionRange) *
            (chartHeight -
              padding * 2);

        return `${x},${y}`;
      })
      .join(" ");

  // =====================================
  // SUSTAINABILITY CHART DATA
  // =====================================

  const sustainabilityData = [
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

  const maxSustainabilityValue =
    Math.max(
      ...sustainabilityData.map(
        (item) => item.value
      ),
      1
    );

  // =====================================
  // RETURN UI
  // =====================================

  return (
    <div className="technical-dashboard">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="dashboard-header">
        <h1>
          Technical Team Dashboard
        </h1>

        <p>
          Phosphate Mining Production &
          Sustainability Analytics
        </p>
      </div>

      {/* ================================= */}
      {/* PRODUCTION OVERVIEW */}
      {/* ================================= */}

      <h2 className="section-title">
        Production Overview
      </h2>

      <div className="kpi-grid">

        <div className="kpi-card">
          <h3>Total Production</h3>

          <p>
            {totalProduction.toFixed(2)}
          </p>

          <span>
            Historical Production
          </span>
        </div>

        <div className="kpi-card">
          <h3>Average Grade</h3>

          <p>
            {averageGrade.toFixed(2)}
          </p>

          <span>
            Phosphate Grade
          </span>
        </div>

        <div className="kpi-card">
          <h3>Equipment Utilization</h3>

          <p>
            {averageUtilization.toFixed(2)}%
          </p>

          <span>
            Average Utilization
          </span>
        </div>

        <div className="kpi-card">
          <h3>Operating Hours</h3>

          <p>
            {averageOperatingHours.toFixed(2)}
          </p>

          <span>
            Average Hours
          </span>
        </div>

      </div>

      {/* ================================= */}
      {/* PRODUCTION TREND */}
      {/* ================================= */}

      {chartData.length > 0 && (
        <div className="dashboard-chart-card">

          <h2 className="section-title">
            Production Trend
          </h2>

          <div className="dashboard-chart-wrapper">

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="dashboard-production-chart"
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
                points={chartPoints}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />

              {/* PRODUCTION POINTS */}

              {chartData.map(
                (item, index) => {

                  const x =
                    padding +
                    (index /
                      Math.max(
                        chartData.length - 1,
                        1
                      )) *
                      (chartWidth -
                        padding * 2);

                  const y =
                    chartHeight -
                    padding -
                    ((item.production -
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

          {/* CHART SUMMARY */}

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
              {chartData.length}
            </span>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* FORECAST SUMMARY */}
      {/* ================================= */}

      <div className="forecast-summary-card">

        <div>

          <h2>
            🔮 Production Forecast
          </h2>

          <p>
            Next production forecast
            generated by the machine-learning
            model.
          </p>

        </div>

        {forecastLoading ? (

          <div className="forecast-loading">
            Generating forecast...
          </div>

        ) : forecast !== null ? (

          <div className="forecast-value">
            {Number(forecast).toFixed(2)}
          </div>

        ) : (

          <div className="forecast-error">
            Forecast unavailable
          </div>

        )}

      </div>

      {/* ================================= */}
      {/* SUSTAINABILITY OVERVIEW */}
      {/* ================================= */}

      <h2 className="section-title">
        Sustainability Overview
      </h2>

      <div className="kpi-grid">

        <div className="kpi-card">
          <h3>
            Energy Consumption
          </h3>

          <p>
            {totalEnergy.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="kpi-card">
          <h3>
            Water Consumption
          </h3>

          <p>
            {totalWater.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="kpi-card">
          <h3>
            Fuel Consumption
          </h3>

          <p>
            {totalFuel.toFixed(2)}
          </p>

          <span>
            Total Consumption
          </span>
        </div>

        <div className="kpi-card">
          <h3>
            Waste Generated
          </h3>

          <p>
            {totalWaste.toFixed(2)}
          </p>

          <span>
            Total Waste
          </span>
        </div>

      </div>

      {/* ================================= */}
      {/* SUSTAINABILITY RESOURCE CHART */}
      {/* ================================= */}

      <div className="sustainability-chart-card">

        <div className="sustainability-chart-header">

          <div>

            <h2>
              Sustainability Resource
              Overview
            </h2>

            <p>
              Relative comparison of
              accumulated resource and
              waste values
            </p>

          </div>

        </div>

        <div className="sustainability-bars">

          {sustainabilityData.map(
            (item) => {

              const percentage =
                (item.value /
                  maxSustainabilityValue) *
                100;

              return (
                <div
                  className="sustainability-bar-row"
                  key={item.label}
                >

                  <div className="sustainability-bar-label">

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value.toFixed(2)}
                    </strong>

                  </div>

                  <div className="sustainability-bar-background">

                    <div
                      className="sustainability-bar-fill"
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

        <p className="sustainability-note">
          Relative scale: each bar is
          normalized against the largest
          accumulated value.
        </p>

      </div>

      {/* ================================= */}
      {/* DATASET INFORMATION */}
      {/* ================================= */}

      <div className="dataset-card">

        <h2>
          Mining Dataset
        </h2>

        <p>
          Total historical records:
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

export default TechnicalDashboard;