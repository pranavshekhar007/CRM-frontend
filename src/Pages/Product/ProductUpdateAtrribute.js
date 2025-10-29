import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import TopNav from "../../Components/TopNav";
import {
  updateProductServ,
  getProductDetailsServ,
} from "../../services/product.services";
import { addVariantsServ } from "../../services/product.services";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

function ProductUpdateAttribute() {
  const params = useParams();
  const navigate = useNavigate();
  const [productOtherDetails, setProductOtherDetails] = useState([
    { key: "", value: [""] },
  ]);
  const [variantData, setVariantData] = useState({
    variantKey: "",
    variantValue: "",
    variantPrice: "",
    variantDiscountedPrice: "",
    variantImage: null,
  });
  const [previewImage, setPreviewImage] = useState("");

  const fetchProductDetails = async () => {
    try {
      const res = await getProductDetailsServ(params.id);
      if (res?.data?.statusCode === 200) {
        const details = res.data.data?.productOtherDetails || [
          { key: "", value: [""] },
        ];
        setProductOtherDetails(details);
      }
    } catch (err) {
      toast.error("Failed to load product attributes");
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const handleKeyChange = (index, newKey) => {
    const updated = [...productOtherDetails];
    updated[index].key = newKey;
    setProductOtherDetails(updated);
  };

  const handleValueChange = (index, valueIndex, newValue) => {
    const updated = [...productOtherDetails];
    updated[index].value[valueIndex] = newValue;
    setProductOtherDetails(updated);
  };

  const addAttribute = () => {
    setProductOtherDetails([...productOtherDetails, { key: "", value: [""] }]);
  };

  const removeAttribute = (index) => {
    const updated = productOtherDetails.filter((_, i) => i !== index);
    setProductOtherDetails(updated);
  };

  const addValue = (index) => {
    const updated = [...productOtherDetails];
    updated[index].value.push("");
    setProductOtherDetails(updated);
  };

  const removeValue = (index, valueIndex) => {
    const updated = [...productOtherDetails];
    updated[index].value.splice(valueIndex, 1);
    setProductOtherDetails(updated);
  };

  const handleSubmit = async () => {
    const finalPayload = {
      id: params?.id,
      productOtherDetails,
    };

    try {
      let response = await updateProductServ(finalPayload);
      if (response?.data?.statusCode === 200) {
        toast.success(response?.data?.message);
        navigate("/product-list");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleVariantInputChange = (e) => {
    const { name, value } = e.target;
    setVariantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setVariantData((prev) => ({ ...prev, variantImage: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleVariantSubmit = async () => {
    const formData = new FormData();
    formData.append("id", params?.id);
    formData.append("variantKey", variantData.variantKey);
    formData.append("variantValue", variantData.variantValue);
    formData.append("variantPrice", variantData.variantPrice);
    formData.append(
      "variantDiscountedPrice",
      variantData.variantDiscountedPrice
    );
    if (variantData.variantImage) {
      formData.append("variantImage", variantData.variantImage);
    }

    try {
      const res = await addVariantsServ(formData);
      if (res?.data?.statusCode === 200) {
        toast.success(res.data.message);
        setVariantData({
          variantKey: "",
          variantValue: "",
          variantPrice: "",
          variantDiscountedPrice: "",
          variantImage: null,
        });
        setPreviewImage("");
      }
    } catch (err) {
      toast.error("Failed to add variant");
    }
  };

  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Add Product" />
      <div className="mainContainer">
        <TopNav />
        <div className="p-lg-4 p-md-3 p-2">
          <h4
            className="p-2 text-dark shadow rounded mb-4"
            style={{ background: "#05E2B5" }}
          >
            Update Product Attributes : Step 4/4
          </h4>

          <h5 className="mb-3">Add Product Details</h5>
          {productOtherDetails.map((attr, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Attribute Key"
                  value={attr.key}
                  onChange={(e) => handleKeyChange(i, e.target.value)}
                />
                <button
                  className="btn btn-outline-danger btn-md"
                  onClick={() => removeAttribute(i)}
                >
                  <FaTrashAlt />
                </button>
              </div>

              {attr.value.map((val, vi) => (
                <div className="d-flex mb-2" key={vi}>
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Attribute Value"
                    value={val}
                    onChange={(e) => handleValueChange(i, vi, e.target.value)}
                  />
                  <button
                    className="btn btn-outline-danger btn-md"
                    onClick={() => removeValue(i, vi)}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => addValue(i)}
              >
                + Add Value
              </button>
            </div>
          ))}

          <button className="btn btn-success mb-4" onClick={addAttribute}>
            + Add Attribute
          </button>

          <hr />

          {/* VARIANT SECTION */}
          <h5 className="mb-3">Add Product Variant</h5>
          <div className="border p-3 rounded mb-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  name="variantKey"
                  placeholder="Variant Key"
                  className="form-control"
                  value={variantData.variantKey}
                  onChange={handleVariantInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  name="variantValue"
                  placeholder="Variant Value"
                  className="form-control"
                  value={variantData.variantValue}
                  onChange={handleVariantInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  name="variantPrice"
                  placeholder="Price"
                  className="form-control"
                  value={variantData.variantPrice}
                  onChange={handleVariantInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  name="variantDiscountedPrice"
                  placeholder="Discounted Price"
                  className="form-control"
                  value={variantData.variantDiscountedPrice}
                  onChange={handleVariantInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>
              {previewImage && (
                <div className="col-md-6 mb-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    width="100"
                    className="rounded shadow"
                  />
                </div>
              )}
            </div>
            <button className="btn btn-info" onClick={handleVariantSubmit}>
              + Add Variant
            </button>
          </div>

          <button
            className="btn btn-primary w-100"
            style={{
              background: "#61ce70",
              border: "none",
              borderRadius: "24px",
            }}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductUpdateAttribute;
