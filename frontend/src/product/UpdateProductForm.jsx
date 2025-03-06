import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useState, useEffect } from "react";

const UpdateProductForm = ({
  onClose,
  product: initialProduct,
  fetchProducts,
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("initialProduct", initialProduct);

  // Initialize form with product data from props
  useEffect(() => {
    if (initialProduct) {
      // Transform the product data if needed to match expected format
      const formattedProduct = {
        ...initialProduct,
        name: initialProduct.productName || initialProduct.name,
        description: initialProduct.description || "",
        // Add category-specific data structures based on the product category
        ...(initialProduct.productCategory === "PERISHABLE" && {
          perishableGood: {
            expiryDate:
              initialProduct.expiryDate ||
              initialProduct.perishableGood?.expiryDate ||
              "",
            manufacturingDate:
              initialProduct.manufacturingDate ||
              initialProduct.perishableGood?.manufacturingDate ||
              "",
          },
        }),
        ...(initialProduct.productCategory === "EVENT" && {
          eventProduct: {
            eventDate:
              initialProduct.eventDate ||
              initialProduct.eventProduct?.eventDate ||
              "",
          },
        }),
        ...(initialProduct.productCategory === "SUBSCRIPTION" && {
          subscriptionService: {
            renewalRate:
              initialProduct.renewalRate ||
              initialProduct.subscriptionService?.renewalRate ||
              0,
            totalSubscribers:
              initialProduct.totalSubscribers ||
              initialProduct.subscriptionService?.totalSubscribers ||
              0,
            activeSubscribers:
              initialProduct.activeSubscribers ||
              initialProduct.subscriptionService?.activeSubscribers ||
              0,
          },
        }),
      };

      setProduct(formattedProduct);
      setLoading(false);
    }
  }, [initialProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProduct({
        ...product,
        [parent]: {
          ...product[parent],
          [child]: value,
        },
      });
    } else {
      setProduct({
        ...product,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/products/updateByProductId/${
          product.productId
        }`,
        product,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      fetchProducts();

      enqueueSnackbar("Product updated successfully!", { variant: "success" });
      onClose(); // Close the popup after successful update
    } catch (error) {
      console.error("Error updating product:", error);
      enqueueSnackbar("Failed to update product. Please try again.", {
        variant: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Loading product data...</div>
        </div>
      </div>
    );
  }

  // Helper function to get a readable category name
  const getCategoryDisplayName = (categoryCode) => {
    const categoryMap = {
      PERISHABLE: "Perishable Good",
      EVENT: "Event-based Product",
      SUBSCRIPTION: "Subscription Service",
      SEASONAL: "Seasonal Product",
    };
    return categoryMap[categoryCode] || categoryCode;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Popup Content */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Update Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <input
                  type="text"
                  value={getCategoryDisplayName(product.productCategory)}
                  className="w-full p-2 border rounded bg-gray-100"
                  disabled
                />
                <input
                  type="hidden"
                  name="productCategory"
                  value={product.productCategory}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={product.description || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            {/* Pricing and Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={product.basePrice || 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {product.productCategory === "PERISHABLE" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      value={product.currentStock || 0}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      name="totalStock"
                      value={product.totalStock || 0}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* ADDED: Missing Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock Threshold
                </label>
                <input
                  type="number"
                  name="minStockThreshold"
                  value={product.minStockThreshold || 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Profit Margin
                </label>
                <input
                  type="number"
                  name="maxProfitMargin"
                  value={product.maximumProfitMargin || 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Profit Margin
                </label>
                <input
                  type="number"
                  name="currentProfitMargin"
                  value={product.currentProfitMargin || 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Display Last Updated Time (Read-only) */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <input
                type="text"
                value={new Date(product.updatedAt).toLocaleString()}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>

            {/* Category-specific fields */}
            {product.productCategory === "PERISHABLE" &&
              product.perishableGood && (
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Perishable Good Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturing Date
                      </label>
                      <input
                        type="date"
                        name="perishableGood.manufacturingDate"
                        value={product.perishableGood.manufacturingDate || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="perishableGood.expiryDate"
                        value={product.perishableGood.expiryDate || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

            {product.productCategory === "EVENT" && product.eventProduct && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-4">Event Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventProduct.eventDate"
                    value={
                      product.eventProduct.eventDate
                        ? product.eventProduct.eventDate.substring(0, 16)
                        : ""
                    }
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}

            {product.productCategory === "SUBSCRIPTION" &&
              product.subscriptionService && (
                <div className="border-t pt-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Subscription Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renewal Rate
                      </label>
                      <input
                        type="number"
                        name="subscriptionService.renewalRate"
                        value={product.subscriptionService.renewalRate || 0}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Subscribers
                      </label>
                      <input
                        type="number"
                        name="subscriptionService.totalSubscribers"
                        value={
                          product.subscriptionService.totalSubscribers || 0
                        }
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Active Subscribers
                      </label>
                      <input
                        type="number"
                        name="subscriptionService.activeSubscribers"
                        value={
                          product.subscriptionService.activeSubscribers || 0
                        }
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProductForm;
