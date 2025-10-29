import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../../Components/Sidebar";
import TopNav from "../../../Components/TopNav";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JoditEditor from "jodit-react";
import Select from "react-select";
import { useGlobalState } from "../../../GlobalProvider";
import { useNavigate } from "react-router-dom";
import {
  getProductsByCategoryServ,
  getProductServ,
} from "../../../services/product.services";
import { addComboProductServ } from "../../../services/comboProduct.services";
import { getCategoryServ } from "../../../services/category.service";
// import { getProductTypeServ } from "../../../services/productType.service";
function AddComboProduct() {
  const { globalState, setGlobalState } = useGlobalState();
  const navigate = useNavigate();
  const editor = useRef(null);
  const contentRef = useRef("");
  const config = {
    placeholder: "Start typing...",
    height: "300px",
  };

  const [content, setContent] = useState("");
  const [formData, setFormData] = useState({
    maxComboLimit: "",
    name: "",
    productId: [],
    pricing: {
      actualPrice: "",
      offerPrice: "",
      comboPrice: "",
    },
    // gtin: "",
    shortDescription: "",
  });

  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const resp = await getCategoryServ();
      if (resp?.data?.statusCode === 200) {
        setCategoryList(resp?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProductsByCategories = async () => {
    if (!selectedCategories.length) return;

    try {
      let merged = [];
      for (const catId of selectedCategories) {
        const resp = await getProductsByCategoryServ(catId.value);
        const list = resp?.data?.data || [];
        merged = [...merged, ...list];
      }

      // Remove duplicates
      const uniqueProducts = merged.filter(
        (v, i, a) => a.findIndex((t) => t._id === v._id) === i
      );

      setProductList(uniqueProducts);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  // Effect
  useEffect(() => {
    fetchProductsByCategories();
  }, [selectedCategories]);

  // const getProductListFunc = async () => {
  //   try {
  //     let response = await getProductServ();
  //     if (response?.data?.statusCode == "200") {
  //       setProductList(response?.data?.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   getProductListFunc();
  // }, []);

  const [loader, setLoader] = useState(false);
  const handleSubmit = async () => {
    setLoader(true);
    try {
      let finalPayload;
      const shortDescription = contentRef.current;
      if (formData?.createdByAdmin != "No") {
        finalPayload = {
          maxComboLimit: formData?.maxComboLimit,
          name: formData?.name,
          productId: formData?.productId,
          pricing: {
            actualPrice: formData?.pricing?.actualPrice || "",
            offerPrice: formData?.pricing?.offerPrice || "",
            comboPrice: formData?.pricing?.comboPrice || "",
          },
          // gtin: formData?.gtin,
          shortDescription: shortDescription,
          createdBy: formData?.createdBy,
        };
      }
      if (formData?.createdByAdmin == "No") {
        finalPayload = {
          maxComboLimit: formData?.maxComboLimit,
          name: formData?.name,
          productId: formData?.productId,
          pricing: {
            actualPrice: formData?.pricing?.actualPrice || "",
            offerPrice: formData?.pricing?.offerPrice || "",
            comboPrice: formData?.pricing?.comboPrice || "",
          },
          // gtin: formData?.gtin,
          shortDescription: shortDescription,
          createdBy: formData?.createdBy,
        };
      }
      let response = await addComboProductServ(finalPayload);
      if (response?.data?.statusCode == 200) {
        toast.success(response?.data?.message);
        setFormData({
          maxComboLimit: "",
          name: "",
          productId: [],
          pricing: {
            actualPrice: "",
            offerPrice: "",
            comboPrice: "",
          },
          // gtin: "",
          createdBy: "",
          createdByAdmin: "",
        });
        contentRef.current = "";
        setContent("");
        navigate("/update-combo-product-step2/" + response?.data?.data?._id);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
    setLoader(false);
  };

  useEffect(() => {
    const totalMRP = formData.productId.reduce((total, item) => {
      const product = productList.find(
        (p) => p._id === item.product || p._id === item.value
      );
      const qty = item.quantity || 1;
      return total + (product?.price || 0) * qty;
    }, 0);

    const totalDiscount = formData.productId.reduce((total, item) => {
      const product = productList.find(
        (p) => p._id === item.product || p._id === item.value
      );
      const qty = item.quantity || 1;
      return total + (product?.discountedPrice || 0) * qty;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        actualPrice: totalMRP.toFixed(2),
        offerPrice: totalDiscount.toFixed(2),
      },
    }));
  }, [formData.productId, productList]);

  return (
    <div className="bodyContainer">
      <Sidebar
        selectedMenu="Product Management"
        selectedItem="Add Combo Packs"
      />
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
          ></div>

          <div className="mt-3">
            <div className="card-body px-2">
              <div className="table-responsive table-invoice">
                <div className="d-flex">
                  <h4
                    className="p-2 text-dark shadow rounded mb-4 "
                    style={{ background: "#05E2B5" }}
                  >
                    Add Combo Pack : Step 1/3
                  </h4>
                </div>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label>Max Combo Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.maxComboLimit}
                    className="form-control"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!isNaN(val) && Number(val) >= 0) {
                        setFormData((prev) => ({
                          ...prev,
                          maxComboLimit: val,
                        }));
                      }
                    }}
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Product Name*</label>
                  <input
                    value={formData?.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e?.target?.value })
                    }
                    className="form-control"
                    style={{ height: "45px" }}
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label mb-2">Select Category</label>
                  <Select
                    isMulti
                    options={categoryList.map((c) => ({
                      label: c.name,
                      value: c._id,
                    }))}
                    value={selectedCategories}
                    onChange={(opts) => setSelectedCategories(opts || [])}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Choose categories"
                  />
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label mb-2">Products</label>
                  <Select
                    isMulti
                    isDisabled={!selectedCategories.length}
                    options={productList?.map((v) => ({
                      label: v?.name,
                      value: v?._id,
                    }))}
                    value={formData.productId
                      .map((p) => {
                        const product = productList.find(
                          (prod) => prod._id === p.product
                        );
                        return product
                          ? { label: product?.name, value: p.product }
                          : null;
                      })
                      .filter(Boolean)}
                    onChange={(selectedOptions) => {
                      const updatedProductIds = (selectedOptions || []).map(
                        (option) => {
                          const existing = formData.productId.find(
                            (p) => p.product === option.value
                          );
                          return {
                            product: option.value,
                            quantity: existing ? existing.quantity : 1,
                          };
                        }
                      );
                      setFormData({
                        ...formData,
                        productId: updatedProductIds,
                      });
                    }}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder={
                      selectedCategories.length
                        ? "Choose products"
                        : "Select a category first"
                    }
                  />

                  {/* Quantity Inputs */}
                  <div className="mt-3">
                    {formData.productId.map((item, idx) => {
                      const productDetails = productList.find(
                        (p) => p._id === item.product
                      );
                      return (
                        <div
                          key={item.product}
                          className="border rounded px-3 py-2 mb-2 d-flex align-items-center justify-content-between bg-light"
                        >
                          <div
                            className="text-truncate me-3"
                            style={{ maxWidth: "65%" }}
                          >
                            <strong>{productDetails?.name}</strong>
                          </div>
                          <div
                            className="d-flex align-items-center gap-2"
                            style={{ minWidth: "120px" }}
                          >
                            <label className="mb-0 small text-muted">
                              Qty:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                const updated = [...formData.productId];
                                updated[idx].quantity =
                                  parseInt(e.target.value) || 1;
                                setFormData({
                                  ...formData,
                                  productId: updated,
                                });
                              }}
                              style={{ width: "60px" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="col-4 mb-3">
                  <label>Product Price (MRP)</label>
                  <input
                    value={formData?.pricing?.actualPrice || ""}
                    className="form-control"
                    readOnly
                  />
                </div>

                <div className="col-4 mb-3">
                  <label>Discounted/Sale Price</label>
                  <input
                    value={formData?.pricing?.offerPrice || ""}
                    className="form-control"
                    readOnly
                  />
                </div>

                {formData?.maxComboLimit &&
                  parseFloat(formData?.pricing?.offerPrice || 0) >
                    parseFloat(formData?.maxComboLimit) && (
                    <div className="col-12 mb-2">
                      <div className="alert alert-danger py-2">
                        ⚠️ You’ve exceeded the max limit of ₹
                        {formData?.maxComboLimit}. Reduce quantity or remove
                        items.
                      </div>
                    </div>
                  )}

                <div className="col-4 mb-3">
                  <label>Combo Price</label>
                  <input
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          comboPrice: e.target.value,
                        },
                      })
                    }
                    value={formData?.pricing?.comboPrice || ""}
                    className="form-control"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label>Short Description*</label>
                  <JoditEditor
                    ref={editor}
                    config={config}
                    value={content}
                    onChange={(newContent) => {
                      contentRef.current = newContent;
                    }}
                  />
                </div>
                {loader ? (
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      style={{
                        background: "#05E2B5",
                        border: "none",
                        borderRadius: "24px",
                        opacity: "0.6",
                      }}
                    >
                      Saving ...
                    </button>
                  </div>
                ) : formData?.name &&
                  (!formData?.maxComboLimit ||
                    parseFloat(formData?.pricing?.offerPrice || 0) <=
                      parseFloat(formData?.maxComboLimit)) ? (
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      style={{
                        background: "#05E2B5",
                        border: "none",
                        borderRadius: "24px",
                      }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      style={{
                        background: "#ccc",
                        border: "none",
                        borderRadius: "24px",
                      }}
                      disabled
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddComboProduct;
