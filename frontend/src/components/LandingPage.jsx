import { useState, useEffect } from "react";
import axios from "axios";
import {
  Tag,
  Box,
  Calendar,
  Repeat,
  Snowflake,
  Check,
  BarChart,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import UpdateProductForm from "../product/UpdateProductForm";

const categoryIcons = {
  Perishable: Box,
  "Event-based Products": Calendar,
  "Subscription Services": Repeat,
  "Seasonal Products": Snowflake,
};

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin
    if (localStorage.getItem("Token")) {
      try {
        const decodedToken = jwtDecode(localStorage.getItem("Token"));
        if (decodedToken.roles === "ADMIN") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    // Function which call every second
    const interval = setInterval(() => {
      if (localStorage.getItem("Token")) {
        try {
          const decodedToken = jwtDecode(localStorage.getItem("Token"));
          if (decodedToken.exp * 1000 < Date.now()) {
            handleLogout();
          } else {
            if (decodedToken.roles === "ADMIN") {
              setIsAdmin(true);
            }
          }
        } catch (error) {
          console.error("Error checking token:", error);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setIsAdmin(false);
    navigate("/login");
  };

  const handleEditProduct = () => {
    setIsEditPopupOpen(!isEditPopupOpen);
    // fetchProducts();
  };

  // const handleDeleteProduct = async (productId) => {
  //   if (window.confirm("Are you sure you want to delete this product?")) {
  //     try {
  //       await axios.delete(
  //         `${
  //           import.meta.env.VITE_BACKEND_URL
  //         }/products/deleteProduct/${productId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("Token")}`,
  //           },
  //         }
  //       );
  //       // Refresh products after deletion
  //       fetchProducts();
  //     } catch (error) {
  //       console.error("Error deleting product:", error);
  //       alert("Failed to delete product. Please try again.");
  //     }
  //   }
  // };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/products/getAllProducts`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Token")) {
      fetchProducts();
    } else {
      setIsLoading(false); // Ensure loading state is false if not logged in
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSearchQuery(queryParams.get("search") || "");
  }, [location.search]);

  const categories = [
    ...Array.from(
      new Set(products.map((product) => product.productCategory))
    ).map((category) => ({
      name: category,
      icon: categoryIcons[category] || Box,
    })),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.productCategory === selectedCategory;
    const matchesSearch =
      product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCategory
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const discountStrategies = [
    {
      name: "Perishable Goods",
      description: "Discounts increase as expiry approaches to prevent waste.",
      status: "Implemented",
      icon: Box,
    },
    {
      name: "Event-Based Products",
      description:
        "Prices increase as event dates approach, with rare last-minute discounts.",
      status: "Implemented",
      icon: Calendar,
    },
    {
      name: "Subscription Services",
      description:
        "Discounts based on user behavior, engagement, and renewal history.",
      status: "Implemented",
      icon: Repeat,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-6 px-6 py-2 bg-blue-100 rounded-full text-blue-800 font-semibold"
            >
              Expiry Based Dynamic Discount System
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
              Dynamic Discounts Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Discover amazing deals on products across various categories{" "}
            </p>

            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <a
                href="#categories"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full hover:shadow-lg transition-all flex items-center"
              >
                Explore Categories <ChevronRight className="ml-2" size={18} />
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-blue-600 font-medium rounded-full border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all flex items-center"
              >
                How It Works <ChevronRight className="ml-2" size={18} />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-16 left-0 w-full h-32 bg-gradient-to-b from-transparent to-white z-10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400 rounded-full filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Category Selection */}
      <div id="categories" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Explore Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our wide selection of products across different categories,
            each with its own unique dynamic pricing model
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`p-8 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedCategory === category.name
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-200"
                  : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-blue-200"
              }`}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <category.icon
                className={`w-12 h-12 mx-auto mb-4 ${
                  selectedCategory === category.name
                    ? "text-white"
                    : "text-blue-600"
                }`}
              />
              <p className="font-medium text-lg text-center">{category.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing deals on high-quality products with dynamic
            discounts
          </p>
        </motion.div>

        {localStorage.getItem("Token") ? (
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <AnimatePresence>
                {filteredProducts.map((product, index) => {
                  return (
                    <motion.article
                      key={product.productId}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{
                        y: -8,
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <div className="relative h-72 overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        {product.productCategory !== "EVENT" && (
                          <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-md">
                            <span className="text-blue-600 font-bold">
                              {Math.floor(
                                ((product.basePrice - product.discountedPrice) *
                                  100) /
                                  product.basePrice
                              )}
                              % OFF
                            </span>
                          </div>
                        )}

                        {/* Admin Controls */}
                        {isAdmin && (
                          <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product.productId);
                                setSelectedProduct(product);
                              }}
                              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
                              aria-label="Edit product"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            {product.productCategory}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 line-clamp-1">
                          {product.productName}
                        </h3>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            {product.productCategory !== "EVENT" && (
                              <span className="text-gray-400 line-through">
                                ₹{product.basePrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-indigo-600 ml-2">
                              ₹{product.discountedPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )
        ) : (
          <div className="text-center">
            <p className="bg-red-100 text-red-800 border border-red-300 rounded-lg p-4 mt-5 text-xl font-semibold">
              Please login to view products.
            </p>
          </div>
        )}
      </div>
      {/* How It Works */}
      <div id="how-it-works" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            How Our Discounts Work
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform uses advanced algorithms to determine the
            optimal discount for each product
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {discountStrategies.map((strategy, index) => (
            <motion.div
              key={strategy.name}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <strategy.icon className="w-8 h-8" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
                <p className="text-gray-600 mb-3">{strategy.description}</p>
                <div className="flex items-center">
                  {strategy.status === "Implemented" ? (
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Check className="w-4 h-4 mr-1" />
                      Live & Active
                    </div>
                  ) : (
                    <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      <BarChart className="w-4 h-4 mr-1" />
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* About Us */}
      <motion.div
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-12 md:p-16 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              About Us
            </h2>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
              We're revolutionizing e-commerce by combining smart pricing
              algorithms with sustainability. Our platform helps businesses
              reduce waste while offering consumers incredible deals on premium
              products nearing their expiry dates or seasonal transitions.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a
                href="#"
                className="px-8 py-4 bg-white text-blue-600 font-medium rounded-full hover:shadow-lg transition-all flex items-center justify-center"
              >
                Learn More <ChevronRight className="ml-2" size={18} />
              </a>
              <a
                href="#"
                className="px-8 py-4 bg-transparent text-white font-medium rounded-full border-2 border-white/30 hover:bg-white/10 hover:shadow-lg transition-all flex items-center justify-center"
              >
                Contact Us <ChevronRight className="ml-2" size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-blue-600 font-semibold">Team LOCALHOST:8080</p>
        </div>
      </motion.div>

      {isEditPopupOpen && (
        <UpdateProductForm
          onClose={handleEditProduct}
          product={selectedProduct}
          fetchProducts={fetchProducts}
        />
      )}
    </div>
  );
};

export default LandingPage;
