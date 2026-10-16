import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProvisionDashboard.css";

function ProvisionDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMaterial, setShowAddMaterial] = useState(false);

  const [materialForm, setMaterialForm] = useState({
    name: "",
    description: "",
    available_quantity: "",
    unit: "units",
  });

  const [materialMessage, setMaterialMessage] = useState("");
  const [materialError, setMaterialError] = useState("");
  const [addingMaterial, setAddingMaterial] = useState(false);

  // Update Stock state
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [stockError, setStockError] = useState("");

  const [processingRequest, setProcessingRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");


  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      const response = await api.get(
        "/provision/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);
    } catch (err) {
      console.error("Provision dashboard error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Only provision users can access this dashboard."
        );
      } else {
        setError("Failed to load provision dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "provision-status-approved";
    }

    if (status === "rejected") {
      return "provision-status-rejected";
    }

    return "provision-status-pending";
  };

  const handleMaterialChange = (e) => {
    setMaterialForm({
      ...materialForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    setMaterialMessage("");
    setMaterialError("");

    if (
      !materialForm.name ||
      !materialForm.available_quantity ||
      !materialForm.unit
    ) {
      setMaterialError("Please fill all required fields.");
      return;
    }

    if (Number(materialForm.available_quantity) < 0) {
      setMaterialError("Quantity cannot be negative.");
      return;
    }

    try {
      setAddingMaterial(true);

      const token = localStorage.getItem("access");

      const response = await api.post(
        "/provision/materials/",
        {
          name: materialForm.name,
          description: materialForm.description,
          available_quantity: Number(
            materialForm.available_quantity
          ),
          unit: materialForm.unit,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMaterialMessage(
        response.data.message || "Material added successfully."
      );

      setMaterialForm({
        name: "",
        description: "",
        available_quantity: "",
        unit: "units",
      });

      setShowAddMaterial(false);

      await fetchDashboard();
    } catch (err) {
      console.error("Add material error:", err);

      if (err.response?.status === 401) {
        setMaterialError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setMaterialError(
          "Access denied. Only provision users can add materials."
        );
      } else {
        setMaterialError(
          err.response?.data?.error ||
            "Failed to add material."
        );
      }
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleUpdateStock = async (material) => {
  if (newStock === "" || Number(newStock) < 0) {
    setStockError("Please enter a valid stock quantity.");
    return;
  }

  try {
    setUpdatingStock(true);
    setStockError("");
    setStockMessage("");

    const token = localStorage.getItem("access");

    const response = await api.put(
      `/provision/materials/${material.id}/`,
      {
        available_quantity: Number(newStock),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStockMessage(
      response.data.message || "Stock updated successfully."
    );

    setEditingMaterial(null);
    setNewStock("");

    await fetchDashboard();

  } catch (err) {
    console.error("Update stock error:", err);

    if (err.response?.status === 401) {
      setStockError("Session expired. Please login again.");
    } else if (err.response?.status === 403) {
      setStockError(
        "Access denied. Only provision users can update stock."
      );
    } else {
      setStockError(
        err.response?.data?.error ||
        "Failed to update stock."
      );
    }
  } finally {
    setUpdatingStock(false);
  }
};
  

const handleRequestAction = async (requestId, action) => {
  try {
    setProcessingRequest(requestId);
    setRequestMessage("");
    setRequestError("");

    const token = localStorage.getItem("access");

    const response = await api.post(
      `/provision/requests/${requestId}/${action}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRequestMessage(
      response.data.message ||
        `Request ${action} successfully.`
    );

    await fetchDashboard();

  } catch (err) {
    console.error("Request action error:", err);

    if (err.response?.status === 401) {
      setRequestError(
        "Session expired. Please login again."
      );
    } else if (err.response?.status === 403) {
      setRequestError(
        "Only provision users can manage requests."
      );
    } else {
      setRequestError(
        err.response?.data?.error ||
          "Failed to process request."
      );
    }
  } finally {
    setProcessingRequest(null);
  }
};

  if (loading) {
    return (
      <div className="provision-loading">
        Loading Provision Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="provision-page">
        <div className="provision-error">
          {error}
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const materials = dashboard?.materials || [];
  const requests = dashboard?.requests || [];

  return (
    <div className="provision-page">

      {/* Header */}

      <div className="provision-header">

        <div>
          <h1>Provision Dashboard</h1>

          <p>
            Monitor material inventory and contractor requests.
          </p>
        </div>

        <div className="provision-header-actions">

          <button
            className="provision-add-button"
            onClick={() => {
              setShowAddMaterial(!showAddMaterial);
              setMaterialMessage("");
              setMaterialError("");
            }}
          >
            {showAddMaterial
              ? "✕ Close"
              : "+ Add Material"}
          </button>

          <button
            className="provision-refresh"
            onClick={fetchDashboard}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* Add Material Form */}

      {showAddMaterial && (
        <div className="add-material-card">

          <h2>Add New Material</h2>

          <p>
            Add a new material and its available stock
            to the inventory.
          </p>

          {materialMessage && (
            <div className="material-success">
              {materialMessage}
            </div>
          )}

          {materialError && (
            <div className="material-error">
              {materialError}
            </div>
          )}

          <form onSubmit={handleAddMaterial}>

            <div className="add-material-grid">

              <div className="material-form-group">

                <label>Material Name *</label>

                <input
                  type="text"
                  name="name"
                  value={materialForm.name}
                  onChange={handleMaterialChange}
                  placeholder="e.g. Diesel"
                  required
                />

              </div>

              <div className="material-form-group">

                <label>Available Quantity *</label>

                <input
                  type="number"
                  step="any"
                  min="0"
                  name="available_quantity"
                  value={materialForm.available_quantity}
                  onChange={handleMaterialChange}
                  placeholder="e.g. 5000"
                  required
                />

              </div>

              <div className="material-form-group">

                <label>Unit *</label>

                <select
                  name="unit"
                  value={materialForm.unit}
                  onChange={handleMaterialChange}
                >
                  <option value="units">Units</option>
                  <option value="litres">Litres</option>
                  <option value="kg">Kg</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="boxes">Boxes</option>
                  <option value="pieces">Pieces</option>
                </select>

              </div>

              <div className="material-form-group material-description">

                <label>Description</label>

                <textarea
                  name="description"
                  value={materialForm.description}
                  onChange={handleMaterialChange}
                  placeholder="Enter material description"
                  rows="3"
                />

              </div>

            </div>

            <button
              type="submit"
              className="save-material-button"
              disabled={addingMaterial}
            >
              {addingMaterial
                ? "Adding Material..."
                : "Add Material"}
            </button>

          </form>

        </div>
      )}

      {/* KPI Cards */}

      <div className="provision-kpi-grid">

        <div className="provision-kpi-card">
          <span>Total Materials</span>
          <strong>
            {summary.total_materials || 0}
          </strong>
        </div>

        <div className="provision-kpi-card">
          <span>Total Available Stock</span>

          <strong>
            {Number(
              summary.total_stock || 0
            ).toFixed(2)}
          </strong>
        </div>

        <div className="provision-kpi-card">
          <span>Pending Requests</span>

          <strong>
            {summary.pending_requests || 0}
          </strong>
        </div>

        <div className="provision-kpi-card">
          <span>Approved Requests</span>

          <strong>
            {summary.approved_requests || 0}
          </strong>
        </div>

        <div className="provision-kpi-card">
          <span>Rejected Requests</span>

          <strong>
            {summary.rejected_requests || 0}
          </strong>
        </div>

      </div>

      {stockMessage && (
        <div className="material-success">
          {stockMessage}
        </div>
      )}

      {stockError && (
        <div className="material-error">
          {stockError}
        </div>
      )}

      {/* Inventory */}

      <div className="provision-section">

        <div className="provision-section-title">

          <div>

            <h2>Inventory Overview</h2>

            <p>
              Current available material stock.
            </p>

          </div>

        </div>

        {materials.length === 0 ? (

          <div className="provision-empty">
            No materials available.
          </div>

        ) : (

          <div className="provision-material-grid">

            {materials.map((material) => (
              <div
                className="provision-material-card"
                key={material.id}
              >
                <div className="material-card-top">
                  <h3>{material.name}</h3>

                  <span className="stock-badge">
                    In Stock
                  </span>
                </div>

                <p>
                  {material.description ||
                    "No description available."}
                </p>

                <div className="material-stock">
                  <strong>
                    {Number(
                      material.available_quantity
                    ).toFixed(2)}
                  </strong>

                  <span>
                    {material.unit}
                  </span>
                </div>

                {editingMaterial === material.id ? (
                  <div className="stock-edit-box">
                    <label>New Stock Quantity</label>

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newStock}
                      onChange={(e) =>
                        setNewStock(e.target.value)
                      }
                      placeholder="Enter new quantity"
                    />

                    <div className="stock-edit-actions">
                      <button
                        type="button"
                        className="save-stock-button"
                        onClick={() =>
                          handleUpdateStock(material)
                        }
                        disabled={updatingStock}
                      >
                        {updatingStock
                          ? "Updating..."
                          : "Update Stock"}
                      </button>

                      <button
                        type="button"
                        className="cancel-stock-button"
                        onClick={() => {
                          setEditingMaterial(null);
                          setNewStock("");
                          setStockError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="update-stock-button"
                    onClick={() => {
                      setEditingMaterial(material.id);
                      setNewStock(
                        material.available_quantity
                      );
                      setStockMessage("");
                      setStockError("");
                    }}
                  >
                    ✏️ Update Stock
                  </button>
                )}
              </div>
            ))}

          </div>

        )}

      </div>

      {requestMessage && (
  <div className="material-success">
    {requestMessage}
  </div>
)}

{requestError && (
  <div className="material-error">
    {requestError}
  </div>
)}

      {/* Contractor Requests */}

      <div className="provision-section">

        <div className="provision-section-title">

          <div>

            <h2>
              Contractor Material Requests
            </h2>

            <p>
              Monitor submitted contractor
              material requests.
            </p>

          </div>

        </div>

        {requests.length === 0 ? (

          <div className="provision-empty">
            No material requests available.
          </div>

        ) : (

          <div className="provision-table-wrapper">

            <table className="provision-table">

              <thead>

                <th>Contractor</th>
<th>Material</th>
<th>Quantity</th>
<th>Unit</th>
<th>Status</th>
<th>Requested Date</th>
<th>Actions</th>

              </thead>

              <tbody>

                {requests.map((request) => (

                  <tr key={request.id}>

                    <td>
                      {request.contractor}
                    </td>

                    <td>
                      <strong>
                        {request.material}
                      </strong>
                    </td>

                    <td>
                      {request.quantity}
                    </td>

                    <td>
                      {request.unit}
                    </td>

                    <td>

                      <span
                        className={`provision-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>

                    </td>

                    <td>
                      {new Date(
                        request.requested_at
                      ).toLocaleDateString()}
                    </td>

                    <td>
  {request.status === "pending" ? (
    <div className="request-action-buttons">

      <button
        className="approve-request-button"
        onClick={() =>
          handleRequestAction(
            request.id,
            "approve"
          )
        }
        disabled={
          processingRequest === request.id
        }
      >
        {processingRequest === request.id
          ? "Processing..."
          : "✓ Approve"}
      </button>

      <button
        className="reject-request-button"
        onClick={() =>
          handleRequestAction(
            request.id,
            "reject"
          )
        }
        disabled={
          processingRequest === request.id
        }
      >
        ✕ Reject
      </button>

    </div>
  ) : (
    <span className="action-completed">
      Completed
    </span>
  )}
</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ProvisionDashboard;