import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";

import {
  addStateServ,
  bulkDeleteStateServ,
  deleteStateServ,
  getStateServ,
  updateStateServ,
} from "../../services/location.services";
function StateList() {
  const [list, setList] = useState([]);
  const [statics, setStatics] = useState(null);
  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "",
  });
  const [showSkelton, setShowSkelton] = useState(false);
  const handleGetStateFunc = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      let response = await getStateServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {}
    setShowSkelton(false);
  };
  const staticsArr = [
    {
      title: "Total State",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active State",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive State",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];
  useEffect(() => {
    handleGetStateFunc();
  }, [payload]);
  const [isLoading, setIsLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    status: "",
    show: false,
  });

  const handleAddStateFunc = async () => {
    setIsLoading(true);
    try {
      const payloadToSend = {
        name: addFormData.name.trim(),
        status: addFormData.status === "true",
       
      };

      const response = await addStateServ(payloadToSend);

      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setAddFormData({
          name: "",
          status: "",
          show: false,
        });
        handleGetStateFunc();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStateFunc = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this State?"
    );
    if (confirmed) {
      try {
        let response = await deleteStateServ(id);
        if (response?.data?.statusCode == "200") {
          toast?.success(response?.data?.message);
          handleGetStateFunc();
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
    _id: "",
    name: "",
    status: "",
  });

  const handleUpdateStateFunc = async () => {
    setIsLoading(true);
    try {
      const payloadToSend = {
        _id: editFormData._id,
        name: editFormData.name.trim(),
        status: editFormData.status === "true",
        deliveryOptionAvailable: editFormData.deliveryOptionAvailable?.length
          ? editFormData.deliveryOptionAvailable
          : ["lorryPay"],
      };

      const response = await updateStateServ(payloadToSend);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setEditFormData({
          _id: "",
          name: "",
          status: "",
          deliveryOptionAvailable: [],
        });
        handleGetStateFunc();
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

  const [selectedStates, setSelectedStates] = useState([]);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Location Management" selectedItem="States" />
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
              <h3 className="mb-0 text-bold text-secondary">States</h3>
            </div>
            <div className="col-lg-4 mb-2 col-md-12 col-12">
              <div>
                <input
                  className="form-control borderRadius24"
                  placeholder="Search"
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
                  Add State
                </button>
              </div>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <button
                className="btn btn-danger borderRadius24 text-light p-2 mx-2"
                disabled={selectedStates.length === 0}
                onClick={async () => {
                  if (
                    window.confirm(`Delete ${selectedStates.length} states?`)
                  ) {
                    try {
                      const res = await bulkDeleteStateServ(selectedStates);
                      toast.success(res.data.message);
                      setSelectedStates([]);
                      handleGetStateFunc();
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
                      <th
                        className="text-center py-3"
                        style={{ borderRadius: "30px 0px 0px 30px" }}
                      >
                        <label
                          style={{ cursor: "pointer", userSelect: "none" }}
                        >
                          <input
                            type="checkbox"
                            style={{ marginRight: "5px" }}
                            checked={
                              list.length > 0 &&
                              selectedStates.length === list.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStates(list.map((s) => s._id)); // select all
                              } else {
                                setSelectedStates([]); // unselect all
                              }
                            }}
                          />
                          Select All
                        </label>
                      </th>

                      <th className="text-center py-3">Id</th>
                      <th className="text-center py-3">State Name</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Created At</th>
                      <th
                        className="text-center py-3"
                        style={{ borderRadius: "0px 30px 30px 0px" }}
                      >
                        Action
                      </th>
                    </tr>

                    {showSkelton
                      ? [1, 2, 3, 4, 5].map((v, i) => (
                          <tr key={i}>
                            <td className="text-center">
                              <Skeleton width={50} height={50} />
                            </td>
                            <td className="text-center">
                              <Skeleton width={50} height={50} />
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
                          <tr key={v._id}>
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
                                  checked={selectedStates.includes(v._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStates([
                                        ...selectedStates,
                                        v._id,
                                      ]);
                                    } else {
                                      setSelectedStates(
                                        selectedStates.filter(
                                          (id) => id !== v._id
                                        )
                                      );
                                    }
                                  }}
                                />
                                Select
                              </label>
                            </td>

                            <td className="text-center">{v?.stateId}</td>
                            <td className="font-weight-600 text-center">
                              {v?.name}
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
                            <td className="text-center">
                              {moment(v?.createdAt).format("DD-MM-YY")}
                            </td>
                            <td className="text-center">
                              <a
                                onClick={() =>
                                  setEditFormData({
                                    name: v?.name,
                                    status: String(v?.status),
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
                                onClick={() => handleDeleteStateFunc(v?._id)}
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
          className="modal fade show d-flex align-items-center  justify-content-center "
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
                  style={{ height: "20px" }}
                  onClick={() =>
                    setAddFormData({
                      name: "",
                      status: "",
                      show: false,
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  className="d-flex justify-content-center w-100"
                >
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Add State</h5>

                    <label className="mt-3">State Name</label>
                    <input
                      className="form-control"
                      type="text"
                      value={addFormData.name}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />

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

                    <button
                      className="btn btn-success w-100 mt-4"
                      onClick={
                        addFormData?.name && addFormData?.status && !isLoading
                          ? handleAddStateFunc
                          : undefined
                      }
                      disabled={
                        !addFormData?.name || !addFormData?.status === "" || isLoading
                      }
                      style={{
                        opacity:
                          !addFormData?.name ||
                          !addFormData?.status === "" ||
                          isLoading
                            ? "0.5"
                            : "1",
                      }}
                    >
                      {isLoading ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
                <div className="d-flex justify-content-center"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {addFormData?.show && <div className="modal-backdrop fade show"></div>}
      {editFormData?._id && (
        <div
          className="modal fade show d-flex align-items-center  justify-content-center "
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
                  style={{ height: "20px" }}
                  onClick={() =>
                    setEditFormData({
                      name: "",
                      status: "",
                      _id: "",
                    })
                  }
                />
              </div>

              <div className="modal-body">
                <div
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  className="d-flex justify-content-center w-100"
                >
                  <div className="w-100 px-2">
                    <h5 className="mb-4">Update State</h5>

                    <label className="mt-3">State Name</label>
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

                    {editFormData?.name && editFormData?.status ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && handleUpdateStateFunc}
                      >
                        {isLoading ? "Saving..." : "Submit"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-100 mt-4"
                        style={{ opacity: "0.5" }}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-center"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {editFormData?._id && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default StateList;
