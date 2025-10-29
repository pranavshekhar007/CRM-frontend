import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../../Components/Sidebar";
import TopNav from "../../../Components/TopNav";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import JoditEditor from "jodit-react";

import { useParams, useNavigate } from "react-router-dom";
import {
  getComboProductDetailsServ,
  updateComboProductServ,
} from "../../../services/comboProduct.services";
function ComboProductUpdateStep2() {
  const params = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [_id, setId] = useState("");
  const [btnLoader, setBtnLoader] = useState(false);
  const contentRef = useRef("");
  const [showPackServingWarning, setShowPackServingWarning] = useState(false);
  const [proceedAnyway, setProceedAnyway] = useState(false);

  // Jodit Editor Config
  const config = {
    placeholder: "Start typing...",
    height: "400px",
  };
  const [formData, setFormData] = useState({
    stockQuantity: "",
    longDescription: "",
  });

  const getProductDetails = async () => {
    try {
      let response = await getComboProductDetailsServ(params?.id);
      if (response?.data?.statusCode === 200) {
        const product = response?.data?.data;
        setFormData({
          stockQuantity: product?.stockQuantity || "",
          longDescription: product?.longDescription || "",
        });
        setContent(product?.longDescription || "");
        contentRef.current = product?.longDescription || "";
      }
    } catch (error) {
      toast.error("Failed to fetch product details.");
    }
  };

  useEffect(() => {
    // getBrandList();
    getProductDetails();
  }, []);

  const updateProductFunc = async () => {
    setBtnLoader(true);
    try {
      let updatedData = {
        ...formData,
        longDescription: contentRef.current,
        id: params?.id,
      };
      let response = await updateComboProductServ(updatedData);
      if (response?.data?.statusCode == "200") {
        toast.success("Combo Product Step 2 Updated Successfully!");
        setFormData({
          stockQuantity: "",
          longDescription: "",
        });
        navigate("/update-combo-product-step3/" + response?.data?.data?._id);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Internal Server Error");
    }
    setBtnLoader(false);
  };
  return (
    <div className="bodyContainer">
      <Sidebar selectedMenu="Product Management" selectedItem="Add Combo Packs" />
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
                    Update Combo Packs : Step 2/3
                  </h4>
                </div>
              </div>
              <div className="row">
                <div className="col-4 mb-3">
                  <label>Stock Quantity</label>
                  <input
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: e?.target.value,
                      })
                    }
                    value={formData?.stockQuantity}
                    className="form-control"
                  />
                </div>

                <hr />

                {/* <div className="col-12 mb-3">
                  <label>Product Description</label>
                  <JoditEditor
                    ref={editor}
                    config={config}
                    value={content}
                    onChange={(newContent) => {
                      contentRef.current = newContent;
                    }}
                  />
                </div> */}
                {btnLoader ? (
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
                      Updating ...
                    </button>
                  </div>
                ) : (
                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      style={{
                        background: "#61ce70",
                        border: "none",
                        borderRadius: "24px",
                      }}
                      onClick={() => updateProductFunc()}
                      disabled={showPackServingWarning && !proceedAnyway}
                    >
                      Update
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

export default ComboProductUpdateStep2;
