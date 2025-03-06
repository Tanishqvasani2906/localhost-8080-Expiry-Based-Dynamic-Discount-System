import React, { useState } from "react";
import AddPerishableProduct from "./AddPerishableProduct";
import AddEventProduct from "./AddEventProduct";
import AddSubscriptionProduct from "./AddSubscriptionProduct";

const AddProduct = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  // Updated categories as requested
  const categories = [
    { id: "perishable", name: "Perishable" },
    { id: "event", name: "Event" },
    { id: "subscription", name: "Subscription" },
  ];

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Product Information Form
      </h2>

      {/* Category Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">
          Select a product type to continue:
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`p-4 rounded-md text-center transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Container - Only visible when a category is selected */}
      {selectedCategory && (
        <div className="border-t pt-6">
          {/* Perishable Form */}
          {selectedCategory === "perishable" && (
            <AddPerishableProduct category={selectedCategory} />
          )}

          {/* Event Form */}
          {selectedCategory === "event" && (
            <AddEventProduct category={selectedCategory} />
          )}

          {/* Subscription Form */}
          {selectedCategory === "subscription" && (
            <AddSubscriptionProduct category={selectedCategory} />
          )}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
