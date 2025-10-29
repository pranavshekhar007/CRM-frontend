import React, { useState, useEffect } from "react";
import Sidebar from "../../../Components/Sidebar";
import TopNav from "../../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../../Components/NoRecordFound";
import { useNavigate } from "react-router-dom";
import {
  deleteComboProductServ,
  exportComboProductServ,
  getComboProductServ,
  updateComboProductServ,
} from "../../../services/comboProduct.services";
import { triggerFileDownload } from "../../../utils/fileDownload";

function ComboProductList() {
  const navigate = useNavigate();
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
  const handleGetComboProductFunc = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      let response = await getComboProductServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {}
    setShowSkelton(false);
  };
  const staticsArr = [
    {
      title: "Total Combo Packs",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active Combo Packs",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive Combo Packs",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];
  useEffect(() => {
    handleGetComboProductFunc();
  }, [payload]);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    productHeroImage: "",
    status: "",
    _id: "",
  });
  const updateComboProductFunc = async () => {
    try {
      let response = await updateComboProductServ({
        id: editFormData?._id,
        status: editFormData?.status,
      });
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setEditFormData({
          name: "",
          productHeroImage: "",
          status: "",
          _id: "",
        });
        handleGetComboProductFunc();
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
  };
  const handleDeleteComboProductFunc = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmed) {
      try {
        let response = await deleteComboProductServ(id);
        if (response?.data?.statusCode == "200") {
          toast.success(response?.data?.message);
          handleGetComboProductFunc();
        }
      } catch (error) {
        toast.error("Internal Server Error");
      }
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

  const handleDownload = async () => {
    try {
      const response = await exportComboProductServ(payload);
      triggerFileDownload(response.data, "comboList.pdf");
    } catch (err) {
      toast.error("Download failed");
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Combo Packs" />
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
              <h3 className="mb-0 text-bold text-secondary">Combo Pack</h3>
            </div>
            <div className="col-lg-3 mb-2 col-md-12 col-12">
              <div>
                <input
                  className="form-control borderRadius24"
                  placeholder="Search"
                  onChange={(e) =>
                    setPayload({ ...payload, searchKey: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-lg-2 mb-2  col-md-6 col-12">
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
                  className="btn w-100 borderRadius24 text-light"
                  style={{ background: "#c34b36" }}
                  onClick={() => navigate("/add-combo-product")}
                >
                  Add Combo Pack
                </button>
              </div>
            </div>
            <div className="col-lg-2 mb-2 col-md-6 col-12 dropdown">
              <button
                className="btn w-100 borderRadius24 text-light p-2 dropdown-toggle"
                style={{ background: "#227C9D" }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Download
              </button>
              <ul className="dropdown-menu w-100">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("pdf")}
                  >
                    Download as PDF
                  </button>
                </li>
              </ul>
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
                        Sr. No
                      </th>
                      <th className="text-center py-3">Name</th>
                      <th className="text-center py-3">Image</th>

                      {/* <th className="text-center py-3">Combo Price</th> */}
                      <th className="text-center py-3">Product</th>
                      <th className="text-center py-3">Price</th>
                      <th className="text-center py-3">Stock</th>
                      <th className="text-center py-3">Status</th>

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
                                <td className="text-center">
                                  {(payload.pageNo - 1) * payload.pageCount +
                                    i +
                                    1}
                                </td>

                                <td className="font-weight-600 text-center">
                                  {v?.name}
                                </td>
                                <td className="text-center">
                                  <img
                                    src={v?.productHeroImage}
                                    style={{ height: "30px" }}
                                  />
                                </td>

                                {/* <td className="text-center">
                                  {v?.pricing?.comboPrice}
                                </td> */}
                                <td className="text-center">
                                  {Array.isArray(v?.productId) &&
                                  v.productId.length > 0 ? (
                                    <ul className="list-unstyled mb-0 text-start d-inline-block">
                                      {v.productId.map((prodObj, idx) => (
                                        <li
                                          key={idx}
                                          className="mb-1 px-2 py-1 bg-light rounded text-dark"
                                        >
                                          {prodObj?.product?.name} (
                                          {prodObj?.quantity})
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    "-"
                                  )}
                                </td>

                                <td className="text-center">
                                  {v?.pricing?.offerPrice ? (
                                    <div style={{ lineHeight: "1.2" }}>
                                      <div
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "16px",
                                          color: "#28a745",
                                        }}
                                      >
                                        {v?.pricing?.comboPrice}
                                      </div>
                                      <div
                                        style={{
                                          textDecoration: "line-through",
                                          color: "#888",
                                          fontSize: "13px",
                                          marginTop: "4px",
                                        }}
                                      >
                                        {v?.pricing?.currency}{" "}
                                        {v?.pricing?.offerPrice}
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        fontWeight: "bold",
                                        fontSize: "16px",
                                      }}
                                    >
                                      {v?.pricing?.currency}{" "}
                                      {v?.pricing?.actualPrice}
                                    </div>
                                  )}
                                </td>

                                <td className="text-center">
                                  {v?.stockQuantity}
                                </td>
                                <td className="text-center">
                                  {v?.status ? (
                                    <div
                                      className="badge py-2"
                                      style={{
                                        background: "#63ED7A",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        setEditFormData({
                                          name: v?.name,
                                          productHeroImage: v?.productHeroImage,
                                          status: true,
                                          _id: v?._id,
                                        })
                                      }
                                    >
                                      Active
                                    </div>
                                  ) : (
                                    <div
                                      className="badge py-2 "
                                      style={{
                                        background: "#FFA426",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        setEditFormData({
                                          name: v?.name,
                                          productHeroImage: v?.productHeroImage,
                                          status: false,
                                          _id: v?._id,
                                        })
                                      }
                                    >
                                      Inactive
                                    </div>
                                  )}
                                </td>

                                <td className="text-center">
                                  <a
                                    className="btn btn-info mx-2 text-light shadow-sm"
                                    onClick={() =>
                                      navigate(
                                        "/update-combo-product-step1/" + v?._id
                                      )
                                    }
                                  >
                                    Edit
                                  </a>
                                  <a
                                    className="btn btn-warning mx-2 text-light shadow-sm"
                                    onClick={() =>
                                      handleDeleteComboProductFunc(v?._id)
                                    }
                                  >
                                    Delete
                                  </a>
                                </td>
                              </tr>
                              <div className="py-2"></div>
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
                      _id: "",
                      name: "",
                      productHeroImage: "",
                      status: "",
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
                    <h5 className="mb-4">Update Status</h5>
                    <div className="p-3 border rounded mb-2">
                      <img
                        src={editFormData?.productHeroImage}
                        className="img-fluid w-100 shadow rounded"
                        style={{ height: "200px" }}
                      />
                    </div>

                    <label className="mt-3">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      readOnly
                      value={editFormData?.name}
                    />
                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e?.target?.value,
                        })
                      }
                      value={editFormData?.status}
                    >
                      <option value="">Select Status</option>
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>

                    {editFormData?.status ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && updateComboProductFunc}
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

export default ComboProductList;
