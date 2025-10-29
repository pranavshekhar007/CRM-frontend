import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import Modal from "react-bootstrap/Modal";
import {
  addAreaServ,
  deleteAreaServ,
  getAreaByPincodeServ,
  getAreaServ,
  getCityByStateServ,
  getCityServ,
  getPincodeByCityServ,
  getPincodeServ,
  getStateServ,
  updateAreaServ,
} from "../../services/location.services";

function AreaList() {
  const [list, setList] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areasByPincode, setAreasByPincode] = useState([]);
  const [payload, setPayload] = useState({
    searchKey: "",
    stateId: "",
    pageNo: 1,
    pageCount: 10,
  });

  const [showSkelton, setShowSkelton] = useState(false);
  const [statics, setStatics] = useState(null);
  const [selectedCityMinimumPrice, setSelectedCityMinimumPrice] = useState("");
  const [addFormData, setAddFormData] = useState({
    name: "",
    stateId: "",
    cityId: "",
    pincodeId: "",
    minimumPrice: "",
    deliveryCharge: "",
    status: "",
    _id: "",
  });

  const handleGetArea = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      const res = await getAreaServ(payload);
      setList(res.data.data);
      setStatics(res.data.documentCount);
    } catch (error) {
      toast.error("Failed to load Area");
    }
    setShowSkelton(false);
  };

  const handleGetStates = async () => {
    try {
      const res = await getStateServ();
      setStates(res.data.data);
    } catch (error) {
      toast.error("Failed to load states");
    }
  };

  const handleGetCityByState = async (stateId) => {
    if (!stateId) return setCities([]);
    try {
      const res = await getCityByStateServ(stateId);
      setCities(res.data.data);
    } catch (error) {
      toast.error("Failed to load cities for selected state");
    }
  };

  const handleGetPincodeByCity = async (cityId) => {
    if (!cityId) return setPincodes([]);
    try {
      const res = await getPincodeByCityServ(cityId);
      setPincodes(res.data.data);
    } catch (error) {
      toast.error("Failed to load pincodes for selected city");
    }
  };

  const handleGetAreasByPincode = async (pincodeId) => {
    if (!pincodeId) return setAreasByPincode([]);
    try {
      const res = await getAreaByPincodeServ(pincodeId);
      if (res?.data?.statusCode === 200) {
        setAreasByPincode(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load areas for selected pincode");
    }
  };
  

  useEffect(() => {
    handleGetStates();
  }, []);

  useEffect(() => {
    handleGetArea();
  }, [payload]);

  const staticsArr = [
    {
      title: "Total Area",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active Area",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive Area",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];

  const [isLoading, setIsLoading] = useState(false);

  const handleAddAreaFunc = async () => {
    setIsLoading(true);
    try {
      const response = await addAreaServ(addFormData);
      if (response?.data?.statusCode === 200) {
        toast.success(response?.data?.message || "Area added successfully!");
        setAddFormData({
          name: "",
          stateId: "",
          cityId: "",
          pincodeId: "",
          minimumPrice: "",
          deliveryCharge: "",
          status: "",
          _id: "",
        });
        handleGetArea();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Server Error");
    }
    setIsLoading(false);
  };

  const handleDeleteArea = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Area?"
    );
    if (confirmed) {
      try {
        let response = await deleteAreaServ(id);
        if (response?.data?.statusCode == "200") {
          toast?.success(response?.data?.message);
          handleGetArea();
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message
            ? error?.response?.data?.message
            : "Internal Server Error"
        );
      }
    }
  };
  const [editFormData, setEditFormData] = useState({
    name: "",
    stateId: "",
    cityId: "",
    pincodeId: "",
    minimumPrice: "",
    deliveryCharge: "",
    status: "",
    _id: "",
  });
  const handleUpdateAreaFunc = async () => {
    setIsLoading(true);

    try {
      let response = await updateAreaServ(editFormData);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message || "Area updated successfully!");
        setEditFormData({
          name: "",
          stateId: "",
          cityId: "",
          pincodeId: "",
          minimumPrice: "",
          deliveryCharge: "",
          status: "",
          _id: "",
        });
        handleGetArea();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Internal Server Error"
      );
    }
    setIsLoading(false);
  };

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (statics?.totalCount && payload.pageCount) {
      const pages = Math.ceil(statics.totalCount / payload.pageCount);
      setTotalPages(pages);
    }
  }, [statics, payload.pageCount]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPayload({ ...payload, pageNo: newPage });
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Location Management" selectedItem="Area" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <div
            className="row mx-0 p-0"
            style={{
              position: "relative",
              top: "-75px",
              marginBottom: "-75px",
            }}
          >
            {staticsArr?.map((v, i) => {
              return (
                <div className="col-md-4 col-12 ">
                  <div className="topCard shadow-sm py-4 px-3 rounded mb-3">
                    <div className="d-flex align-items-center ">
                      <div
                        className="p-2 shadow rounded"
                        style={{ background: v?.bgColor }}
                      >
                        <img src="https://cdn-icons-png.flaticon.com/128/666/666120.png" />
                      </div>
                      <div className="ms-3">
                        <h6>{v?.title}</h6>
                        <h2 className="text-secondary">{v?.count}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row m-0 p-0 d-flex align-items-center my-4 topActionForm">
            <div className="col-lg-2 mb-2 col-md-12 col-12">
              <h3 className="mb-0 text-bold text-secondary">Area</h3>
            </div>
            <div className="col-lg-4 mb-2 col-md-12 col-12">
              <div>
                <input
                  className="form-control borderRadius24"
                  placeholder="Search"
                  value={payload.searchKey}
                  onChange={(e) =>
                    setPayload({
                      ...payload,
                      searchKey: e.target.value,
                      pageNo: 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="col-lg-3 mb-2  col-md-6 col-12">
              <div>
                <select
                  className="form-control borderRadius24"
                  onChange={(e) =>
                    setPayload({ ...payload, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <div>
                <button
                  className="btn btn-primary w-100 borderRadius24"
                  style={{ background: "#6777EF" }}
                  onClick={() => setAddFormData({ ...addFormData, show: true })}
                >
                  Add Area
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="card-body px-2">
              <div className="table-responsive table-invoice">
                <table className="table">
                  <tbody>
                    <tr style={{ background: "#F3F3F3", color: "#000" }}>
                      <th
                        className="text-center py-3"
                        style={{ borderRadius: "30px 0px 0px 30px" }}
                      >
                        Id
                      </th>

                      <th className="text-center py-3">Area Name</th>
                      <th className="text-center py-3">Minimum price</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Created At</th>
                      <th
                        className="text-center py-3 "
                        style={{ borderRadius: "0px 30px 30px 0px" }}
                      >
                        Action
                      </th>
                    </tr>
                    <div className="py-2"></div>
                    {showSkelton
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]?.map((v, i) => {
                          return (
                            <>
                              <tr key={i}>
                                <td className="text-center">
                                  <Skeleton width={50} height={50} />
                                </td>
                                <td className="text-center">
                                  <Skeleton
                                    width={50}
                                    height={50}
                                    borderRadius={25}
                                  />
                                </td>
                                <td className="text-center">
                                  <Skeleton width={100} height={25} />
                                </td>
                                <td className="text-center">
                                  <Skeleton width={100} height={25} />
                                </td>
                                <td className="text-center">
                                  <Skeleton width={100} height={25} />
                                </td>
                                <td className="text-center">
                                  <Skeleton width={100} height={25} />
                                </td>
                              </tr>
                              <div className="py-2"></div>
                            </>
                          );
                        })
                      : list?.map((v, i) => {
                          return (
                            <>
                              <tr>
                                <td className="text-center">{v?.areaId}</td>

                                <td className="font-weight-600 text-center">
                                  {v?.name}
                                </td>
                                <td className="font-weight-600 text-center">
                                  {v?.minimumPrice}
                                </td>
                                <td className="text-center">
                                  {v?.status ? (
                                    <div
                                      className="badge py-2"
                                      style={{ background: "#63ED7A" }}
                                    >
                                      Active
                                    </div>
                                  ) : (
                                    <div
                                      className="badge py-2 "
                                      style={{ background: "#FFA426" }}
                                    >
                                      Inactive
                                    </div>
                                  )}
                                </td>

                                <td className="text-center">
                                  {moment(v?.createdAt).format("DD-MM-YY")}
                                </td>
                                <td className="text-center">
                                  <a
                                    onClick={ async () => {
                                      setEditFormData({
                                        name: v?.name,
                                        cityId: v?.cityId || "",
                                        stateId: v?.stateId || "",
                                        pincodeId: v?.pincodeId || "",
                                        minimumPrice: v?.minimumPrice || "",
                                        deliveryCharge: v?.deliveryCharge || "",
                                        status: v?.status,
                                        _id: v?._id,
                                        
                                      });
                                      if (v?.stateId) {
                                        await handleGetCityByState(v.stateId);
                                      }
                                  
                                      if (v?.cityId) {
                                        await handleGetPincodeByCity(v.cityId);
                                      }
                                    }}
                                    className="btn btn-info mx-2 text-light shadow-sm"
                                  >
                                    Edit
                                  </a>
                                  <a
                                    onClick={() => handleDeleteArea(v?._id)}
                                    className="btn btn-warning mx-2 text-light shadow-sm"
                                  >
                                    Delete
                                  </a>
                                </td>
                              </tr>
                            </>
                          );
                        })}
                  </tbody>
                </table>

                <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-5 px-3 py-3 mt-4">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-secondary">Show</span>
                    <select
                      className="form-select form-select-sm custom-select"
                      value={payload.pageCount}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          pageCount: parseInt(e.target.value),
                          pageNo: 1,
                        })
                      }
                    >
                      {[10, 25, 50, 100].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <nav>
                    <ul className="pagination pagination-sm mb-0 custom-pagination">
                      <li
                        className={`page-item ${
                          payload.pageNo === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(payload.pageNo - 1)}
                        >
                          &lt;
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= payload.pageNo - 1 &&
                            page <= payload.pageNo + 1)
                        ) {
                          return (
                            <li
                              key={page}
                              className={`page-item ${
                                payload.pageNo === page ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        } else if (
                          (page === payload.pageNo - 2 && page > 2) ||
                          (page === payload.pageNo + 2 && page < totalPages - 1)
                        ) {
                          return (
                            <li key={page} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}

                      <li
                        className={`page-item ${
                          payload.pageNo === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(payload.pageNo + 1)}
                        >
                          &gt;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>

                {list.length == 0 && !showSkelton && <NoRecordFound />}
              </div>
            </div>
          </div>
        </div>
      </div>
      {addFormData?.show && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                background: "#f7f7f5",
                width: "364px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: "20px", cursor: "pointer" }}
                  onClick={() =>
                    setAddFormData({
                      name: "",
                      stateId: "",
                      cityId: "",
                      pincodeId: "",
                      minimumPrice: "",
                      deliveryCharge: "",
                      status: "",
                      show: false,
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-center w-100">
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Add Area</h5>

                    <label className="mt-3">Area Name</label>
                    <input
                      className="form-control"
                      type="text"
                      value={addFormData.name}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />

                    <label className="mt-3">State</label>
                    <select
                      className="form-control"
                      value={addFormData.stateId}
                      onChange={async (e) => {
                        const stateId = e.target.value;
                        setAddFormData({
                          ...addFormData,
                          stateId: stateId,
                          city: "",
                          pincode: "",
                        });
                        await handleGetCityByState(stateId);
                        setPincodes([]);
                      }}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.stateId} value={state.stateId}>
                          {state.name}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3">City</label>
                    <select
                      className="form-control"
                      value={addFormData.cityId}
                      onChange={async (e) => {
                        const cityId = e.target.value;

                        // Find selected city from state
                        const selectedCity = cities.find(
                          (city) => city.cityId === parseInt(cityId)
                        );

                        setAddFormData({
                          ...addFormData,
                          cityId: cityId,
                          minimumPrice: selectedCity
                            ? selectedCity.minimumPrice
                            : "",
                          pincode: "",
                        });

                        setSelectedCityMinimumPrice(
                          selectedCity ? selectedCity.minimumPrice : ""
                        );

                        await handleGetPincodeByCity(cityId);
                      }}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.cityId} value={city.cityId}>
                          {city.name}
                        </option>
                      ))}
                    </select>

                    {selectedCityMinimumPrice !== "" && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Minimum Price for this city: ₹
                          {selectedCityMinimumPrice}
                        </small>
                      </div>
                    )}

                    <label className="mt-3">Pin Code</label>
                    <select
                      className="form-control"
                      value={addFormData.pincodeId}
                      onChange={async (e) => {
                        const pincodeId = e.target.value;
                        setAddFormData({
                          ...addFormData,
                          pincodeId: pincodeId,
                        });
                        await handleGetAreasByPincode(pincodeId);
                      }}
                    >
                      <option value="">Select Pincode</option>
                      {pincodes.map((pincode) => (
                        <option
                          key={pincode.pincodeId}
                          value={pincode.pincodeId}
                        >
                          {pincode.pincode}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
                      value={addFormData.status}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Status</option>
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>

                    {/* <label className="mt-3">Minimum Price</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={addFormData.minimumPrice}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          minimumPrice: e.target.value,
                        })
                      }
                    /> */}

                    <label className="mt-3">Delivery Charge</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={addFormData.deliveryCharge}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          deliveryCharge: e.target.value,
                        })
                      }
                    />

                    <button
                      className="btn btn-success w-100 mt-4"
                      onClick={
                        addFormData.name &&
                        addFormData?.stateId &&
                        addFormData?.cityId &&
                        addFormData?.pincodeId &&
                        // addFormData?.minimumPrice &&
                        addFormData?.deliveryCharge &&
                        !isLoading
                          ? handleAddAreaFunc
                          : undefined
                      }
                      disabled={
                        !addFormData.name ||
                        !addFormData?.stateId ||
                        !addFormData?.cityId ||
                        !addFormData?.pincodeId ||
                        // !addFormData?.minimumPrice ||
                        !addFormData?.deliveryCharge ||
                        isLoading
                      }
                      style={{
                        opacity:
                          !addFormData.name ||
                          !addFormData?.stateId ||
                          !addFormData?.cityId ||
                          !addFormData?.pincodeId ||
                          // !addFormData?.minimumPrice ||
                          !addFormData?.deliveryCharge ||
                          isLoading
                            ? "0.5"
                            : "1",
                      }}
                    >
                      {isLoading ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {addFormData?.show && <div className="modal-backdrop fade show"></div>}

      {editFormData?._id && (
        <div
          className="modal fade show d-flex align-items-center justify-content-center"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                background: "#f7f7f5",
                width: "364px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: "20px", cursor: "pointer" }}
                  onClick={() =>
                    setEditFormData({
                      name: "",
                      stateId: "",
                      cityId: "",
                      pincodeId: "",
                      minimumPrice: "",
                      deliveryCharge: "",
                      status: "",
                      _id: "",
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-center w-100">
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Update Area</h5>

                    <label className="mt-3">Area Name</label>
                    <input
                      className="form-control"
                      type="text"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      value={editFormData?.name}
                    />

                    <label className="mt-3">State</label>
                    <select
                      className="form-control"
                      value={editFormData.stateId}
                      onChange={async (e) => {
                        const stateId = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          stateId: stateId,
                          city: "",
                          pincode: "",
                        });
                        await handleGetCityByState(stateId);
                        setPincodes([]);
                      }}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.stateId} value={state.stateId}>
                          {state.name}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3">City</label>
                    <select
                      className="form-control"
                      value={editFormData.cityId}
                      onChange={async (e) => {
                        const cityId = e.target.value;

                        // Find selected city from state
                        const selectedCity = cities.find(
                          (city) => city.cityId === parseInt(cityId)
                        );

                        setEditFormData({
                          ...editFormData,
                          cityId: cityId,
                          minimumPrice: selectedCity
                            ? selectedCity.minimumPrice
                            : "",
                          pincode: "",
                        });

                        setSelectedCityMinimumPrice(
                          selectedCity ? selectedCity.minimumPrice : ""
                        );

                        await handleGetPincodeByCity(cityId);
                      }}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.cityId} value={city.cityId}>
                          {city.name}
                        </option>
                      ))}
                    </select>

                    {selectedCityMinimumPrice !== "" && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Minimum Price for this city: ₹
                          {selectedCityMinimumPrice}
                        </small>
                      </div>
                    )}

                    <label className="mt-3">Pincode</label>
                    <select
                      className="form-control"
                      value={editFormData.pincodeId}
                      onChange={async (e) => {
                        const pincodeId = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          pincodeId: pincodeId,
                        });
                        await handleGetAreasByPincode(pincodeId);
                      }}
                    >
                      <option value="">Select Pincode</option>
                      {pincodes.map((pincode) => (
                        <option
                          key={pincode.pincodeId}
                          value={pincode.pincodeId}
                        >
                          {pincode.pincode}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value,
                        })
                      }
                      value={editFormData?.status}
                    >
                      <option value="">Select Status</option>
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>

                    {/* <label className="mt-3">Minimum Price</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          minimumPrice: e.target.value,
                        })
                      }
                      value={editFormData?.minimumPrice}
                    /> */}

                    <label className="mt-3">Delivery Charge</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          deliveryCharge: e.target.value,
                        })
                      }
                      value={editFormData?.deliveryCharge}
                    />

                    {editFormData?.name &&
                    editFormData?.stateId &&
                    editFormData?.cityId &&
                    editFormData?.pincodeId &&
                    // editFormData?.minimumPrice &&
                    editFormData?.deliveryCharge ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && handleUpdateAreaFunc}
                      >
                        {isLoading ? "Saving..." : "Submit"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-100 mt-4"
                        style={{ opacity: "0.5" }}
                        disabled
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editFormData?._id && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default AreaList;
