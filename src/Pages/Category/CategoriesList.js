import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  getCategoryServ,
  addCategoryServ,
  deleteCategoryServ,
  updateCategoryServ,
} from "../../services/category.service";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import NoRecordFound from "../../Components/NoRecordFound";
import Modal from "react-bootstrap/Modal";
import { getProductsByCategoryServ } from "../../services/product.services";
function CategoriesList() {
  const [list, setList] = useState([]);
  const [statics, setStatics] = useState(null);
  const [payload, setPayload] = useState({
    searchKey: "",
    status: "",
    pageNo: 1,
    pageCount: 10,
    sortByField: "position",
    sortByOrder: 'asc'
  });
  const [showSkelton, setShowSkelton] = useState(false);
  const handleGetCategoryFunc = async () => {
    if (list.length == 0) {
      setShowSkelton(true);
    }
    try {
      let response = await getCategoryServ(payload);
      setList(response?.data?.data);
      setStatics(response?.data?.documentCount);
    } catch (error) {}
    setShowSkelton(false);
  };
  const staticsArr = [
    {
      title: "Total Category",
      count: statics?.totalCount,
      bgColor: "#6777EF",
    },
    {
      title: "Active Category",
      count: statics?.activeCount,
      bgColor: "#63ED7A",
    },
    {
      title: "Inactive Category",
      count: statics?.inactiveCount,
      bgColor: "#FFA426",
    },
  ];
  useEffect(() => {
    handleGetCategoryFunc();
  }, [payload]);
  const [isLoading, setIsLoading] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    image: "",
    status: "",
    show: false,
    imgPrev: "",
    specialApperence: "",
    position: "",
  });
  const handleAddCategoryFunc = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (addFormData.image) {
      formData.append("image", addFormData?.image);
    }
    formData.append("name", addFormData?.name);
    formData.append("status", addFormData?.status);
    formData.append("specialApperence", addFormData?.specialApperence);
    if (addFormData.position !== "") {
      formData.append("position", Number(addFormData.position));
    }
    try {
      let response = await addCategoryServ(formData);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setAddFormData({
          name: "",
          image: "",
          status: "",
          position: "",
          show: false,
          imgPrev: "",
        });
        handleGetCategoryFunc();
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
  const handleDeleteCategoryFunc = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        let response = await deleteCategoryServ(id);
        if (response?.data?.statusCode === "200") {
          toast?.success(response?.data?.message);
          handleGetCategoryFunc();
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
    image: "",
    status: "",
    _id: "",
    imgPrev: "",
    specialApperence: "",
    position: "",
  });
  const handleUpdateCategoryFunc = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (editFormData?.image) {
      formData?.append("image", editFormData?.image);
    }
    formData?.append("name", editFormData?.name);
    formData?.append("status", editFormData?.status);
    formData?.append("_id", editFormData?._id);
    formData?.append("specialApperence", editFormData?.specialApperence);
    if (editFormData.position !== "") {
      formData.append("position", Number(editFormData.position));
    }
    try {
      let response = await updateCategoryServ(formData);
      if (response?.data?.statusCode == "200") {
        toast.success(response?.data?.message);
        setEditFormData({
          name: "",
          image: "",
          status: "",
          position: "",
          _id: "",
        });
        handleGetCategoryFunc();
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

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState([]);

  const handleViewProducts = async (category) => {
    try {
      setSelectedCategory(category);
      const res = await getProductsByCategoryServ(category._id);
      setProductsByCategory(res?.data?.data || []);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch products.");
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

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Categories" />
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
              <h3 className="mb-0 text-bold text-secondary">Categories</h3>
            </div>
            <div className="col-lg-4 mb-2 col-md-12 col-12">
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
                  Add Category
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
                        Sr. No
                      </th>
                      <th className="text-center py-3">Image</th>
                      <th className="text-center py-3">Category Name</th>
                      <th className="text-center py-3">Status</th>
                      <th className="text-center py-3">Position</th>
                      <th className="text-center py-3">Special Apperence</th>
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
                                <td className="text-center">
                                  {(payload.pageNo - 1) * payload.pageCount +
                                    i +
                                    1}
                                </td>
                                <td className="text-center">
                                  <img
                                    src={v?.image}
                                    style={{ height: "30px" }}
                                  />
                                </td>
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
                                      className="badge py-2 "
                                      style={{ background: "#FFA426" }}
                                    >
                                      Inactive
                                    </div>
                                  )}
                                </td>
                                <td className="text-center">
                                  {typeof v?.position === "number"
                                    ? v.position
                                    : "-"}
                                </td>

                                <td className="font-weight-600 text-center">
                                  {v?.specialApperence
                                    ? v?.specialApperence
                                    : "None"}
                                </td>
                                <td className="text-center">
                                  {moment(v?.createdAt).format("DD-MM-YY")}
                                </td>
                                <td className="text-center">
                                  <a
                                    onClick={() => {
                                      setEditFormData({
                                        name: v?.name,
                                        image: "",
                                        imgPrev: v?.image,
                                        status: v?.status,
                                        _id: v?._id,
                                        specialApperence: v?.specialApperence,
                                        position:
                                          typeof v?.position === "number"
                                            ? v.position
                                            : "",
                                      });
                                    }}
                                    className="btn btn-info mx-2 text-light shadow-sm"
                                  >
                                    Edit
                                  </a>
                                  <a
                                    onClick={() =>
                                      handleDeleteCategoryFunc(v?._id)
                                    }
                                    className="btn btn-warning mx-2 text-light shadow-sm"
                                  >
                                    Delete
                                  </a>
                                  <button
                                    className="btn btn-info text-light btn-sm"
                                    onClick={() => handleViewProducts(v)}
                                  >
                                    View Products
                                  </button>
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
                      image: "",
                      status: "",
                      show: false,
                      specialApperence: "",
                      position: "",
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
                    <h5 className="mb-4">Add Category</h5>
                    <div className="p-3 border rounded mb-2">
                      {addFormData?.imgPrev ? (
                        <img
                          src={addFormData?.imgPrev}
                          className="img-fluid w-100 shadow rounded"
                        />
                      ) : (
                        <p className="mb-0 text-center">No Item Selected !</p>
                      )}
                    </div>
                    <label className="">Upload Image</label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          image: e.target.files[0],
                          imgPrev: URL.createObjectURL(e.target.files[0]),
                        })
                      }
                    />
                    <label className="mt-3">Name</label>
                    <input
                      className="form-control"
                      type="text"
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />

                    <label className="mt-3">Position</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={addFormData.position}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          position: e.target.value.replace(/[^\d]/g, ""),
                        })
                      }
                    />

                    <label className="mt-3">Status</label>
                    <select
                      className="form-control"
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
                    <label className="mt-3">Special Apperence</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          specialApperence: e.target.value,
                        })
                      }
                      value={addFormData?.specialApperence}
                    >
                      <option value="">Select Status</option>
                      <option value="Home">Home</option>
                    </select>
                    <button
                      className="btn btn-success w-100 mt-4"
                      onClick={
                        addFormData?.name && addFormData?.status && !isLoading
                          ? handleAddCategoryFunc
                          : undefined
                      }
                      disabled={
                        !addFormData?.name || !addFormData?.status || isLoading
                      }
                      style={{
                        opacity:
                          !addFormData?.name ||
                          !addFormData?.status ||
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
                      image: "",
                      status: "",
                      specialApperence: "",
                      position: "",
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
                    <h5 className="mb-4">Update Category</h5>
                    <div className="p-3 border rounded mb-2">
                      <img
                        src={editFormData?.imgPrev}
                        className="img-fluid w-100 shadow rounded"
                      />
                    </div>
                    <label className="">Upload Image</label>
                    <input
                      className="form-control"
                      type="file"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          image: e.target.files[0],
                          imgPrev: URL.createObjectURL(e.target.files[0]),
                        })
                      }
                    />
                    <label className="mt-3">Name</label>
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

                    <label className="mt-3">Position</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={editFormData.position}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          position: e.target.value.replace(/[^\d]/g, ""),
                        })
                      }
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
                    <label className="mt-3">Special Apperence</label>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          specialApperence: e.target.value,
                        })
                      }
                      value={editFormData?.specialApperence}
                    >
                      <option value="">Select Status</option>
                      <option value="Home">Home</option>
                    </select>
                    {editFormData?.name && editFormData?.status ? (
                      <button
                        className="btn btn-success w-100 mt-4"
                        onClick={!isLoading && handleUpdateCategoryFunc}
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

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Products under {selectedCategory?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productsByCategory.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {productsByCategory.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>
                      <img
                        src={product.productHeroImage}
                        style={{ height: "40px" }}
                        alt={product.name}
                      />
                    </td>
                    <td className="text-center">
                      {product.price ? (
                        <div style={{ lineHeight: "1.2" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "16px",
                              color: "#28a745",
                            }}
                          >
                            {product.discountedPrice}
                          </div>
                          <div
                            style={{
                              textDecoration: "line-through",
                              color: "#888",
                              fontSize: "13px",
                              marginTop: "4px",
                            }}
                          >
                            {product.price}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                        >
                          {product.price}
                        </div>
                      )}
                    </td>
                    <td>
                      {product.status ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-warning">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products found for this category.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CategoriesList;
