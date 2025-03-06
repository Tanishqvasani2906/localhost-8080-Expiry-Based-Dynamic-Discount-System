import React, { useEffect, useState } from "react";
import { Save, ArrowRight, Calendar } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AddEventProduct = ({ category }) => {
  const navigate = useNavigate();

  const categoryUppercase = category ? category.toUpperCase() : "EVENT";

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

  const [eventDetails, setEventDetails] = useState({
    eventDate: "",
    eventVenue: "",
    totalCapacity: 0,
    seatsBooked: 0,
    minTicketPrice: 0.0,
    maxTicketPrice: 0.0,
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

  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({
      ...prev,
      [name]: ["totalCapacity", "seatsBooked"].includes(name)
        ? parseInt(value, 10)
        : ["minTicketPrice", "maxTicketPrice"].includes(name)
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

  const validateEventDetails = () => {
    const requiredFields = [
      "eventDate",
      "eventVenue",
      "totalCapacity",
      "seatsBooked",
      "minTicketPrice",
      "maxTicketPrice",
    ];
    const missingFields = [];
    const newErrors = {};

    for (const field of requiredFields) {
      if (
        !eventDetails[field] ||
        eventDetails[field].toString().trim() === ""
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
    if (!validateProductDetails() || !validateEventDetails()) {
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
      // Second API call - Save Event Details
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/eventProducts/add/${productId}`,
        {
          ...eventDetails,
          minTicketPrice: Number(eventDetails.minTicketPrice.toFixed(2)),
          maxTicketPrice: Number(eventDetails.maxTicketPrice.toFixed(2)),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success notification
      enqueueSnackbar("Event product added successfully!", {
        variant: "success",
      });

      // Reset forms
      setProductDetails({
        name: "",
        description: "",
        productCategory: "EVENT",
        basePrice: 0.0,
        totalStock: 0,
        currentStock: 0,
        image_url: "",
        minStockThreshold: 0,
        maxProfitMargin: 0.0,
        currentProfitMargin: 0.0,
      });

      setEventDetails({
        eventDate: "",
        eventVenue: "",
        totalCapacity: 0,
        seatsBooked: 0,
        minTicketPrice: 0.0,
        maxTicketPrice: 0.0,
      });

      // Go back to first stage
      setCurrentStage(1);
    } catch (error) {
      console.error("Error adding event product:", error);
      // Error handling
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to add event product. Please try again.",
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
          <Calendar className="mr-3 text-blue-600" size={36} />
          Add Event Product
        </h1>

        {currentStage === 1 && (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={productDetails.name}
                  onChange={handleProductDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event name"
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
                placeholder="Enter event description"
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
                  placeholder="Event image URL"
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
                  Event Date and Time *
                </label>
                <input
                  type="text"
                  name="eventDate"
                  placeholder="YYYY-MM-DDTHH:MM:SS"
                  value={eventDetails.eventDate}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: YYYY-MM-DDTHH:MM:SS
                </p>
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Event Venue *
                </label>
                <input
                  type="text"
                  name="eventVenue"
                  value={eventDetails.eventVenue}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter venue name and location"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Total Capacity *
                </label>
                <input
                  type="number"
                  name="totalCapacity"
                  value={eventDetails.totalCapacity}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total capacity"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Seats Booked *
                </label>
                <input
                  type="number"
                  name="seatsBooked"
                  value={eventDetails.seatsBooked}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter seats booked"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  Minimum Ticket Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="minTicketPrice"
                  value={eventDetails.minTicketPrice}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter minimum ticket price"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  Maximum Ticket Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="maxTicketPrice"
                  value={eventDetails.maxTicketPrice}
                  onChange={handleEventDetailsChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter maximum ticket price"
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
                {isLoading ? "Saving..." : "Save Event"}
                {!isLoading && <Save className="ml-2" size={20} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddEventProduct;
