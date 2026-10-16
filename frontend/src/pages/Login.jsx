import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login/", {
                username,
                password,
            });

            // Store JWT tokens
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            // Store user information
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("role", response.data.role);

            setMessage("Login successful!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error) {
            const data = error.response?.data;

            if (data?.error) {
                setMessage(data.error);
            } else {
                setMessage("Login failed. Please try again.");
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
                        Advanced Forecasting Framework
                        <br />
                        for Sustainable Phosphate Mining
                    </h2>

                    <p style={styles.brandDescription}>
                        Monitor mining operations, forecast water
                        requirements and support sustainable
                        resource management with AI-powered
                        analytics.
                    </p>

                    <div style={styles.featureList}>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                🤖
                            </span>

                            <span>
                                AI-powered Ridge Regression
                            </span>
                        </div>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                💧
                            </span>

                            <span>
                                Sustainable Water Management
                            </span>
                        </div>

                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>
                                📊
                            </span>

                            <span>
                                Mining Analytics & Monitoring
                            </span>
                        </div>

                    </div>

                </div>

                <div style={styles.brandFooter}>
                    🌱 Sustainable Mining • Intelligent Decisions
                </div>

            </section>

            {/* =================================================
                LOGIN SECTION
            ================================================= */}

            <section style={styles.loginSection}>

                <div style={styles.loginCard}>

                    <div style={styles.mobileLogo}>
                        ⛏️
                    </div>

                    <p style={styles.loginEyebrow}>
                        WELCOME BACK
                    </p>

                    <h2 style={styles.loginTitle}>
                        Sign in to your account
                    </h2>

                    <p style={styles.loginDescription}>
                        Access your mining operations dashboard.
                    </p>

                    {/* =================================================
                        LOGIN FORM
                    ================================================= */}

                    <form onSubmit={handleLogin}>

                        {/* USERNAME */}

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
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                    style={styles.input}
                                />

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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                                    {showPassword ? "🙈" : "👁️"}
                                </button>

                            </div>

                        </div>

                        {/* MESSAGE */}

                        {message && (
                            <div
                                style={
                                    message ===
                                    "Login successful!"
                                        ? styles.successMessage
                                        : styles.errorMessage
                                }
                            >
                                <span>
                                    {message ===
                                    "Login successful!"
                                        ? "✓"
                                        : "!"}
                                </span>

                                <span>
                                    {message}
                                </span>
                            </div>
                        )}

                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.loginButton,
                                ...(loading
                                    ? styles.loginButtonDisabled
                                    : {}),
                            }}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In →"}
                        </button>

                    </form>

                    {/* REGISTER */}

                    <div style={styles.registerSection}>

                        <span style={styles.registerText}>
                            Don't have an account?
                        </span>

                        <Link
                            to="/register"
                            style={styles.registerLink}
                        >
                            Create an account
                        </Link>

                    </div>

                    {/* SECURITY */}

                    <div style={styles.securityNote}>
                        🔐 Secure JWT Authentication
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
    // LEFT BRAND SECTION
    // =====================================================

    brandSection: {
        width: "52%",
        minHeight: "100vh",
        boxSizing: "border-box",
        background:
            "linear-gradient(145deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)",
        color: "#ffffff",
        padding: "55px 70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
    },

    brandContent: {
        maxWidth: "620px",
        margin: "auto",
    },

    logoBox: {
        width: "68px",
        height: "68px",
        borderRadius: "18px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
        boxShadow:
            "0 12px 35px rgba(37, 99, 235, 0.35)",
    },

    brandTitle: {
        margin: "25px 0 0",
        fontSize: "38px",
        lineHeight: "1.1",
        fontWeight: "800",
        letterSpacing: "-1px",
    },

    brandSubtitle: {
        margin: "10px 0 0",
        color: "#93c5fd",
        fontSize: "16px",
    },

    brandLine: {
        width: "65px",
        height: "4px",
        borderRadius: "10px",
        background: "#60a5fa",
        margin: "28px 0",
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
        maxWidth: "570px",
    },

    featureList: {
        marginTop: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
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
    // LOGIN SECTION
    // =====================================================

    loginSection: {
        flex: 1,
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "40px 45px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
    },

    loginCard: {
        width: "100%",
        maxWidth: "440px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "38px",
        boxSizing: "border-box",
        boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.08)",
    },

    mobileLogo: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        marginBottom: "24px",
    },

    loginEyebrow: {
        margin: 0,
        color: "#2563eb",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.4px",
    },

    loginTitle: {
        margin: "7px 0 0",
        color: "#0f172a",
        fontSize: "27px",
        lineHeight: "1.25",
    },

    loginDescription: {
        margin: "9px 0 28px",
        color: "#64748b",
        fontSize: "13px",
        lineHeight: "1.5",
    },

    // =====================================================
    // FORM
    // =====================================================

    fieldGroup: {
        marginBottom: "19px",
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#334155",
        fontSize: "12px",
        fontWeight: "700",
    },

    inputWrapper: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        background: "#ffffff",
        transition: "0.2s",
        overflow: "hidden",
    },

    inputIcon: {
        paddingLeft: "13px",
        fontSize: "15px",
        flexShrink: 0,
    },

    input: {
        width: "100%",
        border: "none",
        outline: "none",
        padding: "13px 13px",
        fontSize: "13px",
        color: "#0f172a",
        background: "transparent",
        boxSizing: "border-box",
    },

    passwordInput: {
        flex: 1,
        minWidth: 0,
        border: "none",
        outline: "none",
        padding: "13px",
        fontSize: "13px",
        color: "#0f172a",
        background: "transparent",
        boxSizing: "border-box",
    },

    passwordToggle: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "10px 13px",
        fontSize: "15px",
    },

    // =====================================================
    // MESSAGES
    // =====================================================

    successMessage: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 13px",
        marginBottom: "17px",
        borderRadius: "9px",
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
        color: "#047857",
        fontSize: "12px",
        fontWeight: "600",
    },

    errorMessage: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 13px",
        marginBottom: "17px",
        borderRadius: "9px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        fontSize: "12px",
        fontWeight: "600",
    },

    // =====================================================
    // BUTTON
    // =====================================================

    loginButton: {
        width: "100%",
        border: "none",
        borderRadius: "10px",
        padding: "14px",
        background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "700",
        boxShadow:
            "0 8px 20px rgba(37, 99, 235, 0.22)",
        transition: "0.2s",
    },

    loginButtonDisabled: {
        opacity: 0.65,
        cursor: "not-allowed",
    },

    // =====================================================
    // REGISTER
    // =====================================================

    registerSection: {
        marginTop: "22px",
        paddingTop: "20px",
        borderTop: "1px solid #e2e8f0",
        textAlign: "center",
        fontSize: "12px",
    },

    registerText: {
        color: "#64748b",
    },

    registerLink: {
        marginLeft: "5px",
        color: "#2563eb",
        fontWeight: "700",
        textDecoration: "none",
    },

    // =====================================================
    // SECURITY
    // =====================================================

    securityNote: {
        marginTop: "20px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "10px",
    },

    copyright: {
        marginTop: "20px",
        color: "#94a3b8",
        fontSize: "10px",
        textAlign: "center",
    },
};

export default Login;