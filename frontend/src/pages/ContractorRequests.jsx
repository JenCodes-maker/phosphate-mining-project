import { useEffect, useState } from "react";
import api from "../services/api";
import "./ContractorRequests.css";

function ContractorRequests() {
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [materialsResponse, requestsResponse] = await Promise.all([
        api.get("/contractor/materials/", { headers }),
        api.get("/contractor/requests/", { headers }),
      ]);

      setMaterials(materialsResponse.data);
      setRequests(requestsResponse.data);
    } catch (err) {
      console.error("Failed to load contractor data:", err);

      if (err.response?.status === 401) {
    setError("Session expired. Please login again.");
} else if (err.response?.status === 403) {
    setError(
        "Access denied. Only contractor users can access this page."
    );
} else {
    setError("Failed to load materials and requests.");
}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedMaterial || !quantity) {
      setError("Please select a material and enter quantity.");
      return;
    }

    if (Number(quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("access");

      await api.post(
        "/contractor/requests/",
        {
          material: Number(selectedMaterial),
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Material request submitted successfully! ✅");

      setSelectedMaterial("");
      setQuantity("");

      fetchData();
    } catch (err) {
      console.error("Request submission error:", err);

      if (err.response?.status === 401) {
    setError("Session expired. Please login again.");
} else if (err.response?.status === 403) {
    setError(
        "Access denied. Only contractor users can submit requests."
    );
} else {
    setError(
        err.response?.data?.error ||
        "Failed to submit material request."
    );
}
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "status-approved";
    if (status === "rejected") return "status-rejected";
    return "status-pending";
  };

  return (
    <div className="contractor-request-container">

      <div className="contractor-request-header">
        <div>
          <h1>Material Request</h1>
          <p>
            Request materials required for mining operations.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchData}
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="request-layout">

        {/* Request Form */}
        <div className="request-card">

          <h2>Request Material</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>Select Material</label>

              <select
                value={selectedMaterial}
                onChange={(e) =>
                  setSelectedMaterial(e.target.value)
                }
                required
              >
                <option value="">
                  -- Select Material --
                </option>

                {materials.map((material) => (
                  <option
                    key={material.id}
                    value={material.id}
                  >
                    {material.name} (
                    {material.available_quantity}{" "}
                    {material.unit})
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">

              <label>Quantity</label>

              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter required quantity"
                required
              />

            </div>

            <button
              type="submit"
              className="submit-request-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Request"}
            </button>

          </form>

        </div>

        {/* Available Materials */}
        <div className="materials-card">

          <h2>Available Materials</h2>

          {loading ? (
            <p>Loading materials...</p>
          ) : materials.length === 0 ? (
            <p>No materials available.</p>
          ) : (
            <div className="materials-grid">

              {materials.map((material) => (
                <div
                  className="material-item"
                  key={material.id}
                >
                  <h3>{material.name}</h3>

                  <p>
                    {material.description ||
                      "No description available"}
                  </p>

                  <strong>
                    {material.available_quantity}{" "}
                    {material.unit}
                  </strong>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* Request History */}
      <div className="requests-history-card">

        <h2>My Material Requests</h2>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>No material requests yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                </tr>
              </thead>

              <tbody>

                {requests.map((request) => {

                  const material = materials.find(
                    (item) =>
                      item.id === request.material
                  );

                  return (
                    <tr key={request.id}>

                      <td>
                        {request.material_name}
                      </td>

                      <td>
                        {request.quantity}
                      </td>

                      <td>
                        {material?.unit || "-"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
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

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default ContractorRequests;