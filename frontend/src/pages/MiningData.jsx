import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const INITIAL_FORM = {
    mine_name: "",
    location: "",
    production_date: "",
    phosphate_production: "",
    phosphate_grade: "",
    operating_hours: "",
    equipment_utilization: "",
    temperature: "",
    rainfall: "",
    water_consumption: "",
    fuel_consumption: "",
    energy_consumption: "",
    waste_generated: "",
};

function MiningData() {
    const navigate = useNavigate();

    const [miningData, setMiningData] = useState([]);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // =====================================================
    // FETCH MINING DATA
    // =====================================================

    const fetchMiningData = async () => {
        setLoading(true);

        try {
            const response = await api.get("/mining/");
            const records = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            setMiningData(records);
            setError("");
        } catch (err) {
            console.error("Unable to load mining data:", err);

            setError(
                err.response?.data
                    ? JSON.stringify(err.response.data)
                    : "Unable to load mining data. Please check your login."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("access")) {
            navigate("/");
            return;
        }

        fetchMiningData();
    }, [navigate]);

    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({ ...INITIAL_FORM });
        setEditingId(null);
        setError("");
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setSaving(true);

        try {
            // Keep blank optional measurements out of the request so the API
            // can apply its configured defaults for new records.
            const payload = { ...formData };
            [
                "water_consumption",
                "fuel_consumption",
                "energy_consumption",
                "waste_generated",
            ].forEach((field) => {
                if (payload[field] === "") {
                    delete payload[field];
                }
            });

            if (editingId !== null) {
                await api.put(`/mining/${editingId}/`, payload);

                setMessage("Mining record updated successfully!");
            } else {
                await api.post("/mining/", payload);

                setMessage("Mining record added successfully!");
            }

            setFormData({ ...INITIAL_FORM });
            setEditingId(null);

            await fetchMiningData();
        } catch (err) {
            console.error("Unable to save mining data:", err);

            setError(
                err.response?.data
                    ? JSON.stringify(err.response.data)
                    : "Unable to save mining data. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // EDIT RECORD
    // =====================================================

    const handleEdit = (item) => {
        setEditingId(item.id);

        setFormData({
            mine_name: item.mine_name ?? "",
            location: item.location ?? "",
            production_date: item.production_date ?? "",
            phosphate_production: item.phosphate_production ?? "",
            phosphate_grade: item.phosphate_grade ?? "",
            operating_hours: item.operating_hours ?? "",
            equipment_utilization: item.equipment_utilization ?? "",
            temperature: item.temperature ?? "",
            rainfall: item.rainfall ?? "",
            water_consumption: item.water_consumption ?? "",
            fuel_consumption: item.fuel_consumption ?? "",
            energy_consumption: item.energy_consumption ?? "",
            waste_generated: item.waste_generated ?? "",
        });

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =====================================================
    // DELETE RECORD
    // =====================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this mining record? This action cannot be undone."
        );

        if (!confirmed) return;

        setMessage("");
        setError("");

        try {
            await api.delete(`/mining/${id}/`);

            if (editingId === id) {
                setFormData({ ...INITIAL_FORM });
                setEditingId(null);
            }

            setMessage("Mining record deleted successfully!");

            await fetchMiningData();
        } catch (err) {
            console.error("Unable to delete mining data:", err);

            setError(
                err.response?.data
                    ? JSON.stringify(err.response.data)
                    : "Unable to delete mining record."
            );
        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredData = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!query) return miningData;

        return miningData.filter((item) =>
            [
                item.mine_name,
                item.location,
                item.production_date,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            )
        );
    }, [miningData, searchTerm]);

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalProduction = miningData.reduce(
        (total, item) =>
            total + (Number(item.phosphate_production) || 0),
        0
    );

    const averageGrade = miningData.length
        ? miningData.reduce(
              (total, item) =>
                  total + (Number(item.phosphate_grade) || 0),
              0
          ) / miningData.length
        : 0;

    const averageUtilization = miningData.length
        ? miningData.reduce(
              (total, item) =>
                  total + (Number(item.equipment_utilization) || 0),
              0
          ) / miningData.length
        : 0;

    const formatNumber = (value) =>
        value.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div style={styles.page}>
            {/* HEADER */}

            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        style={styles.backButton}
                    >
                        ← Dashboard
                    </button>

                    <div style={styles.headingRow}>
                        <div style={styles.headingIcon}>⛏️</div>

                        <div>
                            <p style={styles.eyebrow}>
                                MINING OPERATIONS
                            </p>

                            <h1 style={styles.title}>
                                Mining Data Management
                            </h1>

                            <p style={styles.subtitle}>
                                Manage phosphate production and
                                operational records.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchMiningData}
                    disabled={loading}
                    style={styles.refreshButton}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh Data"}
                </button>
            </header>

            {/* SUMMARY CARDS */}

            <section style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <div
                        style={{
                            ...styles.summaryIcon,
                            background: "#dbeafe",
                        }}
                    >
                        📋
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Total Records
                        </p>

                        <h2 style={styles.summaryValue}>
                            {miningData.length}
                        </h2>

                        <span style={styles.summaryHint}>
                            Mining entries
                        </span>
                    </div>
                </div>

                <div style={styles.summaryCard}>
                    <div
                        style={{
                            ...styles.summaryIcon,
                            background: "#dcfce7",
                        }}
                    >
                        📦
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Total Production
                        </p>

                        <h2 style={styles.summaryValue}>
                            {formatNumber(totalProduction)}
                        </h2>

                        <span style={styles.summaryHint}>
                            Phosphate production units
                        </span>
                    </div>
                </div>

                <div style={styles.summaryCard}>
                    <div
                        style={{
                            ...styles.summaryIcon,
                            background: "#fef3c7",
                        }}
                    >
                        🧪
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Average Grade
                        </p>

                        <h2 style={styles.summaryValue}>
                            {averageGrade.toFixed(2)}
                        </h2>

                        <span style={styles.summaryHint}>
                            Across available records
                        </span>
                    </div>
                </div>

                <div style={styles.summaryCard}>
                    <div
                        style={{
                            ...styles.summaryIcon,
                            background: "#ede9fe",
                        }}
                    >
                        ⚙️
                    </div>

                    <div>
                        <p style={styles.summaryLabel}>
                            Avg. Utilization
                        </p>

                        <h2 style={styles.summaryValue}>
                            {averageUtilization.toFixed(2)}%
                        </h2>

                        <span style={styles.summaryHint}>
                            Equipment utilization
                        </span>
                    </div>
                </div>
            </section>

            {/* NOTIFICATIONS */}

            {message && (
                <div style={styles.successMessage}>
                    <span>✓</span>
                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        style={styles.dismissButton}
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div style={styles.errorMessage}>
                    <span>!</span>
                    <span style={styles.messageText}>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        style={styles.dismissButton}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ADD / EDIT FORM */}

            <section style={styles.card}>
                <div style={styles.cardHeader}>
                    <div>
                        <p style={styles.cardEyebrow}>
                            RECORD MANAGEMENT
                        </p>

                        <h2 style={styles.cardTitle}>
                            {editingId !== null
                                ? "✏️ Update Mining Record"
                                : "➕ Add Mining Record"}
                        </h2>

                        <p style={styles.cardDescription}>
                            Enter the mining and environmental
                            measurements below.
                        </p>
                    </div>

                    {editingId !== null && (
                        <span style={styles.editBadge}>
                            Editing ID: {editingId}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Mine Name *
                            </label>

                            <input
                                type="text"
                                name="mine_name"
                                placeholder="Enter mine name"
                                value={formData.mine_name}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Location *
                            </label>

                            <input
                                type="text"
                                name="location"
                                placeholder="Enter mine location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Production Date *
                            </label>

                            <input
                                type="date"
                                name="production_date"
                                value={formData.production_date}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Phosphate Production *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="any"
                                name="phosphate_production"
                                placeholder="e.g. 1500"
                                value={formData.phosphate_production}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Phosphate Grade *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="phosphate_grade"
                                placeholder="e.g. 32.5"
                                value={formData.phosphate_grade}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Operating Hours *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="operating_hours"
                                placeholder="e.g. 18"
                                value={formData.operating_hours}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Equipment Utilization (%) *
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                name="equipment_utilization"
                                placeholder="0–100"
                                value={formData.equipment_utilization}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Temperature (°C) *
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                name="temperature"
                                placeholder="e.g. 31"
                                value={formData.temperature}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Rainfall (mm) *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="rainfall"
                                placeholder="e.g. 4.8"
                                value={formData.rainfall}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Water Consumption
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                name="water_consumption"
                                placeholder="Enter water consumption"
                                value={formData.water_consumption}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Fuel Consumption
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                name="fuel_consumption"
                                placeholder="Enter fuel consumption"
                                value={formData.fuel_consumption}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Energy Consumption
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                name="energy_consumption"
                                placeholder="Enter energy consumption"
                                value={formData.energy_consumption}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Waste Generated
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                name="waste_generated"
                                placeholder="Enter waste generated"
                                value={formData.waste_generated}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formFooter}>
                        <p style={styles.requiredHint}>
                            * Required fields
                        </p>

                        <div style={styles.formActions}>
                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={styles.cancelButton}
                                >
                                    Cancel Edit
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    ...styles.submitButton,
                                    ...(saving
                                        ? styles.disabledButton
                                        : {}),
                                }}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId !== null
                                      ? "✓ Update Record"
                                      : "+ Add Mining Record"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {/* MINING RECORDS TABLE */}

            <section style={styles.card}>
                <div style={styles.tableHeader}>
                    <div>
                        <p style={styles.cardEyebrow}>
                            MINING DATABASE
                        </p>

                        <h2 style={styles.cardTitle}>
                            Mining Records
                        </h2>

                        <p style={styles.cardDescription}>
                            Search, edit and manage saved records.
                        </p>
                    </div>

                    <div style={styles.searchWrapper}>
                        <span>🔍</span>

                        <input
                            type="search"
                            placeholder="Search mine, location or date..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            style={styles.searchInput}
                        />
                    </div>
                </div>

                <div style={styles.tableMeta}>
                    <span>
                        Showing{" "}
                        <strong>{filteredData.length}</strong>{" "}
                        of{" "}
                        <strong>{miningData.length}</strong>{" "}
                        records
                    </span>
                </div>

                {loading ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>⏳</div>
                        <h3>Loading mining records...</h3>
                        <p>Please wait while the data is fetched.</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>
                            {searchTerm ? "🔎" : "📋"}
                        </div>

                        <h3>
                            {searchTerm
                                ? "No matching records"
                                : "No mining records found"}
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try another search term."
                                : "Add a mining record using the form above."}
                        </p>
                    </div>
                ) : (
                    <div style={styles.tableScroll}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Mine</th>
                                    <th style={styles.th}>Location</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>
                                        Production
                                    </th>
                                    <th style={styles.th}>Grade</th>
                                    <th style={styles.th}>
                                        Operating Hours
                                    </th>
                                    <th style={styles.th}>
                                        Utilization
                                    </th>
                                    <th style={styles.th}>
                                        Temperature
                                    </th>
                                    <th style={styles.th}>Rainfall</th>
                                    <th style={styles.th}>Water Consumption</th>
                                    <th style={styles.th}>Fuel Consumption</th>
                                    <th style={styles.th}>Energy Consumption</th>
                                    <th style={styles.th}>Waste Generated</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((item) => (
                                    <tr
                                        key={item.id}
                                        style={styles.tableRow}
                                    >
                                        <td style={styles.td}>
                                            <strong style={styles.mineName}>
                                                {item.mine_name}
                                            </strong>
                                            <span style={styles.recordId}>
                                                ID #{item.id}
                                            </span>
                                        </td>

                                        <td style={styles.td}>
                                            📍 {item.location}
                                        </td>

                                        <td style={styles.td}>
                                            {item.production_date}
                                        </td>

                                        <td style={styles.td}>
                                            <strong>
                                                {formatNumber(
                                                    Number(
                                                        item.phosphate_production
                                                    ) || 0
                                                )}
                                            </strong>
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.phosphate_grade) || 0
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.operating_hours) || 0
                                            )}{" "}
                                            h
                                        </td>

                                        <td style={styles.td}>
                                            <span style={styles.utilizationBadge}>
                                                {formatNumber(
                                                    Number(
                                                        item.equipment_utilization
                                                    ) || 0
                                                )}%
                                            </span>
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.temperature) || 0
                                            )}{" "}
                                            °C
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.rainfall) || 0
                                            )}{" "}
                                            mm
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.water_consumption) || 0
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.fuel_consumption) || 0
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.energy_consumption) || 0
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            {formatNumber(
                                                Number(item.waste_generated) || 0
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            <div style={styles.actionGroup}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    style={styles.editButton}
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    style={styles.deleteButton}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <footer style={styles.footer}>
                ⛏️ Phosphate Mining System · Mining Data Management
            </footer>
        </div>
    );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
    page: {
        minHeight: "100vh",
        padding: "30px 34px",
        boxSizing: "border-box",
        background: "#f1f5f9",
        color: "#0f172a",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "25px",
    },

    headerLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },

    backButton: {
        alignSelf: "flex-start",
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#334155",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },

    headingRow: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },

    headingIcon: {
        width: "54px",
        height: "54px",
        borderRadius: "15px",
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "27px",
        flexShrink: 0,
    },

    eyebrow: {
        margin: "0 0 5px",
        color: "#2563eb",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.2px",
    },

    title: {
        margin: 0,
        fontSize: "27px",
        fontWeight: "800",
        letterSpacing: "-0.5px",
    },

    subtitle: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "13px",
    },

    refreshButton: {
        border: "none",
        borderRadius: "9px",
        padding: "12px 17px",
        background: "#2563eb",
        color: "#ffffff",
        fontWeight: "700",
        fontSize: "12px",
        cursor: "pointer",
    },

    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "15px",
        marginBottom: "22px",
    },

    summaryCard: {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "19px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxShadow: "0 4px 15px rgba(15, 23, 42, 0.04)",
        minWidth: 0,
    },

    summaryIcon: {
        width: "45px",
        height: "45px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "21px",
        flexShrink: 0,
    },

    summaryLabel: {
        margin: 0,
        color: "#64748b",
        fontSize: "11px",
    },

    summaryValue: {
        margin: "5px 0",
        color: "#0f172a",
        fontSize: "21px",
        fontWeight: "800",
        overflowWrap: "anywhere",
    },

    summaryHint: {
        color: "#94a3b8",
        fontSize: "10px",
    },

    successMessage: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 15px",
        marginBottom: "16px",
        borderRadius: "10px",
        border: "1px solid #a7f3d0",
        background: "#ecfdf5",
        color: "#047857",
        fontSize: "12px",
        fontWeight: "600",
    },

    errorMessage: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 15px",
        marginBottom: "16px",
        borderRadius: "10px",
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#b91c1c",
        fontSize: "12px",
    },

    messageText: {
        flex: 1,
        overflowWrap: "anywhere",
    },

    dismissButton: {
        marginLeft: "auto",
        border: "none",
        background: "transparent",
        color: "inherit",
        fontSize: "20px",
        cursor: "pointer",
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "25px",
        marginBottom: "22px",
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        minWidth: 0,
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "24px",
    },

    cardEyebrow: {
        margin: "0 0 6px",
        color: "#2563eb",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1px",
    },

    cardTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#0f172a",
    },

    cardDescription: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    editBadge: {
        padding: "7px 11px",
        background: "#fef3c7",
        color: "#92400e",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "19px",
    },

    field: {
        minWidth: 0,
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#334155",
        fontSize: "12px",
        fontWeight: "700",
    },

    input: {
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        padding: "12px",
        color: "#0f172a",
        background: "#ffffff",
        fontSize: "12px",
        outline: "none",
    },

    formFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        borderTop: "1px solid #e2e8f0",
        marginTop: "24px",
        paddingTop: "19px",
    },

    requiredHint: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "11px",
    },

    formActions: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },

    submitButton: {
        border: "none",
        borderRadius: "9px",
        padding: "12px 17px",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    cancelButton: {
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        padding: "12px 15px",
        background: "#ffffff",
        color: "#475569",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
    },

    disabledButton: {
        opacity: 0.6,
        cursor: "not-allowed",
    },

    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "18px",
        marginBottom: "20px",
    },

    searchWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        width: "min(100%, 330px)",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        padding: "0 12px",
        background: "#ffffff",
    },

    searchInput: {
        width: "100%",
        minWidth: 0,
        border: "none",
        outline: "none",
        padding: "12px 0",
        fontSize: "12px",
        background: "transparent",
        color: "#0f172a",
    },

    tableMeta: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#64748b",
        fontSize: "11px",
        padding: "12px 0",
        borderTop: "1px solid #e2e8f0",
    },

    tableScroll: {
        width: "100%",
        overflowX: "auto",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
    },

    table: {
        width: "100%",
        minWidth: "1500px",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: "11px",
    },

    th: {
        background: "#f8fafc",
        color: "#475569",
        fontWeight: "800",
        padding: "15px 13px",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
    },

    td: {
        padding: "14px 13px",
        borderBottom: "1px solid #f1f5f9",
        color: "#475569",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
    },

    tableRow: {
        background: "#ffffff",
    },

    mineName: {
        display: "block",
        color: "#0f172a",
        fontSize: "12px",
    },

    recordId: {
        display: "block",
        color: "#94a3b8",
        fontSize: "10px",
        marginTop: "4px",
    },

    utilizationBadge: {
        display: "inline-block",
        padding: "5px 8px",
        borderRadius: "6px",
        background: "#dcfce7",
        color: "#166534",
        fontWeight: "700",
    },

    actionGroup: {
        display: "flex",
        gap: "7px",
    },

    editButton: {
        border: "1px solid #bfdbfe",
        borderRadius: "6px",
        padding: "7px 9px",
        background: "#eff6ff",
        color: "#1d4ed8",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: "700",
    },

    deleteButton: {
        border: "1px solid #fecaca",
        borderRadius: "6px",
        padding: "7px 9px",
        background: "#fef2f2",
        color: "#dc2626",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: "700",
    },

    emptyState: {
        padding: "45px 15px",
        textAlign: "center",
        color: "#64748b",
    },

    emptyIcon: {
        fontSize: "35px",
        marginBottom: "10px",
    },

    footer: {
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "11px",
        padding: "8px 0 15px",
    },
};

export default MiningData;