import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username") || "User";
    const role = localStorage.getItem("role") || "";

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [token, navigate]);

    // =========================================================
    // ROLE-BASED MODULES
    // =========================================================

    const getModules = () => {
        switch (role) {
            case "contractor":
                return [
                    {
                        name: "Mining Data",
                        description: "View mining records",
                        path: "/mining",
                        icon: "⛏️",
                    },
                    {
                        name: "Production Monitoring",
                        description: "Monitor production",
                        path: "/analytics",
                        icon: "📊",
                    },
                    {
                        name: "Reports",
                        description: "View mining reports",
                        path: "/analytics",
                        icon: "📄",
                    },
                ];

            case "provision":
                return [
                    {
                        name: "Provision Data",
                        description: "Manage provision operations",
                        path: "/provision-dashboard",
                        icon: "📦",
                    },
                    {
                        name: "Material Management",
                        description: "Manage material stock",
                        path: "/provision-dashboard",
                        icon: "🧰",
                    },
                    {
                        name: "Reports",
                        description: "View mining reports",
                        path: "/analytics",
                        icon: "📄",
                    },
                ];

            case "technical":
                return [
                    {
                        name: "Technical Data",
                        description: "Monitor technical operations",
                        path: "/technical-dashboard",
                        icon: "⚙️",
                    },
                    {
                        name: "Forecasting",
                        description: "AI water requirement forecasting",
                        path: "/forecasting",
                        icon: "🤖",
                    },
                    {
                        name: "Analytics",
                        description: "Production and sustainability analytics",
                        path: "/analytics",
                        icon: "📊",
                    },
                    {
                        name: "Continuous Learning",
                        description: "Ridge model retraining",
                        path: "/continuous-learning",
                        icon: "🧠",
                    },
                    {
                        name: "Sustainable Water",
                        description: "Water requirement monitoring",
                        path: "/sustainable-water",
                        icon: "💧",
                    },
                    {
                        name: "Sustainability Insights",
                        description: "Environmental analysis",
                        path: "/sustainability-insights",
                        icon: "🌱",
                    },
                    {
                        name: "Reports",
                        description: "Generate mining reports",
                        path: "/analytics",
                        icon: "📄",
                    },
                ];

            case "process":
                return [
                    {
                        name: "Process Monitoring",
                        description: "Monitor mining process",
                        path: "/process-dashboard",
                        icon: "🏭",
                    },
                    {
                        name: "Production Data",
                        description: "Manage mining data",
                        path: "/mining",
                        icon: "⛏️",
                    },
                    {
                        name: "Analytics",
                        description: "Production analytics",
                        path: "/analytics",
                        icon: "📊",
                    },
                    {
                        name: "Sustainable Water",
                        description: "Monitor water consumption",
                        path: "/sustainable-water",
                        icon: "💧",
                    },
                    {
                        name: "Sustainability Insights",
                        description: "Environmental analysis",
                        path: "/sustainability-insights",
                        icon: "🌱",
                    },
                    {
                        name: "Reports",
                        description: "View mining reports",
                        path: "/analytics",
                        icon: "📄",
                    },
                ];

            default:
                return [];
        }
    };

    const modules = getModules();

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        navigate("/");
    };

    // =========================================================
    // ROLE DISPLAY
    // =========================================================

    const roleName = {
        technical: "Technical Team",
        process: "Process Unit",
        contractor: "Contractor",
        provision: "Provision Team",
    };

    const displayRole = roleName[role] || role;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div style={styles.page}>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside style={styles.sidebar}>

                <div style={styles.brand}>
                    <div style={styles.brandIcon}>
                        ⛏️
                    </div>

                    <div>
                        <h1 style={styles.brandTitle}>
                            Phosphate
                        </h1>

                        <p style={styles.brandSubtitle}>
                            Mining System
                        </p>
                    </div>
                </div>

                <div style={styles.sidebarDivider} />

                <nav style={styles.navigation}>

                    <button
                        style={{
                            ...styles.navItem,
                            ...styles.navItemActive,
                        }}
                    >
                        <span style={styles.navIcon}>🏠</span>
                        <span>Dashboard</span>
                    </button>

                    {role === "technical" && (
                        <>
                            <button
                                onClick={() =>
                                    navigate("/technical-dashboard")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>⚙️</span>
                                <span>Technical</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/forecasting")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>🤖</span>
                                <span>Forecasting</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/analytics")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📊</span>
                                <span>Analytics</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/sustainable-water")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>💧</span>
                                <span>Water Management</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/sustainability-insights")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>🌱</span>
                                <span>Sustainability</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/continuous-learning")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>🧠</span>
                                <span>AI Learning</span>
                            </button>
                        </>
                    )}

                    {role === "process" && (
                        <>
                            <button
                                onClick={() =>
                                    navigate("/process-dashboard")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>🏭</span>
                                <span>Process Monitoring</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/mining")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>⛏️</span>
                                <span>Mining Data</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/analytics")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📊</span>
                                <span>Analytics</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/sustainable-water")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>💧</span>
                                <span>Water Management</span>
                            </button>
                        </>
                    )}

                    {role === "contractor" && (
                        <>
                            <button
                                onClick={() =>
                                    navigate("/mining")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>⛏️</span>
                                <span>Mining Data</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/contractor-requests")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📦</span>
                                <span>Material Requests</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/analytics")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📄</span>
                                <span>Reports</span>
                            </button>
                        </>
                    )}

                    {role === "provision" && (
                        <>
                            <button
                                onClick={() =>
                                    navigate("/provision-dashboard")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📦</span>
                                <span>Provision</span>
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/analytics")
                                }
                                style={styles.navItem}
                            >
                                <span style={styles.navIcon}>📄</span>
                                <span>Reports</span>
                            </button>
                        </>
                    )}

                </nav>

                <div style={styles.sidebarBottom}>

                    <div style={styles.sidebarStatus}>
                        <span style={styles.statusDot}>●</span>

                        <div>
                            <strong style={styles.statusTitle}>
                                System Online
                            </strong>

                            <span style={styles.statusText}>
                                All services active
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={styles.sidebarLogout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main style={styles.main}>

                {/* TOP BAR */}

                <header style={styles.topbar}>

                    <div>
                        <p style={styles.breadcrumb}>
                            Mining System / Dashboard
                        </p>

                        <h2 style={styles.pageTitle}>
                            Dashboard
                        </h2>
                    </div>

                    <div style={styles.userArea}>

                        <div style={styles.userAvatar}>
                            {username.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong style={styles.username}>
                                {username}
                            </strong>

                            <span style={styles.userRole}>
                                {displayRole}
                            </span>
                        </div>

                    </div>

                </header>

                {/* WELCOME BANNER */}

                <section style={styles.welcomeBanner}>

                    <div>

                        <p style={styles.welcomeSmall}>
                            Welcome back 👋
                        </p>

                        <h1 style={styles.welcomeHeading}>
                            {username}, let's manage your mining operations.
                        </h1>

                        <p style={styles.welcomeDescription}>
                            Monitor production, sustainability,
                            water requirements and AI-powered
                            forecasting from one place.
                        </p>

                    </div>

                    <div style={styles.bannerIcon}>
                        🌱
                    </div>

                </section>

                {/* QUICK STATUS */}

                <section style={styles.statsGrid}>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📊</div>

                        <div>
                            <span style={styles.statLabel}>
                                System
                            </span>

                            <strong style={styles.statValue}>
                                Active
                            </strong>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🤖</div>

                        <div>
                            <span style={styles.statLabel}>
                                AI Model
                            </span>

                            <strong style={styles.statValue}>
                                Ridge Regression
                            </strong>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🌱</div>

                        <div>
                            <span style={styles.statLabel}>
                                Focus
                            </span>

                            <strong style={styles.statValue}>
                                Sustainable Mining
                            </strong>
                        </div>
                    </div>

                </section>

                {/* MODULES */}

                <section style={styles.modulesSection}>

                    <div style={styles.sectionHeader}>

                        <div>
                            <p style={styles.sectionEyebrow}>
                                YOUR ACCESS
                            </p>

                            <h2 style={styles.sectionTitle}>
                                Available Modules
                            </h2>

                            <p style={styles.sectionDescription}>
                                Select a module to continue.
                            </p>
                        </div>

                        <div style={styles.moduleCount}>
                            {modules.length} Modules
                        </div>

                    </div>

                    <div style={styles.moduleGrid}>

                        {modules.map((module, index) => (

                            <button
                                key={index}
                                onClick={() =>
                                    navigate(module.path)
                                }
                                style={styles.moduleCard}
                            >

                                <div style={styles.moduleTop}>

                                    <div style={styles.moduleIcon}>
                                        {module.icon}
                                    </div>

                                    <span style={styles.moduleArrow}>
                                        ↗
                                    </span>

                                </div>

                                <h3 style={styles.moduleName}>
                                    {module.name}
                                </h3>

                                <p style={styles.moduleDescription}>
                                    {module.description}
                                </p>

                                <span style={styles.openModule}>
                                    Open module →
                                </span>

                            </button>

                        ))}

                    </div>

                </section>

                {/* PROJECT INFORMATION */}

                <section style={styles.projectSection}>

                    <div style={styles.projectIcon}>
                        🌱
                    </div>

                    <div style={styles.projectContent}>

                        <span style={styles.projectLabel}>
                            PROJECT OBJECTIVE
                        </span>

                        <h2 style={styles.projectTitle}>
                            Advanced Forecasting Framework
                            for Sustainable Phosphate Mining
                        </h2>

                        <p style={styles.projectText}>
                            An intelligent mining monitoring platform
                            focused on production analysis, water
                            requirement forecasting, continuous
                            learning and sustainable resource
                            management.
                        </p>

                    </div>

                    <div style={styles.projectBadge}>
                        AI Powered
                    </div>

                </section>

                <footer style={styles.footer}>
                    Phosphate Mining System • Sustainable Mining
                    &nbsp;•&nbsp; AI Forecasting
                </footer>

            </main>

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
        background: "#f1f5f9",
        color: "#0f172a",
        fontFamily:
            "Inter, Segoe UI, Arial, sans-serif",
    },

    // =====================================================
    // SIDEBAR
    // =====================================================

    sidebar: {
        width: "255px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        padding: "24px 16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
    },

    brand: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "4px 8px 20px",
    },

    brandIcon: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
    },

    brandTitle: {
        margin: 0,
        fontSize: "17px",
        fontWeight: "700",
        color: "#ffffff",
    },

    brandSubtitle: {
        margin: "3px 0 0",
        fontSize: "12px",
        color: "#94a3b8",
    },

    sidebarDivider: {
        height: "1px",
        background: "#1e293b",
        margin: "0 8px 18px",
    },

    navigation: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },

    navItem: {
        width: "100%",
        border: "none",
        borderRadius: "10px",
        padding: "11px 12px",
        background: "transparent",
        color: "#cbd5e1",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        cursor: "pointer",
        fontSize: "13px",
        textAlign: "left",
        transition: "0.2s",
    },

    navItemActive: {
        background: "#1d4ed8",
        color: "#ffffff",
    },

    navIcon: {
        width: "25px",
        textAlign: "center",
        fontSize: "17px",
    },

    sidebarBottom: {
        marginTop: "auto",
    },

    sidebarStatus: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px",
        borderRadius: "10px",
        background: "#111c31",
        marginBottom: "12px",
    },

    statusDot: {
        color: "#22c55e",
        fontSize: "12px",
    },

    statusTitle: {
        display: "block",
        color: "#e2e8f0",
        fontSize: "12px",
    },

    statusText: {
        display: "block",
        color: "#64748b",
        fontSize: "10px",
        marginTop: "2px",
    },

    sidebarLogout: {
        width: "100%",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "11px",
        background: "transparent",
        color: "#fca5a5",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    },

    // =====================================================
    // MAIN
    // =====================================================

    main: {
        flex: 1,
        minWidth: 0,
        padding: "28px 34px",
        boxSizing: "border-box",
    },

    topbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "24px",
    },

    breadcrumb: {
        margin: 0,
        color: "#94a3b8",
        fontSize: "12px",
    },

    pageTitle: {
        margin: "5px 0 0",
        fontSize: "27px",
        fontWeight: "750",
        color: "#0f172a",
    },

    userArea: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
    },

    userAvatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#dbeafe",
        color: "#1d4ed8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
    },

    username: {
        display: "block",
        fontSize: "13px",
        color: "#0f172a",
    },

    userRole: {
        display: "block",
        fontSize: "11px",
        color: "#64748b",
        marginTop: "2px",
    },

    // =====================================================
    // WELCOME
    // =====================================================

    welcomeBanner: {
        borderRadius: "18px",
        padding: "30px",
        background:
            "linear-gradient(135deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)",
        color: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        overflow: "hidden",
        position: "relative",
    },

    welcomeSmall: {
        margin: 0,
        color: "#93c5fd",
        fontSize: "13px",
        fontWeight: "600",
    },

    welcomeHeading: {
        margin: "8px 0 0",
        fontSize: "25px",
        lineHeight: "1.3",
        maxWidth: "700px",
    },

    welcomeDescription: {
        margin: "10px 0 0",
        color: "#cbd5e1",
        fontSize: "13px",
        lineHeight: "1.6",
        maxWidth: "650px",
    },

    bannerIcon: {
        width: "95px",
        height: "95px",
        borderRadius: "25px",
        background: "rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "45px",
        flexShrink: 0,
    },

    // =====================================================
    // QUICK STATS
    // =====================================================

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
        gap: "16px",
        marginTop: "18px",
    },

    statCard: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "17px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        boxShadow:
            "0 4px 15px rgba(15, 23, 42, 0.04)",
    },

    statIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "11px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },

    statLabel: {
        display: "block",
        color: "#64748b",
        fontSize: "11px",
        marginBottom: "4px",
    },

    statValue: {
        display: "block",
        color: "#0f172a",
        fontSize: "14px",
    },

    // =====================================================
    // MODULES
    // =====================================================

    modulesSection: {
        marginTop: "32px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
    },

    sectionEyebrow: {
        margin: 0,
        color: "#2563eb",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.2px",
    },

    sectionTitle: {
        margin: "5px 0 0",
        fontSize: "22px",
        color: "#0f172a",
    },

    sectionDescription: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "13px",
    },

    moduleCount: {
        background: "#dbeafe",
        color: "#1d4ed8",
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
    },

    moduleGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginTop: "18px",
    },

    moduleCard: {
        border: "1px solid #e2e8f0",
        borderRadius: "15px",
        padding: "20px",
        background: "#ffffff",
        cursor: "pointer",
        textAlign: "left",
        boxShadow:
            "0 4px 15px rgba(15, 23, 42, 0.04)",
        transition: "0.2s",
    },

    moduleTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    moduleIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "13px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
    },

    moduleArrow: {
        color: "#2563eb",
        fontSize: "22px",
    },

    moduleName: {
        margin: "18px 0 0",
        color: "#0f172a",
        fontSize: "16px",
        fontWeight: "700",
    },

    moduleDescription: {
        margin: "7px 0 0",
        color: "#64748b",
        fontSize: "12px",
        lineHeight: "1.5",
    },

    openModule: {
        display: "inline-block",
        marginTop: "15px",
        color: "#2563eb",
        fontSize: "11px",
        fontWeight: "700",
    },

    // =====================================================
    // PROJECT SECTION
    // =====================================================

    projectSection: {
        marginTop: "28px",
        padding: "23px",
        borderRadius: "16px",
        background: "#ecfdf5",
        border: "1px solid #bbf7d0",
        display: "flex",
        alignItems: "center",
        gap: "18px",
    },

    projectIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        background: "#dcfce7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "26px",
        flexShrink: 0,
    },

    projectContent: {
        flex: 1,
    },

    projectLabel: {
        color: "#15803d",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1px",
    },

    projectTitle: {
        margin: "5px 0 0",
        color: "#14532d",
        fontSize: "17px",
    },

    projectText: {
        margin: "7px 0 0",
        color: "#166534",
        fontSize: "12px",
        lineHeight: "1.6",
        maxWidth: "800px",
    },

    projectBadge: {
        background: "#166534",
        color: "#ffffff",
        padding: "8px 12px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    footer: {
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "10px",
        padding: "25px 0 5px",
    },
};

export default Dashboard;