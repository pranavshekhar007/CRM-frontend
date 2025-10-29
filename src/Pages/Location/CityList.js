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
  addCityServ,
  bulkDeleteCityServ,
  deleteCityServ,
  getCityServ,
  getStateServ,
  updateCityServ,
} from "../../services/location.services";

function CityList() {
  const [list, setList] = useState([]);
  const [states, setStates] = useState([]);
  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    stateId: "",
    pageNo: 1,
    pageCount: 10,
  });

  const [showSkelton, setShowSkelton] = useState(false);
  const [statics, setStatics] = useState(null);
  const [addFormData, setAddFormData] = useState({
    name: "",
    stateId: "",
    status: "",
    minimumPrice: "",
    freeDeliveryLimit: "",
    payDeliveryInAdvance: false,
    deliveryOptionAvailable: [],
    deliveryCharge: "",
    _id: "",
  });

  const handleGetCities = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      const res = await getCityServ(payload);
      setList(res.data.data);
      setStatics(res.data.documentCount);
    } catch (error) {
      toast.error("Failed to load cities");
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

  useEffect(() => {
    handleGetStates();
  }, []);

  useEffect(() => {
    handleGetCities();
  }, [payload]);

  const staticsArr = [
    {
      title: "Total City",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active City",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive City",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];

  const [isLoading, setIsLoading] = useState(false);

  const handleAddCityFunc = async () => {
    setIsLoading(true);
    try {
      const payloadToSend = {
        name: String(addFormData.name).trim(),
        stateId: Number(addFormData.stateId),
        status:
          addFormData.status === true || addFormData.status === "true"
            ? true
            : addFormData.status === false || addFormData.status === "false"
            ? false
            : true, // default to active if empty
        minimumPrice: Number(addFormData.minimumPrice),
        deliveryCharge: Number(addFormData.deliveryCharge),
        freeDeliveryLimit:
          addFormData.freeDeliveryLimit === "" ||
          addFormData.freeDeliveryLimit === undefined
            ? 0
            : Number(addFormData.freeDeliveryLimit),
        payDeliveryInAdvance: Boolean(addFormData.payDeliveryInAdvance),
        deliveryOptionAvailable: addFormData.deliveryOptionAvailable?.length
          ? addFormData.deliveryOptionAvailable
          : ["lorryPay"],
      };

      const response = await addCityServ(payloadToSend);
      if (response?.data?.statusCode === 200) {
        toast.success(response?.data?.message || "City added successfully!");
        setAddFormData({
          name: "",
          stateId: "",
          status: "",
          minimumPrice: "",
          deliveryCharge: "",
          freeDeliveryLimit: "", // reset
          payDeliveryInAdvance: false, // reset
          deliveryOptionAvailable: [],
          _id: "",
          show: false,
        });
        handleGetCities();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCity = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this city?"
    );
    if (confirmed) {
      try {
        let response = await deleteCityServ(id);
        if (response?.data?.statusCode == "200") {
          toast?.success(response?.data?.message);
          handleGetCities();
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
    status: "",
    minimumPrice: "",
    deliveryCharge: "",
    freeDeliveryLimit: "",
    payDeliveryInAdvance: false,
    deliveryOptionAvailable: [],
    _id: "",
  });
  const handleUpdateCityFunc = async () => {
    setIsLoading(true);
    try {
      const payloadToSend = {
        _id: editFormData._id,
        name: String(editFormData.name).trim(),
        stateId: Number(editFormData.stateId),
        status:
          editFormData.status === true || editFormData.status === "true"
            ? true
            : editFormData.status === false || editFormData.status === "false"
            ? false
            : undefined, // don't send if not set
        minimumPrice:
          editFormData.minimumPrice === ""
            ? undefined
            : Number(editFormData.minimumPrice),
        deliveryCharge:
          editFormData.deliveryCharge === ""
            ? undefined
            : Number(editFormData.deliveryCharge),
        freeDeliveryLimit:
          editFormData.freeDeliveryLimit === ""
            ? 0
            : Number(editFormData.freeDeliveryLimit),
        payDeliveryInAdvance: Boolean(editFormData.payDeliveryInAdvance),
        deliveryOptionAvailable: editFormData.deliveryOptionAvailable?.length
          ? editFormData.deliveryOptionAvailable
          : ["lorryPay"],
      };

      const response = await updateCityServ(payloadToSend);
      if (
        response?.data?.statusCode == "200" ||
        response?.data?.statusCode === 200
      ) {
        toast.success(response?.data?.message || "City updated successfully!");
        setEditFormData({
          name: "",
          stateId: "",
          status: "",
          minimumPrice: "",
          deliveryCharge: "",
          freeDeliveryLimit: "",
          payDeliveryInAdvance: false,
          deliveryOptionAvailable: [],
          _id: "",
        });
        handleGetCities();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setIsLoading(false);
    }
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

  const [selectedCities, setSelectedCities] = useState([]);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Location Management" selectedItem="City" />
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
              <h3 className="mb-0 text-bold text-secondary">City</h3>
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
                  Add City
                </button>
              </div>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <button
                className="btn btn-danger borderRadius24 text-light p-2 mx-2"
                disabled={selectedCities.length === 0}
                onClick={async () => {
                  if (
                    window.confirm(`Delete ${selectedCities.length} cities?`)
                  ) {
                    try {
                      const res = await bulkDeleteCityServ(selectedCities);
                      toast.success(res.data.message);
                      setSelectedCities([]);
                      handleGetCities();
                    } catch (err) {
                      toast.error("Bulk delete failed");
                    }
                  }
                }}
              >
                Delete Selected
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="card-body px-2">
              <div className="table-responsive table-invoice">
                <table className="table">
                  <tbody>
                    <tr style={{ background: "#F3F3F3", color: "#000" }}>
                      <th className="text-center py-3">
                        <label
                          style={{ cursor: "pointer", userSelect: "none" }}
                        >
                          <input
                            type="checkbox"
                            style={{ marginRight: "5px" }}
                            checked={
                              list?.length > 0 &&
                              selectedCities?.length === list?.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCities(list.map((c) => c._id)); // select all
                              } else {
                                setSelectedCities([]); // unselect all
                              }
                            }}
                          />
                          Select All
                        </label>
                      </th>
                      <th className="text-center py-3">Id</th>
                      <th className="text-center py-3">City Name</th>
                      <th className="text-center py-3">Minimum Price</th>
                      <th className="text-center py-3">Delivery Charge</th>
                      <th className="text-center py-3">Delivery Options</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Free Delivery Limit</th>
                      <th className="text-center py-3">Advance Payment</th>
                      {/* <th className="text-center py-3">Created At</th> */}
                      <th className="text-center py-3">Action</th>
                    </tr>

                    <div className="py-2"></div>

                    {showSkelton
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]?.map((v, i) => (
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
                            <td className="text-center">
                              <Skeleton width={100} height={25} />
                            </td>
                          </tr>
                        ))
                      : list?.map((v, i) => (
                          <tr key={i}>
                            <td className="text-center">
                              <label
                                style={{
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  style={{ marginRight: "5px" }}
                                  checked={selectedCities.includes(v._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCities([
                                        ...selectedCities,
                                        v._id,
                                      ]);
                                    } else {
                                      setSelectedCities(
                                        selectedCities.filter(
                                          (id) => id !== v._id
                                        )
                                      );
                                    }
                                  }}
                                />
                                Select
                              </label>
                            </td>

                            <td className="text-center">{v?.cityId}</td>
                            <td className="font-weight-600 text-center">
                              {v?.name}
                            </td>
                            <td className="font-weight-600 text-center">
                              {v?.minimumPrice}
                            </td>
                            <td className="font-weight-600 text-center">
                              {v?.deliveryCharge}
                            </td>

                            <td className="text-center">
                              {(v?.deliveryOptionAvailable || [])
                                .map((o) =>
                                  o === "homeDelivery"
                                    ? "Home Delivery"
                                    : "Lorry Pay"
                                )
                                .join(", ")}
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
                                  className="badge py-2"
                                  style={{ background: "#FFA426" }}
                                >
                                  Inactive
                                </div>
                              )}
                            </td>
                            <td className="font-weight-600 text-center">
                              {v?.freeDeliveryLimit ?? 0}
                            </td>
                            <td className="text-center">
                              {v?.payDeliveryInAdvance ? "Yes" : "No"}
                            </td>

                            {/* <td className="text-center">
                              {moment(v?.createdAt).format("DD-MM-YY")}
                            </td> */}

                            <td className="text-center">
                              <a
                                onClick={() =>
                                  setEditFormData({
                                    name: v?.name,
                                    status: v?.status,
                                    stateId: v?.stateId || "",
                                    minimumPrice: v?.minimumPrice || "",
                                    deliveryCharge: v?.deliveryCharge || "",
                                    freeDeliveryLimit:
                                      v?.freeDeliveryLimit ?? "",
                                    payDeliveryInAdvance:
                                      !!v?.payDeliveryInAdvance,
                                    _id: v?._id,
                                    deliveryOptionAvailable:
                                      v?.deliveryOptionAvailable || [],
                                  })
                                }
                                className="btn btn-info mx-2 text-light shadow-sm"
                              >
                                Edit
                              </a>
                              <a
                                onClick={() => handleDeleteCity(v?._id)}
                                className="btn btn-warning mx-2 text-light shadow-sm"
                              >
                                Delete
                              </a>
                            </td>
                          </tr>
                        ))}
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
              }}
            >
              <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                  style={{ height: "20px", cursor: "pointer" }}
                  onClick={() =>
                    setAddFormData({
                      stateId: "",
                      name: "",
                      minimumPrice: "",
                      deliveryCharge: "",
                      freeDeliveryLimit: "",
                      payDeliveryInAdvance: "",
                      deliveryOptionAvailable: [],
                      status: "",
                      show: false,
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-center w-100">
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Add City</h5>

                    <label className="mt-3">State</label>
                    <select
                      className="form-control"
                      value={addFormData.stateId}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          stateId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.stateId} value={state.stateId}>
                          {state.name}
                        </option>
                      ))}
                    </select>

                    <label className="mt-3">City Name</label>
                    <input
                      className="form-control"
                      type="text"
                      value={addFormData.name}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />

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

                    <label className="mt-3">Delivery Options</label>
                    <div className="d-flex gap-3">
                      {["homeDelivery", "lorryPay"].map((opt) => (
                        <label key={opt} style={{ userSelect: "none" }}>
                          <input
                            type="checkbox"
                            className="me-2"
                            checked={addFormData.deliveryOptionAvailable.includes(
                              opt
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAddFormData((prev) => {
                                const set = new Set(
                                  prev.deliveryOptionAvailable
                                );
                                if (checked) set.add(opt);
                                else set.delete(opt);
                                return {
                                  ...prev,
                                  deliveryOptionAvailable: Array.from(set),
                                };
                              });
                            }}
                          />
                          {opt === "homeDelivery"
                            ? "Home Delivery"
                            : "Lorry Pay"}
                        </label>
                      ))}
                    </div>

                    <label className="mt-3">
                      Free Delivery Order Value (₹)
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={addFormData.freeDeliveryLimit}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          freeDeliveryLimit:
                            e.target.value === ""
                              ? ""
                              : Math.max(0, Number(e.target.value)),
                        })
                      }
                    />

                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="addPayAdvance"
                        checked={!!addFormData.payDeliveryInAdvance}
                        onChange={(e) =>
                          setAddFormData({
                            ...addFormData,
                            payDeliveryInAdvance: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="addPayAdvance"
                      >
                        Collect delivery charges in advance for Lorry Pickup
                      </label>
                    </div>

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

                    <label className="mt-3">Minimum Price</label>
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
                    />

                    <button
                      className="btn btn-success w-100 mt-4"
                      onClick={
                        addFormData.name &&
                        addFormData?.stateId &&
                        addFormData.minimumPrice &&
                        addFormData?.deliveryCharge &&
                        !isLoading
                          ? handleAddCityFunc
                          : undefined
                      }
                      disabled={
                        !addFormData.name ||
                        !addFormData?.stateId ||
                        !addFormData.minimumPrice ||
                        !addFormData?.deliveryCharge ||
                        isLoading
                      }
                      style={{
                        opacity:
                          !addFormData.name ||
                          !addFormData?.stateId ||
                          !addFormData.minimumPrice ||
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
                      minimumPrice: "",
                      deliveryCharge: "",
                      freeDeliveryLimit: "",
                      payDeliveryInAdvance: "",
                      deliveryOptionAvailable: [],
                      _id: "",
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-center w-100">
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Update City</h5>

                    <label className="mt-3">City Name</label>
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
                      value={editFormData?.stateId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          stateId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.stateId} value={state.stateId}>
                          {state.name}
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

                    <label className="mt-3">Minimum Price</label>
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
                    />

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

                    <label className="mt-3">Delivery Options</label>
                    <div className="d-flex gap-3">
                      {["homeDelivery", "lorryPay"].map((opt) => (
                        <label key={opt} style={{ userSelect: "none" }}>
                          <input
                            type="checkbox"
                            className="me-2"
                            checked={editFormData.deliveryOptionAvailable.includes(
                              opt
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditFormData((prev) => {
                                const set = new Set(
                                  prev.deliveryOptionAvailable
                                );
                                if (checked) set.add(opt);
                                else set.delete(opt);
                                return {
                                  ...prev,
                                  deliveryOptionAvailable: Array.from(set),
                                };
                              });
                            }}
                          />
                          {opt === "homeDelivery"
                            ? "Home Delivery"
                            : "Lorry Pay"}
                        </label>
                      ))}
                    </div>

                    <label className="mt-3">
                      Free Delivery Order Value (₹)
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={editFormData.freeDeliveryLimit}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          freeDeliveryLimit:
                            e.target.value === ""
                              ? ""
                              : Math.max(0, Number(e.target.value)),
                        })
                      }
                    />

                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="editPayAdvance"
                        checked={!!editFormData.payDeliveryInAdvance}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            payDeliveryInAdvance: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="editPayAdvance"
                      >
                        Collect delivery charges in advance for Lorry Pickup
                      </label>
                    </div>

                    {editFormData?.name &&
                    editFormData?.stateId &&
                    editFormData?.minimumPrice &&
                    editFormData?.deliveryCharge ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && handleUpdateCityFunc}
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

export default CityList;
