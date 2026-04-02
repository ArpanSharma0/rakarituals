import { getToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper for headers
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Global Fetch Wrapper with Logging and Error Handling
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  console.log("REQUEST:", url, options.method || "GET");
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await res.json();
    console.log("RESPONSE:", url, data);

    if (!res.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${url}):`, error.message);
    throw error;
  }
};

export const fetchProducts = async () => {
  return apiFetch("/api/products");
};

export const fetchBestSellers = async () => {
  return apiFetch("/api/products/best");
};

// --- AUTH API ---

export const loginUser = async (email, password) => {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
  }
  return data;
};

export const registerUser = async (name, email, password) => {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUserProfile = async () => {
  return apiFetch("/api/users/profile");
};

export const updateUserProfile = async (profileData) => {
  return apiFetch("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// --- CART API ---

export const getCart = async () => {
  return apiFetch("/api/cart");
};

export const addToCart = async (productId, quantity = 1) => {
  return apiFetch("/api/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const updateCartItem = async (productId, quantity) => {
  return apiFetch(`/api/cart/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
};

export const removeFromCart = async (productId) => {
  return apiFetch(`/api/cart/${productId}`, {
    method: "DELETE",
  });
};

// --- ORDERS API ---

export const placeOrder = async (orderData) => {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = async () => {
  return apiFetch("/api/orders/myorders");
};

// --- ADMIN PRODUCTS API ---

export const createProduct = async (productData) => {
  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });
};

export const fetchProductById = async (id) => {
  return apiFetch(`/api/products/${id}`);
};
