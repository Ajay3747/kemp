import React, { useState, useEffect } from "react";
import ProductDetailModal from "../components/ProductDetailModal";
import { getApiUrl } from "../utils/api";

const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x200?text=No+Image";
  return url;
};

export default function Buying() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeStore, setActiveStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = ["All", "Books", "Gadgets", "Notes", "Courses", "Music", "Electronics", "Apparel", "Sports", "Furniture", "Dorm Essentials", "Services", "Other"];

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleProductRemoved = (event) => {
      const removedId = event?.detail?.productId;
      if (!removedId) return;
      setProducts((prev) => prev.filter((product) => product._id !== removedId));
      if (activeProduct?._id === removedId) {
        setActiveProduct(null);
      }
    };

    window.addEventListener('product-removed', handleProductRemoved);
    return () => window.removeEventListener('product-removed', handleProductRemoved);
  }, [activeProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`${API_URL}/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log("Products fetched:", data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Error: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      product.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stores = filteredProducts.reduce((acc, product) => {
    const sellerIdValue = product.sellerId && typeof product.sellerId === "object"
      ? product.sellerId._id
      : product.sellerId;

    if (!sellerIdValue) return acc;

    const sellerNameValue = product.sellerName
      || (product.sellerId && typeof product.sellerId === "object" ? product.sellerId.username : null)
      || "CampusKART Store";

    const sellerEmailValue = product.sellerEmail
      || (product.sellerId && typeof product.sellerId === "object" ? product.sellerId.collegeEmail : null);

    if (!acc[sellerIdValue]) {
      acc[sellerIdValue] = {
        sellerId: sellerIdValue,
        sellerName: sellerNameValue,
        sellerEmail: sellerEmailValue,
        products: [],
        coverImage: product.imageUrl
      };
    }
    acc[sellerIdValue].products.push(product);
    if (!acc[sellerIdValue].coverImage && product.imageUrl) {
      acc[sellerIdValue].coverImage = product.imageUrl;
    }
    return acc;
  }, {});

  const storeList = Object.values(stores);
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">CampusKART - Buy Items</h1>

      {error && (
        <div className="mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2.5 sm:p-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-yellow-400 w-full"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2.5 sm:p-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-yellow-400 w-full"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg sm:text-xl text-gray-400">Loading products...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {isSearching ? (
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-900 p-4 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition"
                    onClick={() => setActiveProduct(product)}
                  >
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                      }}
                    />
                    <h3 className="text-white font-bold text-lg">{product.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{product.category}</p>
                    <div className="flex justify-end items-center mb-2">
                      <span className="text-gray-500 text-sm">{product.condition}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">Seller: {product.sellerName}</p>
                    {product.averageRating > 0 && (
                      <p className="text-yellow-300 text-sm">⭐ {product.averageRating} ({product.totalReviews} reviews)</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  No products found
                </div>
              )
            ) : storeList.length > 0 ? (
              storeList.map((store) => (
                <div
                  key={store.sellerId}
                  className="bg-gray-900 p-4 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => setActiveStore(store)}
                >
                  <img
                    src={getImageUrl(store.coverImage)}
                    alt={`${store.sellerName} store`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x200?text=Store+Image";
                    }}
                  />
                  <h3 className="text-white font-bold text-lg">{store.sellerName}'s Store</h3>
                  <p className="text-gray-400 text-sm mb-2">{store.products.length} product{store.products.length === 1 ? "" : "s"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-sm font-semibold">View Store</span>
                    <span className="text-gray-500 text-xs">Seller</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                No stores found
              </div>
            )}
          </div>
        </>
      )}

      {activeProduct && (
        <ProductDetailModal 
          product={activeProduct} 
          onClose={() => setActiveProduct(null)} 
        />
      )}

      {activeStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">{activeStore.sellerName}'s Store</h2>
                <p className="text-gray-400 text-xs sm:text-sm">{activeStore.products.length} product{activeStore.products.length === 1 ? "" : "s"}</p>
              </div>
              <button
                onClick={() => setActiveStore(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm w-full sm:w-auto"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeStore.products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => {
                    setActiveStore(null);
                    setActiveProduct(product);
                  }}
                >
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                  <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2">{product.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">{product.category}</p>
                  <div className="flex justify-end items-center">
                    <span className="text-gray-500 text-xs">{product.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}