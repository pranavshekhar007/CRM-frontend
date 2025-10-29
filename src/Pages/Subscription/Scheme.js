import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getSchemeConfigServ,
  setSchemeConfigServ,
  updateSchemeConfigServ,
  deleteSchemeConfigServ,
} from "../../services/schemeConfig.services";
import { toast } from "react-toastify";
import moment from "moment";

function Scheme() {
  const [schemeConfig, setSchemeConfig] = useState(null);
  const [formData, setFormData] = useState({
    schemeStartMonth: "",
    schemeEndMonth: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchemeConfig = async () => {
    try {
      const res = await getSchemeConfigServ();
      if (res?.data?.statusCode === 200) {
        setSchemeConfig(res.data.data);
        setFormData({
          schemeStartMonth: moment(res.data.data.schemeStartDate).format("YYYY-MM"),
          schemeEndMonth: moment(res.data.data.schemeEndDate).format("YYYY-MM"),
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch scheme config"
      );
    }
  };

  useEffect(() => {
    fetchSchemeConfig();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Convert "YYYY-MM" to Date by adding "-01"
      const submitData = {
        schemeStartDate: new Date(formData.schemeStartMonth + "-01"),
        schemeEndDate: new Date(formData.schemeEndMonth + "-01"),
      };

      let res;
      if (schemeConfig?._id) {
        res = await updateSchemeConfigServ(schemeConfig._id, submitData);
      } else {
        res = await setSchemeConfigServ(submitData);
      }
      if (res?.data?.statusCode === 200) {
        toast.success(res.data.message);
        fetchSchemeConfig();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save scheme config"
      );
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete scheme config?"
    );
    if (confirmed) {
      try {
        const res = await deleteSchemeConfigServ(schemeConfig._id);
        if (res?.data?.statusCode === 200) {
          toast.success(res.data.message);
          setSchemeConfig(null);
          setFormData({
            schemeStartMonth: "",
            schemeEndMonth: "",
          });
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to delete scheme config"
        );
      }
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Subscription" selectedItem="Scheme" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="row mx-0 p-0">
            <div className="col-12">
              <h3 className="mb-4 text-bold text-secondary">Scheme Config</h3>

              <div className="card p-4 shadow-sm" style={{ maxWidth: "500px" }}>
                <label>Scheme Start Month</label>
                <input
                  className="form-control mb-3 border-primary shadow-sm"
                  type="month"
                  value={formData.schemeStartMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schemeStartMonth: e.target.value,
                    })
                  }
                  style={{ fontWeight: "500" }}
                />

                <label>Scheme End Month</label>
                <input
                  className="form-control mb-3 border-primary shadow-sm"
                  type="month"
                  value={formData.schemeEndMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schemeEndMonth: e.target.value,
                    })
                  }
                  style={{ fontWeight: "500" }}
                />

                <button
                  className="btn btn-success w-100 mb-2"
                  onClick={handleSubmit}
                  disabled={
                    !formData.schemeStartMonth ||
                    !formData.schemeEndMonth ||
                    isLoading
                  }
                >
                  {isLoading
                    ? "Saving..."
                    : schemeConfig
                    ? "Update Scheme Config"
                    : "Set Scheme Config"}
                </button>

                {schemeConfig && (
                  <button
                    className="btn btn-danger w-100"
                    onClick={handleDelete}
                  >
                    Delete Scheme Config
                  </button>
                )}
              </div>

              {schemeConfig && (
                <div className="mt-4">
                  <h5>Current Scheme Config:</h5>
                  <p>
                    <strong>Start Month:</strong>{" "}
                    {moment(schemeConfig.schemeStartDate).format("MMMM YYYY")}
                  </p>
                  <p>
                    <strong>End Month:</strong>{" "}
                    {moment(schemeConfig.schemeEndDate).format("MMMM YYYY")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scheme;
