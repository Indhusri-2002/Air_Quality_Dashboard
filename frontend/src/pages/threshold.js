import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faPlus,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ThresholdForm from "@/components/thresholdForm";
import Image from "next/image";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

// Fetch cities and weather conditions from environment variables
const cities = process.env.CITIES.split(",");
const weatherConditions = process.env.WEATHER_CONDITIONS.split(",");

const ThresholdManagement = () => {
  const [thresholds, setThresholds] = useState([]);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [newThreshold, setNewThreshold] = useState({
    city: "",
    temperatureThreshold: "",
    email: "",
    weatherCondition: "",
    unit: "Celsius",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/weather/thresholds`);
      setThresholds(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch thresholds", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0a48b2",
      cancelButtonColor: "#f81b1b",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BACKEND_API_URL}/weather/threshold/${id}`);
          Swal.fire("Success", "Threshold deleted successfully!", "success");
          fetchThresholds();
        } catch (error) {
          Swal.fire("Error", "Failed to delete threshold", "error");
        }
      }
    });
  };

  const handleEdit = (threshold) => {
    setEditingThreshold(threshold);
    setNewThreshold({
      city: threshold.city,
      temperatureThreshold: threshold.temperatureThreshold,
      email: threshold.email,
      weatherCondition: threshold.weatherCondition || "",
      unit: "Celsius",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      let tempInCelsius = newThreshold.temperatureThreshold;
      if (newThreshold.unit === "Kelvin") {
        tempInCelsius = newThreshold.temperatureThreshold - 273.15;
      }

      await axios.patch(
        `${BACKEND_API_URL}/weather/threshold/${editingThreshold._id}`,
        {
          ...newThreshold,
          temperatureThreshold: tempInCelsius,
        }
      );

      Swal.fire("Success", "Threshold updated successfully!", "success");
      setEditingThreshold(null);
      setIsEditModalOpen(false);
      fetchThresholds();
    } catch (error) {
      Swal.fire("Error", "Failed to update threshold", "error");
    }
  };

  const handleCreate = async () => {
    try {
      let tempInCelsius = newThreshold.temperatureThreshold;
      if (newThreshold.unit === "Kelvin") {
        tempInCelsius = newThreshold.temperatureThreshold - 273.15;
      }

      await axios.post(`${BACKEND_API_URL}/weather/threshold`, {
        ...newThreshold,
        temperatureThreshold: tempInCelsius,
      });

      Swal.fire("Success", "Threshold created successfully!", "success");
      setNewThreshold({
        city: "",
        temperatureThreshold: "",
        email: "",
        weatherCondition: "",
        unit: "Celsius",
      });
      setIsModalOpen(false);
      fetchThresholds();
    } catch (error) {
      if (
        error.response &&
        error.response.data.message.includes("already exists")
      ) {
        // Show error for duplicate threshold
        Swal.fire(
          "Error",
          "A threshold with the same city, temperature, and email already exists.",
          "error"
        );
      } else {
        // Show a generic error if something else went wrong
        Swal.fire("Error", "Failed to create threshold", "error");
      }
    }
  };

  return (
    <div className="d-flex flex-column align-items-center m-5 p-2">
      <div className="d-flex flex-row justify-content-between align-items-center w-100 px-4 mb-5">
        <div className="d-flex flex-row align-items-center">
          <Image
            src={`/WeatherAlert.png`}
            alt="alert icon"
            width={50}
            height={50}
            className="me-3"
          />
          <div style={{ fontWeight: "400", fontSize: 38 }}>
            Manage Weather Alert Thresholds
          </div>
        </div>

        {/* Button to create new threshold */}
        <button
          className="create-buton p-2 rounded shadow"
          onClick={() => {
            setIsModalOpen(true);
            setNewThreshold({
              city: "",
              temperatureThreshold: "",
              email: "",
              weatherCondition: "",
              unit: "Celsius",
            });
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Create Threshold
        </button>
      </div>

      {/* Flex container for thresholds */}
      <div className="container">
        <div className="row">
          {thresholds.map((threshold) => (
            <div className="col-md-4 mb-4" key={threshold._id}>
              <div className="card border-0 rounded shadow p-4 h-100">
                <div>
                  <div
                    style={{ fontSize: 20, fontWeight: 500 }}
                    className="d-flex flex-row justify-content-between mb-4"
                  >
                    {threshold.city}
                    <div>
                      <button
                        className="edit-delete-button mr-3"
                        style={{ color: "#0a48b2" }}
                        onClick={() => handleEdit(threshold)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="edit-delete-button"
                        style={{ color: "#f81b1b" }}
                        onClick={() => handleDelete(threshold._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <div style={{ lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 500, marginRight: "3%" }}>
                      Temperature Threshold:
                    </span>{" "}
                    {threshold.temperatureThreshold}°C
                    <br />
                    <span style={{ fontWeight: 500, marginRight: "3%" }}>
                      Email:
                    </span>{" "}
                    {threshold.email}
                    <br />
                    <span style={{ fontWeight: 500, marginRight: "3%" }}>
                      Weather Condition:
                    </span>
                    {threshold.weatherCondition || "None"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Threshold Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Threshold</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                >
                  {/* Same form as edit */}
                  <ThresholdForm
                    newThreshold={newThreshold}
                    setNewThreshold={setNewThreshold}
                    cities={cities}
                    weatherConditions={weatherConditions}
                  />
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleCreate}
                >
                  <FontAwesomeIcon icon={faSave} /> Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Threshold Modal */}
      {isEditModalOpen && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Threshold for {editingThreshold.city}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate();
                  }}
                >
                  <ThresholdForm
                    newThreshold={newThreshold}
                    setNewThreshold={setNewThreshold}
                    cities={cities}
                    weatherConditions={weatherConditions}
                  />
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleUpdate}
                >
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .create-buton {
          color: #000;
          background: linear-gradient(120deg, #87b1f6 0%, #a1dcf7 100%);
          border: none;
          cursor: pointer;
          transition: ease 0.4s;
        }
        .create-buton:hover {
          transform: scale(1.2);
        }
        .edit-delete-button {
          color: inherit;
          background-color: transparent;
          border: none;
          cursor: pointer;
          transition: ease 0.4s;
        }
        .edit-delete-button:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default ThresholdManagement;
