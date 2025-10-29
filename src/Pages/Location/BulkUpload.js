import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import { toast } from "react-toastify";
import {
  bulkUploadLocationServ,
  bulkDownloadLocationServ,
} from "../../services/location.services";

function BulkUploadPage() {
  const [formData, setFormData] = useState({
    type: "",
    locationType: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleReset = () => {
    setFormData({ type: "", locationType: "", file: null });
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.locationType || !formData.file) {
      toast.error("All fields are required.");
      return;
    }
    const uploadForm = new FormData();
    uploadForm.append("type", formData.type);
    uploadForm.append("locationType", formData.locationType);
    uploadForm.append("file", formData.file);

    try {
      const res = await bulkUploadLocationServ(uploadForm);
      toast.success(res.message || "Bulk upload successful");
      handleReset();
    } catch (err) {
      toast.error("Upload failed. " + (err?.response?.data?.message || ""));
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Location Management" selectedItem="Bulk Upload" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div className="infoCard mb-4 p-4 bg-light border rounded">
            <ul className="text-primary">
              <li>Read and follow instructions carefully while preparing data</li>
              <li>Download and save the sample file to reduce errors</li>
              <li>For adding bulk locations, file should be .csv or .xlsx format</li>
              <li className="fw-bold text-dark">
                Make sure you entered valid data as per instructions before proceeding
              </li>
            </ul>
          </div>

          <div className="card shadow p-4">
            <h4 className="mb-4">Bulk Upload</h4>
            <div className="">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">TYPE [UPLOAD/UPDATE]</label>
                <select
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="upload">Upload</option>
                  <option value="update">Update</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  LOCATION TYPE [STATES/CITIES]
                </label>
                <select
                  name="locationType"
                  className="form-control"
                  value={formData.locationType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="states">States</option>
                  <option value="cities">Cities</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">File</label>
                <input
                  type="file"
                  accept=".xlsx,.csv,.txt"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
              <div className="col-md-12 d-flex gap-2">
                <button className="btn btn-warning px-4" onClick={handleReset}>
                  Reset
                </button>
                <button className="btn btn-success px-4" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadPage;
