import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  updateProductServ,
  getProductDetailsServ,
} from "../../services/product.services";
import { getTagSetServ } from "../../services/tag.service";
import { getProductTypeServ } from "../../services/productType.service";
import { getTaxServ } from "../../services/tax.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JoditEditor from "jodit-react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { getCategoryServ } from "../../services/category.service";

function ProductUpdateStep1() {
  const params = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  const contentRef = useRef("");

  const [hsnError, setHsnError] = useState("");

  const [btnLoader, setBtnLoader] = useState(false);
  const [content, setContent] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    tags: [],
    // productType: "",
    // tax: "",
    categoryId: [],
    // hsnCode: "",
    // GTIN: "",
    specialAppearance: [],
    shortDescription: "",
  });

  const [tagOptions, setTagOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const config = {
    placeholder: "Start typing...",
    height: "300px",
  };

  const fetchDropdownData = async () => {
    try {
      const [tagRes, typeRes, taxRes, categoryRes] = await Promise.all([
        getTagSetServ({ status: true }),
        getProductTypeServ({ status: true }),
        getTaxServ({ status: true }),
        getCategoryServ({ status: true }),
      ]);

      if (tagRes?.data?.statusCode === 200) {
        setTagOptions(
          tagRes.data.data.map((tag) => ({ label: tag.name, value: tag.name }))
        );
      }
      if (typeRes?.data?.statusCode === 200) {
        setProductTypeOptions(
          typeRes.data.data.map((type) => ({
            label: type.name,
            value: type.name,
          }))
        );
      }
      if (taxRes?.data?.statusCode === 200) {
        setTaxOptions(
          taxRes.data.data.map((tax) => ({
            label: `${tax.name} ${tax.percentage}%`,
            value: tax.name + " " + tax.percentage + " %",
          }))
        );
      }
      if (categoryRes?.data?.statusCode === 200) {
        setCategoryOptions(
          categoryRes.data.data.map((category) => ({
            label: category.name,
            value: category._id,
          }))
        );
      }
    } catch (error) {
      toast.error("Failed to fetch dropdown data.");
    }
  };

  const getProductDetails = async () => {
    try {
      let response = await getProductDetailsServ(params?.id);
      if (response?.data?.statusCode === 200) {
        const product = response?.data?.data?.product;
        setFormData({
          name: product?.name || "",
          tags: product?.tags || [],
          // productType: product?.productType || "",
          // tax: product?.tax || "",
          categoryId: product?.categoryId || [],
          // hsnCode: product?.hsnCode || "",
          // GTIN: product?.GTIN || "",
          specialAppearance: product?.specialAppearance || [],
          shortDescription: product?.shortDescription || "",
        });
        setContent(product?.shortDescription || "");
        contentRef.current = product?.shortDescription || "";
      }
    } catch (error) {
      toast.error("Failed to fetch product details.");
    }
  };

  useEffect(() => {
    fetchDropdownData();
    getProductDetails();
  }, []);

  const updateProductFunc = async () => {
    setBtnLoader(true);
    try {
      let updatedData = {
        ...formData,
        shortDescription: contentRef.current,
        id: params?.id,
      };
      let response = await updateProductServ(updatedData);
      if (response?.data?.statusCode === 200) {
        toast.success(response?.data?.message);
        setFormData({
          name: "",
          tags: [],
          // productType: "",
          // tax: "",
          categoryId: [],
          // hsnCode: "",
          // GTIN: "",
          specialAppearance: [],
          shortDescription: "",
        });
        navigate("/update-product-step2/" + response?.data?.data?._id);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
    setBtnLoader(false);
  };

  const specialAppearanceOptions = [
    { label: "trending now", value: "trending now" },
    { label: "our shop", value: "our shop" },
    { label: "new arrivals", value: "new arrivals" },
  ];

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Add Product" />
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
              <div className="d-flex">
                <h4
                  className="p-2 text-dark shadow rounded mb-4"
                  style={{ background: "#05E2B5" }}
                >
                  Update Product : Step 1/3
                </h4>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="form-control"
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Tags</label>
                  <Select
                    isMulti
                    value={formData.tags.map((tag) => ({
                      label: tag,
                      value: tag,
                    }))}
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        tags: selected.map((option) => option.value),
                      })
                    }
                    options={tagOptions}
                  />
                </div>

                {/* <div className="col-6 mb-3">
                  <label>Product Type</label>
                  <Select
                    value={
                      formData.productType
                        ? {
                            label: formData.productType,
                            value: formData.productType,
                          }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        productType: selected?.value || "",
                      })
                    }
                    options={productTypeOptions}
                  />
                </div>

                <div className="col-6 mb-3">
                  <label>Tax</label>
                  <Select
                    value={
                      formData.tax
                        ? { label: formData.tax, value: formData.tax }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({ ...formData, tax: selected?.value || "" })
                    }
                    options={taxOptions}
                  />
                </div> */}

                <div className="col-6 mb-3">
                  <label>Category</label>
                  <Select
                    isMulti
                    value={categoryOptions.filter((option) => {
                      return formData.categoryId.some((cat) =>
                        typeof cat === "string"
                          ? cat === option.value
                          : cat._id === option.value
                      );
                    })}
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        categoryId: selected.map((option) => option.value),
                      })
                    }
                    options={categoryOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>

                {/* <div className="col-6 mb-3">
                  <label>HSN Code*</label>
                  <input
                    className={`form-control ${hsnError ? "is-invalid" : ""}`}
                    style={{ height: "45px" }}
                    value={formData?.hsnCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, hsnCode: value });
                        setHsnError("");
                      } else {
                        setHsnError("Only numbers are allowed in HSN Code");
                      }
                    }}
                  />
                  {hsnError && (
                    <div className="invalid-feedback">{hsnError}</div>
                  )}
                </div>

                <div className="col-6 mb-3">
                  <label>GTIN Code*</label>
                  <input
                    className="form-control"
                    style={{ height: "45px" }}
                    value={formData?.GTIN || ""}
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, GTIN: value });
                      }
                    }}
                  />
                </div> */}

                <div className="col-6 mb-3">
                  <label>Special Appearance</label>
                  <Select
                    isMulti
                    options={specialAppearanceOptions}
                    value={specialAppearanceOptions.filter((option) =>
                      formData?.specialAppearance?.includes(option.value)
                    )}
                    onChange={(selectedOptions) =>
                      setFormData({
                        ...formData,
                        specialAppearance: selectedOptions.map(
                          (option) => option.value
                        ),
                      })
                    }
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>

                <div className="col-12 mb-3">
                  <label>Short Description</label>
                  <JoditEditor
                    ref={editor}
                    config={config}
                    value={content}
                    onChange={(newContent) => {
                      contentRef.current = newContent;
                    }}
                  />
                </div>

                <div className="col-12">
                  <button
                    className="btn btn-primary w-100"
                    style={{
                      background: "#61ce70",
                      border: "none",
                      borderRadius: "24px",
                    }}
                    onClick={updateProductFunc}
                    disabled={btnLoader}
                  >
                    {btnLoader ? "Saving..." : "Update & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductUpdateStep1;
