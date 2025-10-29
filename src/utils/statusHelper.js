export const getStatusOptions = (currentStatus, shippingMethod) => {
    const normal = (s = "") => s.trim().toLowerCase();
    const normalized = normal(shippingMethod); // "homedelivery" | "lorrypay" | ""
    const shippingText =
      normalized === "homedelivery"
        ? "Home Delivery"
        : normalized === "lorrypay"
        ? "Lorry Pay"
        : shippingMethod || "Unknown";
  
    switch (currentStatus) {
      case "pending":
        return [
          { label: "Order Received", value: "pending" },
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Cancelled", value: "cancelled" },
        ];
  
      case "paymentSsUpload":
        return [
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Payment Confirmed", value: "approved" },
          { label: "Payment Rejected", value: "ssRejected" },
          { label: "Cancelled", value: "cancelled" },
        ];
  
      case "approved":
      case "orderPlaced":
        return [
          { label: "Payment Confirm", value: "orderPlaced" },
          { label: "Order Packed", value: "orderPacked" },
          { label: "Cancelled", value: "cancelled" },
        ];
  
      case "orderPacked":
        return [
          { label: "Order Packed", value: "orderPacked" },
          { label: "Order Dispatch", value: "outForDelivery" },
          { label: "Cancelled", value: "cancelled" },
        ];
  
      case "outForDelivery":
        return [
          { label: `Order Dispatch - ${shippingText}`, value: "outForDelivery" },
          { label: "Order Completed", value: "completed" },
        ];
  
      case "completed":
        return [{ label: "Order Completed", value: "completed" }];
  
      case "cancelled":
        return [{ label: "Order Cancelled", value: "cancelled" }];
  
      case "ssRejected":
        return [
          { label: "Payment Rejected", value: "ssRejected" },
          { label: "Payment Details Uploaded", value: "paymentSsUpload" },
          { label: "Cancelled", value: "cancelled" },
        ];
  
      default:
        return [
          { label: "Select Status", value: "" },
          { label: "Order Received", value: "pending" },
          { label: "Cancelled", value: "cancelled" },
        ];
    }
  };
  