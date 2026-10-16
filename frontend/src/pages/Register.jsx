import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "contractor",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register/", formData);

            setMessage(
                "Registration successful! Please wait for admin approval."
            );

            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch (error) {
            const data = error.response?.data;

            if (data) {
                setError(JSON.stringify(data));
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            {/* =================================================
                LEFT BRAND SECTION
            ================================================= */}

            <section style={styles.brandSection}>

                <div style={styles.brandContent}>

                    <div style={styles.logoBox}>
                        ⛏️
                    </div>

                    <h1 style={styles.brandTitle}>
                        Phosphate Mining
                    </h1>

                    <p style={styles.brandSubtitle}>
                        Intelligent Mining Management System
                    </p>

                    <div style={styles.brandLine} />

                    <h2 style={styles.frameworkTitle}>
                        Join the Sustainable
                        <br />
                        Mining Platform
                    </h2>

                    <p style={styles.brandDescription}>
                        Create your account to access mining
                        operations, production monitoring,
                        sustainability analytics and
                        AI-powered forecasting.
                    </p>

                    <div style={styles.featureList}>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                🤖
                            </span>

                            <span>
                                AI-powered forecasting
                            </span>
                        </div>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                🌱
                            </span>

                            <span>
                                Sustainable mining operations
                            </span>
                        </div>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                🔐
                            </span>

                            <span>
                                Secure role-based access
                            </span>
                        </div>

                    </div>

                </div>

                <div style={styles.brandFooter}>
                    🌱 Sustainable Mining • Intelligent Decisions
                </div>

            </section>

            {/* =================================================
                REGISTER SECTION
            ================================================= */}

            <section style={styles.registerSection}>

                <div style={styles.registerCard}>

                    <div style={styles.mobileLogo}>
                        👤
                    </div>

                    <p style={styles.registerEyebrow}>
                        GET STARTED
                    </p>

                    <h2 style={styles.registerTitle}>
                        Create your account
                    </h2>

                    <p style={styles.registerDescription}>
                        Register for access to the mining management
                        system.
                    </p>

                    <form onSubmit={handleRegister}>

                        {/* USERNAME + EMAIL */}

                        <div style={styles.row}>

                            <div style={styles.fieldGroup}>

                                <label style={styles.label}>
                                    Username
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>
                                        👤
                                    </span>

                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                            </div>

                            <div style={styles.fieldGroup}>

                                <label style={styles.label}>
                                    Email
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>
                                        ✉️
                                    </span>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                            </div>

                        </div>

                        {/* FIRST NAME + LAST NAME */}

                        <div style={styles.row}>

                            <div style={styles.fieldGroup}>

                                <label style={styles.label}>
                                    First Name
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>
                                        ✨
                                    </span>

                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="First name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>

                            </div>

                            <div style={styles.fieldGroup}>

                                <label style={styles.label}>
                                    Last Name
                                </label>

                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>
                                        ✨
                                    </span>

                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Last name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        style={styles.input}
                                    />
                                </div>

                            </div>

                        </div>

                        {/* PASSWORD */}

                        <div style={styles.fieldGroup}>

                            <label style={styles.label}>
                                Password
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    🔒
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={styles.passwordInput}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    style={styles.passwordToggle}
                                >
                                    {showPassword
                                        ? "🙈"
                                        : "👁️"}
                                </button>

                            </div>

                        </div>

                        {/* ROLE */}

                        <div style={styles.fieldGroup}>

                            <label style={styles.label}>
                                Select Role
                            </label>

                            <div style={styles.inputWrapper}>

                                <span style={styles.inputIcon}>
                                    🏢
                                </span>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    style={styles.select}
                                >

                                    <option value="contractor">
                                        Contractor
                                    </option>

                                    <option value="provision">
                                        Provision
                                    </option>

                                    <option value="technical">
                                        Technical Team
                                    </option>

                                    <option value="process">
                                        Process Unit
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* INFORMATION */}

                        <div style={styles.approvalNote}>
                            <span style={styles.approvalIcon}>
                                ℹ️
                            </span>

                            <span>
                                New accounts require administrator
                                approval before login.
                            </span>
                        </div>

                        {/* SUCCESS MESSAGE */}

                        {message && (
                            <div style={styles.successMessage}>
                                <span>✓</span>
                                <span>{message}</span>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}

                        {error && (
                            <div style={styles.errorMessage}>
                                <span>!</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.registerButton,
                                ...(loading
                                    ? styles.registerButtonDisabled
                                    : {}),
                            }}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account →"}
                        </button>

                    </form>

                    {/* LOGIN */}

                    <div style={styles.loginSection}>

                        <span style={styles.loginText}>
                            Already have an account?
                        </span>

                        <Link
                            to="/"
                            style={styles.loginLink}
                        >
                            Sign in
                        </Link>

                    </div>

                    <div style={styles.securityNote}>
                        🔐 Secure role-based authentication
                    </div>

                </div>

                <div style={styles.copyright}>
                    © 2026 Phosphate Mining System
                </div>

            </section>

        </div>
    );
}

// =========================================================
// STYLES
// =========================================================

