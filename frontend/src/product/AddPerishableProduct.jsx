import React, { useEffect, useState } from "react";
import { Save, ArrowRight, Package } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AddPerishableProduct = ({ category }) => {
  const navigate = useNavigate();

  const categoryUppercase = category ? category.toUpperCase() : "";
  console.log(categoryUppercase);

  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    productCategory: categoryUppercase,
    basePrice: 0.0,
    totalStock: 0,
    currentStock: 0,
    image_url: "",
    minStockThreshold: 0,
    maxProfitMargin: 0.0,
    currentProfitMargin: 0.0,
  });

  const [perishableDetails, setPerishableDetails] = useState({
    manufacturingDate: "",
    expiryDate: "",
    maxShelfLife: 0,
    currentDailySellingRate: 0.0,
    maxExpectedSellingRate: 0.0,
    qualityScore: 0.0,
    currentDemandLevel: 0.0,
  });

  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaxShelfLifeAutoCalculated, setIsMaxShelfLifeAutoCalculated] =
    useState(false);

  useEffect(() => {
    // Calculate max shelf life when manufacturing and expiry dates change
    if (perishableDetails.manufacturingDate && perishableDetails.expiryDate) {
      const manufDate = new Date(perishableDetails.manufacturingDate);
      const expiryDate = new Date(perishableDetails.expiryDate);

      // Calculate difference in days
      const shelfLife = Math.ceil(
        (expiryDate - manufDate) / (1000 * 60 * 60 * 24)
      );

      setPerishableDetails((prev) => ({
        ...prev,
        maxShelfLife: shelfLife,
      }));
      setIsMaxShelfLifeAutoCalculated(true);
    } else {
      setIsMaxShelfLifeAutoCalculated(false);
    }
  }, [perishableDetails.manufacturingDate, perishableDetails.expiryDate]);

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

  const handlePerishableDetailsChange = (e) => {
    const { name, value } = e.target;

    // If max shelf life is auto-calculated, only allow changes to other fields
    if (isMaxShelfLifeAutoCalculated && name === "maxShelfLife") {
      return;
    }

    setPerishableDetails((prev) => ({
      ...prev,
      [name]: [
        "maxShelfLife",
        "currentDailySellingRate",
        "maxExpectedSellingRate",
        "qualityScore",
        "currentDemandLevel",
      ].includes(name)
        ? name === "maxShelfLife"
          ? parseInt(value, 10)
          : Number(parseFloat(value).toFixed(2))
        : value,
    }));
  };
  const validateProductDetails = () => {
    const requiredFields = [
      "name",
      "description",
      "basePrice",
      "totalStock",
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

  const validatePerishableDetails = () => {
    const requiredFields = [
      "manufacturingDate",
      "expiryDate",
      "maxShelfLife",
      "currentDailySellingRate",
      "maxExpectedSellingRate",
      "qualityScore",
      "currentDemandLevel",
    ];
    const missingFields = [];
    const newErrors = {};

    for (const field of requiredFields) {
      if (
        !perishableDetails[field] ||
        perishableDetails[field].toString().trim() === ""
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

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Validate all forms
    if (!validateProductDetails() || !validatePerishableDetails()) {
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
      // Second API call - Save Perishable Details
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/perishableGoods/add/${productId}`,
        {
          ...perishableDetails,
          manufacturingDate: new Date(perishableDetails.manufacturingDate)
            .toISOString()
            .split("T")[0],
          expiryDate: new Date(perishableDetails.expiryDate)
            .toISOString()
            .split("T")[0],
          currentDailySellingRate: Number(
            perishableDetails.currentDailySellingRate.toFixed(2)
          ),
          maxExpectedSellingRate: Number(
            perishableDetails.maxExpectedSellingRate.toFixed(2)
          ),
          qualityScore: Number(perishableDetails.qualityScore.toFixed(2)),
          currentDemandLevel: Number(
            perishableDetails.currentDemandLevel.toFixed(2)
          ),
          productId: productId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success notification
      enqueueSnackbar("Product added successfully!", { variant: "success" });

      // Reset forms
      setProductDetails({
        name: "",
        description: "",
        productCategory: "PERISHABLE",
        basePrice: 0.0,
        totalStock: 0,
        currentStock: 0,
        image_url: "",
        minStockThreshold: 0,
        maxProfitMargin: 0.0,
        currentProfitMargin: 0.0,
      });

      setPerishableDetails({
        manufacturingDate: "",
        expiryDate: "",
        maxShelfLife: 0,
        currentDailySellingRate: 0.0,
        maxExpectedSellingRate: 0.0,
        qualityScore: 0.0,
        currentDemandLevel: 0.0,
      });

      // Go back to first stage
      setCurrentStage(1);
    } catch (error) {
      // Error handling
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to add product. Please try again.",
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

  const formatDate = (date) => {
    if (!date) return ""; // Handle empty values
    return new Date(date).toISOString().split("T")[0]; // Converts to YYYY-MM-DD
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
          <Package className="mr-3 text-blue-600" size={36} />
          Add Perishable Product
        </h1>

        {currentStage === 1 && (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productDetails.name}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
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
                placeholder="Enter product description"
                rows="3"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Total Stock *
                </label>
                <input
                  type="number"
                  name="totalStock"
                  value={productDetails.totalStock}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total stock"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Image URL *</label>
                <input
                  type="text"
                  name="image_url"
                  value={productDetails.image_url}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product image URL"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Min Stock Threshold
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

            <div className="grid md:grid-cols-3 gap-4">
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
                  placeholder="Enter current profit margin"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Max Profit Margin
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
                  Current Profit Margin
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
                  Manufacturing Date *
                </label>
                <input
                  type="text"
                  name="manufacturingDate"
                  placeholder="YYYY-MM-DD"
                  value={perishableDetails.manufacturingDate}
                  onChange={handlePerishableDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="YYYY-MM-DD"
                  value={perishableDetails.expiryDate}
                  onChange={handlePerishableDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Max Shelf Life (Days) *
                </label>
                <input
                  type="number"
                  name="maxShelfLife"
                  value={perishableDetails.maxShelfLife}
                  onChange={handlePerishableDetailsChange}
                  disabled={isMaxShelfLifeAutoCalculated}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${
                  isMaxShelfLifeAutoCalculated
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                  placeholder="Enter max shelf life"
                />
                {isMaxShelfLifeAutoCalculated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-calculated from manufacturing and expiry dates
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Current Daily Selling Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="currentDailySellingRate"
                  value={perishableDetails.currentDailySellingRate}
                  onChange={handlePerishableDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current daily selling rate"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Max Expected Selling Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="maxExpectedSellingRate"
                  value={perishableDetails.maxExpectedSellingRate}
                  onChange={handlePerishableDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter max expected selling rate"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Quality Score *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="qualityScore"
                  value={perishableDetails.qualityScore}
                  onChange={handlePerishableDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quality score"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Current Demand Level *
              </label>
              <input
                type="number"
                step="0.01"
                name="currentDemandLevel"
                value={perishableDetails.currentDemandLevel}
                onChange={handlePerishableDetailsChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current demand level"
              />
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
                {isLoading ? "Saving..." : "Save Product"}
                {!isLoading && <Save className="ml-2" size={20} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPerishableProduct;
