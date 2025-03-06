import React, { useEffect, useState } from "react";
import { Save, ArrowRight, Bookmark } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AddSubscriptionProduct = ({ category }) => {
  const navigate = useNavigate();

  const categoryUppercase = category ? category.toUpperCase() : "SUBSCRIPTION";

  const [productDetails, setProductDetails] = useState({
    name: "Premium Subscription - 2025",
    description:
      "Get access to exclusive content with our premium subscription.",
    productCategory: "SUBSCRIPTION",
    basePrice: 120.0,
    totalStock: 500,
    currentStock: 300,
    image_url: "",
    minStockThreshold: 50,
    maxProfitMargin: 0.4,
    currentProfitMargin: 0.35,
  });

  const [subscriptionDetails, setSubscriptionDetails] = useState({
    standardDurationDays: 365,
    gracePeriodDays: 7,
    totalSubscribers: 5000,
    activeSubscribers: 4000,
    renewalRate: 0.85,
    averageSubscriptionLength: 300,
  });

  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("Token")) {
      const decodedToken = jwtDecode(localStorage.getItem("Token"));

      if (decodedToken.roles !== "ADMIN") {
        navigate("/");
      }
    }
  }, []);

  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]:
        name.includes("ProfitMargin") || name === "basePrice"
          ? Number(parseFloat(value).toFixed(2))
          : name.includes("Stock")
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleSubscriptionDetailsChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionDetails((prev) => ({
      ...prev,
      [name]: [
        "standardDurationDays",
        "gracePeriodDays",
        "totalSubscribers",
        "activeSubscribers",
        "averageSubscriptionLength",
      ].includes(name)
        ? parseInt(value, 10)
        : ["renewalRate"].includes(name)
        ? Number(parseFloat(value).toFixed(2))
        : value,
    }));
  };

  const validateProductDetails = () => {
    const requiredFields = [
      "name",
      "description",
      "basePrice",
      "image_url",
      "minStockThreshold",
      "maxProfitMargin",
      "currentProfitMargin",
    ];
    const missingFields = [];
    const newErrors = {};

    for (const field of requiredFields) {
      if (
        !productDetails[field] ||
        productDetails[field].toString().trim() === ""
      ) {
        newErrors[field] = `Please fill in the ${field} field`;
        const readableField = field
          .replace("_", " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        missingFields.push(readableField);
      }
    }

    if (missingFields.length > 0) {
      enqueueSnackbar(`Please fill in: ${missingFields.join(", ")}`, {
        variant: "error",
      });
    }

    return missingFields.length === 0;
  };

  const validateSubscriptionDetails = () => {
    const requiredFields = [
      "standardDurationDays",
      "gracePeriodDays",
      "totalSubscribers",
      "activeSubscribers",
      "renewalRate",
      "averageSubscriptionLength",
    ];
    const missingFields = [];
    const newErrors = {};

    for (const field of requiredFields) {
      if (
        (!subscriptionDetails[field] && subscriptionDetails[field] !== 0) ||
        subscriptionDetails[field].toString().trim() === ""
      ) {
        newErrors[field] = `Please fill in the ${field} field`;
        const readableField = field
          .replace(/([A-Z])/g, " $1")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        missingFields.push(readableField);
      }
    }

    if (missingFields.length > 0) {
      enqueueSnackbar(`Please fill in: ${missingFields.join(", ")}`, {
        variant: "error",
      });
    }

    return missingFields.length === 0;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Validate all forms
    if (!validateProductDetails() || !validateSubscriptionDetails()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("Token");

      // First API call - Save Product Details
      const firstApiResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products/addProduct`,
        {
          ...productDetails,
          basePrice: Number(productDetails.basePrice.toFixed(2)),
          maxProfitMargin: Number(productDetails.maxProfitMargin.toFixed(2)),
          currentProfitMargin: Number(
            productDetails.currentProfitMargin.toFixed(2)
          ),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if first API call was successful and we got a product ID
      if (!firstApiResponse.data.product_id) {
        throw new Error("Product ID not generated");
      }

      // Update product metadata with generated product ID
      const productId = firstApiResponse.data.product_id;
      // Second API call - Save Subscription Details
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/subscriptions/subscriptionProducts/add/${productId}`,
        {
          ...subscriptionDetails,
          renewalRate: Number(subscriptionDetails.renewalRate.toFixed(2)),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success notification
      enqueueSnackbar("Subscription product added successfully!", {
        variant: "success",
      });

      // Reset forms
      setProductDetails({
        name: "",
        description: "",
        productCategory: "SUBSCRIPTION",
        basePrice: 0.0,
        totalStock: 0,
        currentStock: 0,
        image_url: "",
        minStockThreshold: 0,
        maxProfitMargin: 0.0,
        currentProfitMargin: 0.0,
      });

      setSubscriptionDetails({
        standardDurationDays: 0,
        gracePeriodDays: 0,
        totalSubscribers: 0,
        activeSubscribers: 0,
        renewalRate: 0.0,
        averageSubscriptionLength: 0,
      });

      // Go back to first stage
      setCurrentStage(1);
    } catch (error) {
      console.error("Error adding subscription product:", error);
      // Error handling
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to add subscription product. Please try again.",
        {
          variant: "error",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const moveToSecondStage = () => {
    if (validateProductDetails()) {
      setCurrentStage(2);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
          <Bookmark className="mr-3 text-blue-600" size={36} />
          Add Subscription Product
        </h1>

        {currentStage === 1 && (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Subscription Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productDetails.name}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subscription name"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Base Price *</label>
                <input
                  type="number"
                  step="0.01"
                  name="basePrice"
                  value={productDetails.basePrice}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter base price"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Description *</label>
              <textarea
                name="description"
                value={productDetails.description}
                onChange={handleProductDetailsChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subscription description"
                rows="3"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Image URL *</label>
                <input
                  type="text"
                  name="image_url"
                  value={productDetails.image_url}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subscription image URL"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Min Stock Threshold *
                </label>
                <input
                  type="number"
                  name="minStockThreshold"
                  value={productDetails.minStockThreshold}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter min stock threshold"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Total Stock</label>
                <input
                  type="number"
                  name="totalStock"
                  value={productDetails.totalStock}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total stock"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={productDetails.currentStock}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current stock"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Max Profit Margin *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="maxProfitMargin"
                  value={productDetails.maxProfitMargin}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter max profit margin"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Current Profit Margin *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="currentProfitMargin"
                  value={productDetails.currentProfitMargin}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current profit margin"
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={moveToSecondStage}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center mx-auto"
              >
                Next Step <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </form>
        )}

        {currentStage === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Standard Duration (days) *
                </label>
                <input
                  type="number"
                  name="standardDurationDays"
                  value={subscriptionDetails.standardDurationDays}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter standard duration in days"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Grace Period (days) *
                </label>
                <input
                  type="number"
                  name="gracePeriodDays"
                  value={subscriptionDetails.gracePeriodDays}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter grace period in days"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Total Subscribers *
                </label>
                <input
                  type="number"
                  name="totalSubscribers"
                  value={subscriptionDetails.totalSubscribers}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total subscribers"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Active Subscribers *
                </label>
                <input
                  type="number"
                  name="activeSubscribers"
                  value={subscriptionDetails.activeSubscribers}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter active subscribers"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Renewal Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="renewalRate"
                  value={subscriptionDetails.renewalRate}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter renewal rate (0-1)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: Value between 0 and 1 (e.g., 0.85 for 85%)
                </p>
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Average Subscription Length (days) *
                </label>
                <input
                  type="number"
                  name="averageSubscriptionLength"
                  value={subscriptionDetails.averageSubscriptionLength}
                  onChange={handleSubscriptionDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter average subscription length in days"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStage(1)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Subscription"}
                {!isLoading && <Save className="ml-2" size={20} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddSubscriptionProduct;