const styles = {

    page: {
        minHeight: "100vh",
        display: "flex",
        background: "#f8fafc",
        fontFamily:
            "Inter, Segoe UI, Arial, sans-serif",
    },

    // =====================================================
    // LEFT BRAND
    // =====================================================

    brandSection: {
        width: "48%",
        minHeight: "100vh",
        boxSizing: "border-box",
        background:
            "linear-gradient(145deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)",
        color: "#ffffff",
        padding: "55px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
    },

    brandContent: {
        maxWidth: "580px",
        margin: "auto",
    },

    logoBox: {
        width: "64px",
        height: "64px",
        borderRadius: "17px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        boxShadow:
            "0 12px 35px rgba(37, 99, 235, 0.35)",
    },

    brandTitle: {
        margin: "24px 0 0",
        fontSize: "36px",
        lineHeight: "1.1",
        fontWeight: "800",
        letterSpacing: "-1px",
    },

    brandSubtitle: {
        margin: "10px 0 0",
        color: "#93c5fd",
        fontSize: "15px",
    },

    brandLine: {
        width: "65px",
        height: "4px",
        borderRadius: "10px",
        background: "#60a5fa",
        margin: "27px 0",
    },

    frameworkTitle: {
        margin: 0,
        fontSize: "25px",
        lineHeight: "1.35",
        fontWeight: "700",
    },

    brandDescription: {
        marginTop: "16px",
        color: "#cbd5e1",
        fontSize: "14px",
        lineHeight: "1.8",
    },

    featureList: {
        marginTop: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "13px",
    },

    feature: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "#e2e8f0",
        fontSize: "13px",
    },

    featureIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        background: "rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
    },

    brandFooter: {
        color: "#94a3b8",
        fontSize: "11px",
        textAlign: "center",
    },

    // =====================================================
    // REGISTER AREA
    // =====================================================

    registerSection: {
        flex: 1,
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "35px 45px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
        overflowY: "auto",
    },

    registerCard: {
        width: "100%",
        maxWidth: "570px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "32px 38px",
        boxSizing: "border-box",
        boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.08)",
    },

    mobileLogo: {
        width: "48px",
        height: "48px",
        borderRadius: "13px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        marginBottom: "18px",
    },

    registerEyebrow: {
        margin: 0,
        color: "#2563eb",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
    },

    registerTitle: {
        margin: "6px 0 0",
        color: "#0f172a",
        fontSize: "26px",
    },

    registerDescription: {
        margin: "8px 0 23px",
        color: "#64748b",
        fontSize: "13px",
    },

    // =====================================================
    // FORM
    // =====================================================

    row: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "14px",
    },

    fieldGroup: {
        marginBottom: "15px",
    },

    label: {
        display: "block",
        marginBottom: "7px",
        color: "#334155",
        fontSize: "11px",
        fontWeight: "700",
    },

    inputWrapper: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        background: "#ffffff",
        overflow: "hidden",
    },

    inputIcon: {
        paddingLeft: "11px",
        fontSize: "14px",
        flexShrink: 0,
    },

    input: {
        width: "100%",
        border: "none",
        outline: "none",
        padding: "11px",
        fontSize: "12px",
        color: "#0f172a",
        background: "transparent",
        boxSizing: "border-box",
    },

    passwordInput: {
        flex: 1,
        minWidth: 0,
        border: "none",
        outline: "none",
        padding: "11px",
        fontSize: "12px",
        color: "#0f172a",
        background: "transparent",
    },

    passwordToggle: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "8px 11px",
        fontSize: "14px",
    },

    select: {
        flex: 1,
        border: "none",
        outline: "none",
        padding: "11px",
        fontSize: "12px",
        color: "#0f172a",
        background: "#ffffff",
        cursor: "pointer",
    },

    // =====================================================
    // APPROVAL NOTE
    // =====================================================

    approvalNote: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        margin: "2px 0 15px",
        borderRadius: "8px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        fontSize: "10px",
        lineHeight: "1.4",
    },

    approvalIcon: {
        fontSize: "14px",
        flexShrink: 0,
    },

    // =====================================================
    // MESSAGES
    // =====================================================

    successMessage: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "10px 12px",
        marginBottom: "14px",
        borderRadius: "8px",
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
        color: "#047857",
        fontSize: "11px",
        fontWeight: "600",
    },

    errorMessage: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "10px 12px",
        marginBottom: "14px",
        borderRadius: "8px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        fontSize: "11px",
        lineHeight: "1.4",
        wordBreak: "break-word",
    },

    // =====================================================
    // BUTTON
    // =====================================================

    registerButton: {
        width: "100%",
        border: "none",
        borderRadius: "9px",
        padding: "13px",
        background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow:
            "0 8px 20px rgba(37, 99, 235, 0.22)",
    },

    registerButtonDisabled: {
        opacity: 0.65,
        cursor: "not-allowed",
    },

    // =====================================================
    // LOGIN
    // =====================================================

    loginSection: {
        marginTop: "19px",
        paddingTop: "17px",
        borderTop: "1px solid #e2e8f0",
        textAlign: "center",
        fontSize: "11px",
    },

    loginText: {
        color: "#64748b",
    },

    loginLink: {
        marginLeft: "5px",
        color: "#2563eb",
        fontWeight: "700",
        textDecoration: "none",
    },

    securityNote: {
        marginTop: "17px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "9px",
    },

    copyright: {
        marginTop: "16px",
        color: "#94a3b8",
        fontSize: "9px",
        textAlign: "center",
    },
};

export default Register;