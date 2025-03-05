import React, { useState } from "react";
import { Info, Save, ArrowRight, Package } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

const AddProduct = () => {
  // State for first form
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    productCategory: "PERISHABLE",
    basePrice: "",
    totalStock: "",
    currentStock: "",
    image_url: "",
    minStockThreshold: "",
    maxProfitMargin: "",
    currentProfitMargin: "",
  });

  // State for second form
  const [productMetadata, setProductMetadata] = useState({
    productId: "",
    expiryDate: "",
    manufacturingDate: "",
    storageTemperature: "",
  });

  // State to manage form stages and loading
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes for first form
  const handleFirstFormChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: name.includes("Margin")
        ? parseFloat(value)
        : name.includes("Stock")
        ? parseInt(value)
        : value,
    }));
  };

  // Handle input changes for second form
  const handleSecondFormChange = (e) => {
    const { name, value } = e.target;
    setProductMetadata((prev) => ({
      ...prev,
      [name]:
        name === "storageTemperature"
          ? value === ""
            ? null
            : parseInt(value)
          : value,
    }));
  };

  // Comprehensive validation for both forms
  const validateAllForms = () => {
    // First form validations
    const firstFormRequiredFields = [
      "name",
      "description",
      "basePrice",
      "totalStock",
      "image_url",
    ];

    const firstFormMissingFields = firstFormRequiredFields.filter(
      (field) =>
        !productDetails[field] || productDetails[field].toString().trim() === ""
    );

    if (firstFormMissingFields.length > 0) {
      enqueueSnackbar(
        `Please fill in the following fields in first form: ${firstFormMissingFields.join(
          ", "
        )}`,
        { variant: "error" }
      );
      return false;
    }

    // Base price validation
    if (parseFloat(productDetails.basePrice) <= 0) {
      enqueueSnackbar("Base price must be greater than 0", {
        variant: "error",
      });
      return false;
    }

    // Ensure currentStock is set to totalStock
    setProductDetails((prev) => ({
      ...prev,
      currentStock: prev.totalStock,
    }));

    // Second form validations
    const secondFormRequiredFields = ["expiryDate", "manufacturingDate"];

    const secondFormMissingFields = secondFormRequiredFields.filter(
      (field) =>
        !productMetadata[field] ||
        productMetadata[field].toString().trim() === ""
    );

    if (secondFormMissingFields.length > 0) {
      enqueueSnackbar(
        `Please fill in the following fields in second form: ${secondFormMissingFields.join(
          ", "
        )}`,
        { variant: "error" }
      );
      return false;
    }

    // Date validations
    const manufacturingDate = new Date(productMetadata.manufacturingDate);
    const expiryDate = new Date(productMetadata.expiryDate);

    if (manufacturingDate > expiryDate) {
      enqueueSnackbar("Manufacturing date cannot be after expiry date", {
        variant: "error",
      });
      return false;
    }

    return true;
  };
  // Handle final submission with two-step API call
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Validate all forms
    if (!validateAllForms()) {
      return;
    }

    setIsLoading(true);

    try {
      // First API call - Save Product Details
      const firstApiResponse = await axios.post("/api/products/details", {
        ...productDetails,
        currentStock: productDetails.totalStock,
      });

      // Check if first API call was successful and we got a product ID
      if (!firstApiResponse.data.productId) {
        throw new Error("Product ID not generated");
      }

      // Update product metadata with generated product ID
      const productId = firstApiResponse.data.productId;

      // Second API call - Save Product Metadata
      await axios.post("/api/products/metadata", {
        ...productMetadata,
        productId: productId,
      });

      // Success notification
      enqueueSnackbar("Product added successfully!", { variant: "success" });

      // Reset forms
      setProductDetails({
        name: "",
        description: "",
        productCategory: "PERISHABLE",
        basePrice: "",
        totalStock: "",
        currentStock: "",
        image_url: "",
        minStockThreshold: "",
        maxProfitMargin: "",
        currentProfitMargin: "",
      });

      setProductMetadata({
        productId: "",
        expiryDate: "",
        manufacturingDate: "",
        storageTemperature: "",
      });

      // Go back to first stage
      setCurrentStage(1);
    } catch (error) {
      // Error handling
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to add product. Please try again.",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
            <Package className="mr-3 text-blue-600" size={36} />
            Add Perishable Product
          </h1>

          {currentStage === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentStage(2);
              }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productDetails.name}
                    onChange={handleFirstFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Base Price</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={productDetails.basePrice}
                    onChange={handleFirstFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter base price"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">Description</label>
                <textarea
                  name="description"
                  value={productDetails.description}
                  onChange={handleFirstFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product description"
                  rows="3"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    value={productDetails.totalStock}
                    onChange={handleFirstFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Total stock"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Image URL</label>
                  <input
                    type="text"
                    name="image_url"
                    value={productDetails.image_url}
                    onChange={handleFirstFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product image URL"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
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
                    Manufacturing Date
                  </label>
                  <input
                    type="datetime-local"
                    name="manufacturingDate"
                    value={productMetadata.manufacturingDate}
                    onChange={handleSecondFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={productMetadata.expiryDate}
                    onChange={handleSecondFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Storage Temperature (°C){" "}
                  <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="storageTemperature"
                  value={productMetadata.storageTemperature || ""}
                  onChange={handleSecondFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter storage temperature (optional)"
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
    </div>
  );
};

export default AddProduct;
