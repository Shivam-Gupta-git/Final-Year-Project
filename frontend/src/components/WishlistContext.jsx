import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        hotels:      Array.isArray(parsed.hotels)      ? parsed.hotels      : [],
        restaurants: Array.isArray(parsed.restaurants) ? parsed.restaurants : [],
        places:      Array.isArray(parsed.places)      ? parsed.places      : [],
      };
    } catch {
      return { hotels: [], restaurants: [], places: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (category, item) => {
    const list = wishlist[category] ?? [];
    if (list.find((i) => i._id === item._id)) return;

    setWishlist((prev) => ({
      ...prev,
      [category]: [...(prev[category] ?? []), item],
    }));
  };

  const removeFromWishlist = (category, id) => {
    setWishlist((prev) => ({
      ...prev,
      [category]: (prev[category] ?? []).filter((item) => item._id !== id),
    }));
  };

  const isInWishlist = (category, id) => {
    return (wishlist[category] ?? []).some((item) => item._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);