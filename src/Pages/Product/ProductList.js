import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getProductServ,
  updateProductServ,
  deleteProductServ,
  uploadExcelServ,
  downloadProductExportServ,
  downloadSampleProductFileServ,
  bulkDeleteProductsServ,
} from "../../services/product.services";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import { useNavigate } from "react-router-dom";
import { getCategoryServ } from "../../services/category.service";
import { triggerFileDownload } from "../../utils/fileDownload";

function ProductList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [statics, setStatics] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    name: "",
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    pageNo: 1,
    pageCount: 10,
    categoryId: "",
    sortByField: "",
  });
  const [showSkelton, setShowSkelton] = useState(false);
  const handleGetProductFunc = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      let response = await getProductServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {}
    setShowSkelton(false);
  };
  const staticsArr = [
    {
      title: "Total Products",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active Products",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive Products",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];
  useEffect(() => {
    handleGetProductFunc();
  }, [payload]);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    productHeroImage: "",
    status: "",
    _id: "",
  });

  const updateProductFunc = async () => {
    try {
      let response = await updateProductServ({
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
        handleGetProductFunc();
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
  };

  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    handleGetProductFunc();
  }, [payload]);

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    try {
      let res = await getCategoryServ();
      setCategoryList(res?.data?.data || []);
    } catch (err) {
      console.log("Category fetch failed");
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

  const handleBulkUpload = async () => {
    if (!bulkForm.name || !bulkForm.file) {
      toast.error("Please enter a name and select a file");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", bulkForm.file);

    try {
      const res = await uploadExcelServ(formData);
      if (res?.data?.statusCode === 200) {
        toast.success(res?.data?.message || "Bulk upload successful!");
        setShowBulkModal(false);
        setBulkForm({ name: "", file: null });
        handleGetProductFunc();
      } else {
        toast.error(res?.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Bulk Upload Error:", err);
      const errorData = err?.response?.data;
      if (errorData?.statusCode === 409) {
        toast.error(errorData.message);
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else {
        toast.error("Server Error during upload");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await downloadProductExportServ(payload, format);
      const ext = format === "excel" ? "xlsx" : format;
      triggerFileDownload(response.data, `productList.${ext}`);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const handleDownloadSample = async (format) => {
    try {
      const res = await downloadSampleProductFileServ(format);
      const ext = format === "excel" ? "xlsx" : format;
      triggerFileDownload(res.data, `BulkProductUploadTemplate.${ext}`);
    } catch (err) {
      toast.error("Sample file download failed");
    }
  };

  const [selectedProducts, setSelectedProducts] = useState([]);

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Products" />
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
              <h3 className="mb-0 text-bold text-secondary">Products</h3>
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
            <div className="col-lg-2 mb-2 col-md-6 col-12">
              <select
                className="form-control borderRadius24"
                onChange={(e) =>
                  setPayload({ ...payload, categoryId: e.target.value })
                }
                value={payload.categoryId}
              >
                <option value="">Select Category</option>
                {categoryList?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <button
                className="btn w-100 borderRadius24 text-light"
                style={{ background: "#c34b36" }}
                onClick={() => navigate("/add-product")}
              >
                Add Product
              </button>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <button
                className="btn w-100 borderRadius24 text-light p-2"
                style={{ background: "#354f52" }}
                onClick={() => setShowBulkModal(true)}
              >
                Add Bulk Products
              </button>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12 dropdown">
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
                    onClick={() => handleDownload("txt")}
                  >
                    Download as TXT
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("excel")}
                  >
                    Download as Excel
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownload("csv")}
                  >
                    Download as CSV
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownloadSample("excel")}
                  >
                    Download Sample Excel
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownloadSample("csv")}
                  >
                    Download Sample CSV
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDownloadSample("txt")}
                  >
                    Download Sample TXT
                  </button>
                </li>
              </ul>
            </div>
            <div className="col-lg-3 mb-2 col-md-6 col-12">
              <button
                className="btn btn-danger borderRadius24 text-light p-2 mx-2"
                disabled={selectedProducts.length === 0}
                onClick={async () => {
                  if (
                    window.confirm(
                      `Delete ${selectedProducts.length} products?`
                    )
                  ) {
                    try {
                      const res = await bulkDeleteProductsServ(
                        selectedProducts
                      );
                      toast.success(res.data.message);
                      setSelectedProducts([]);
                      handleGetProductFunc();
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
                              selectedProducts.length === list.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts(list.map((p) => p._id)); // Select all
                              } else {
                                setSelectedProducts([]); // Unselect all
                              }
                            }}
                          />
                          Select All
                        </label>
                      </th>

                      <th className="text-center py-3">Sr. No</th>
                      <th className="text-center py-3">Name</th>
                      <th className="text-center py-3">Image</th>

                      {/* <th className="text-center py-3">Tax</th> */}
                      <th className="text-center py-3">Category</th>

                      {/* <th className="text-center py-3">HSN Code</th> */}
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
                                  <label
                                    style={{
                                      cursor: "pointer",
                                      userSelect: "none",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      style={{ marginRight: "5px" }}
                                      checked={selectedProducts.includes(v._id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedProducts([
                                            ...selectedProducts,
                                            v._id,
                                          ]);
                                        } else {
                                          setSelectedProducts(
                                            selectedProducts.filter(
                                              (id) => id !== v._id
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    Select
                                  </label>
                                </td>

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

                                {/* <td className="text-center">{v?.tax}</td> */}
                                <td className="text-center">
                                  {Array.isArray(v?.categoryId)
                                    ? v.categoryId
                                        .map((cat) => cat.name)
                                        .join(", ")
                                    : v?.categoryId?.name || "-"}
                                </td>

                                {/* <td className="text-center">{v?.hsnCode}</td> */}
                                <td className="text-center">
                                  {v?.price ? (
                                    <div style={{ lineHeight: "1.2" }}>
                                      <div
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "16px",
                                          color: "#28a745",
                                        }}
                                      >
                                        {v?.discountedPrice}
                                      </div>
                                      <div
                                        style={{
                                          textDecoration: "line-through",
                                          color: "#888",
                                          fontSize: "13px",
                                          marginTop: "4px",
                                        }}
                                      >
                                        {v?.price}
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        fontWeight: "bold",
                                        fontSize: "16px",
                                      }}
                                    >
                                      {v?.price}
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
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() =>
                                      navigate(`/product-details/${v?._id}`)
                                    }
                                  >
                                    View
                                  </button>

                                  {/* <a
                                    className="btn btn-info mx-2 text-light shadow-sm"
                                    onClick={() =>
                                      navigate(
                                        "/update-product-step1/" + v?._id
                                      )
                                    }
                                  >
                                    Edit
                                  </a> */}
                                  {/* <a
                                    className="btn btn-warning mx-2 text-light shadow-sm"
                                    onClick={() =>
                                      handleDeleteProductFunc(v?._id)
                                    }
                                  >
                                    Delete
                                  </a> */}
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
                        onClick={!isLoading && updateProductFunc}
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
      {showBulkModal && (
        <>
          <div
            className="modal fade show d-flex align-items-center justify-content-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
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
                {/* Custom close button */}
                <div className="d-flex justify-content-end pt-4 pb-0 px-4">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/9068/9068699.png"
                    style={{ height: "20px", cursor: "pointer" }}
                    onClick={() => setShowBulkModal(false)}
                    alt="Close"
                  />
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                    className="d-flex justify-content-center w-100"
                  >
                    <div className="w-100 px-2">
                      <h5 className="mb-4">Upload Bulk Products</h5>

                      <div className="mb-3">
                        <label className="form-label">Bulk Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={bulkForm.name}
                          onChange={(e) =>
                            setBulkForm({ ...bulkForm, name: e.target.value })
                          }
                          placeholder="Enter bulk upload name"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Upload File (CSV/Excel)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          onChange={(e) =>
                            setBulkForm({
                              ...bulkForm,
                              file: e.target.files[0],
                            })
                          }
                        />
                      </div>

                      <button
                        className="btn btn-primary w-100 mt-3"
                        onClick={handleBulkUpload}
                        disabled={
                          isUploading || !bulkForm.name || !bulkForm.file
                        }
                        style={{
                          opacity: !bulkForm.name || !bulkForm.file ? 0.6 : 1,
                        }}
                      >
                        {isUploading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Uploading...
                          </>
                        ) : (
                          "Upload"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default ProductList;
