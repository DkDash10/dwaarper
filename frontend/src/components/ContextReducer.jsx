import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";

const CartStateContext = createContext();
const CartDispatchContext = createContext();

const API_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://dwaarper.onrender.com";

/*
|--------------------------------------------------------------------------
| NORMALIZE CART
|--------------------------------------------------------------------------
| MongoDB uses:
|   serviceId
|
| The existing frontend uses:
|   id
|
| We normalize the backend response here so we don't
| have to rewrite every component immediately.
|--------------------------------------------------------------------------
*/

const normalizeCartItem = (item) => ({
  _id: item._id,

  id: item.serviceId,

  serviceId: item.serviceId,

  name: item.name,

  img: item.img || "",

  service: item.service,

  price: Number(item.price) || 0,

  booking: {
    date: item.booking?.date || null,

    time: item.booking?.time || null,

    professional: item.booking?.professional || null,
  },
});

const normalizeCart = (cart) => {
  if (!cart || !Array.isArray(cart.items)) {
    return [];
  }

  return cart.items.map(normalizeCartItem);
};

/*
|--------------------------------------------------------------------------
| LOCAL REDUCER
|--------------------------------------------------------------------------
*/

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return action.payload || [];

    case "ADD_LOCAL":
      return [...state, action.payload];

    case "REMOVE_LOCAL":
      return state.filter((item) => item._id !== action.itemId);

    case "UPDATE_BOOKING_LOCAL":
      return state.map((item) =>
        item._id === action.itemId
          ? {
              ...item,
              booking: {
                ...item.booking,
                ...action.booking,
              },
            }
          : item,
      );

    case "DROP":
      return [];

    default:
      return state;
  }
};

/*
|--------------------------------------------------------------------------
| CART PROVIDER
|--------------------------------------------------------------------------
*/

export const CartProvider = ({ children }) => {
  const [state, reducerDispatch] = useReducer(reducer, []);

  /*
  |--------------------------------------------------------------------------
  | GET TOKEN
  |--------------------------------------------------------------------------
  */

  const getToken = () => {
    return localStorage.getItem("token");
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH CART FROM BACKEND
  |--------------------------------------------------------------------------
  */

  const fetchCart = useCallback(async () => {
    const token = getToken();

    if (!token) {
      reducerDispatch({
        type: "SET_CART",
        payload: [],
      });

      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (response.status === 401) {
        reducerDispatch({
          type: "SET_CART",
          payload: [],
        });

        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch cart");
      }

      reducerDispatch({
        type: "SET_CART",
        payload: normalizeCart(data.cart),
      });
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD CART WHEN AUTH CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    // Remove old localStorage cart permanently.
    // The backend is now the source of truth.
    localStorage.removeItem("cartData");

    fetchCart();

    const handleAuthChange = () => {
      const token = getToken();

      if (token) {
        fetchCart();
      } else {
        reducerDispatch({
          type: "SET_CART",
          payload: [],
        });
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [fetchCart]);

  /*
  |--------------------------------------------------------------------------
  | CART DISPATCH
  |--------------------------------------------------------------------------
  */

  const dispatch = useCallback(
    async (action) => {
      const token = getToken();

      /*
      |--------------------------------------------------------------------------
      | ADD
      |--------------------------------------------------------------------------
      */

      if (action.type === "ADD") {
        if (!token) {
          return {
            success: false,
            message: "Please login first",
          };
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/add`, {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },

            body: JSON.stringify({
              serviceId: action.id,
              name: action.name,
              img: action.img,
              service: action.service,
              price: action.price,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to add service to cart");
          }

          reducerDispatch({
            type: "SET_CART",
            payload: normalizeCart(data.cart),
          });

          return {
            success: true,
            cart: normalizeCart(data.cart),
          };
        } catch (error) {
          console.error("Add cart error:", error);

          return {
            success: false,
            message: error.message,
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | REMOVE
      |--------------------------------------------------------------------------
      */

      if (action.type === "REMOVE") {
        if (!token) {
          return {
            success: false,
            message: "Please login first",
          };
        }

        let itemId = action.itemId;

        /*
         * Backward compatibility:
         * Your old Cart page removes using array index.
         *
         * Until we update Cart.jsx, we can still accept:
         *
         * dispatch({
         *   type: "REMOVE",
         *   index: 2
         * })
         */

        if (!itemId && action.index !== undefined) {
          itemId = state[action.index]?._id;
        }

        if (!itemId) {
          return {
            success: false,
            message: "Cart item ID is missing",
          };
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/item/${itemId}`, {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to remove service");
          }

          reducerDispatch({
            type: "SET_CART",
            payload: normalizeCart(data.cart),
          });

          return {
            success: true,
          };
        } catch (error) {
          console.error("Remove cart error:", error);

          return {
            success: false,
            message: error.message,
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE BOOKING
      |--------------------------------------------------------------------------
      */

      if (action.type === "UPDATE_BOOKING") {
        if (!token) {
          return {
            success: false,
            message: "Please login first",
          };
        }

        if (!action.itemId) {
          return {
            success: false,
            message: "Cart item ID is missing",
          };
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/item/${action.itemId}`, {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },

            body: JSON.stringify({
              date: action.date,
              time: action.time,
              professional: action.professional,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to update booking");
          }

          reducerDispatch({
            type: "SET_CART",
            payload: normalizeCart(data.cart),
          });

          return {
            success: true,
          };
        } catch (error) {
          console.error("Update booking error:", error);

          return {
            success: false,
            message: error.message,
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | DROP / CLEAR CART
      |--------------------------------------------------------------------------
      */

      if (action.type === "DROP") {
        if (!token) {
          reducerDispatch({
            type: "DROP",
          });

          return {
            success: true,
          };
        }

        try {
          const response = await fetch(`${API_URL}/api/cart/clear`, {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to clear cart");
          }

          reducerDispatch({
            type: "DROP",
          });

          return {
            success: true,
          };
        } catch (error) {
          console.error("Clear cart error:", error);

          return {
            success: false,
            message: error.message,
          };
        }
      }

      /*
      |--------------------------------------------------------------------------
      | SET CART
      |--------------------------------------------------------------------------
      */

      if (action.type === "SET_CART") {
        reducerDispatch({
          type: "SET_CART",
          payload: action.payload || [],
        });

        return {
          success: true,
        };
      }

      console.warn("Unknown cart action:", action.type);

      return {
        success: false,
        message: "Unknown cart action",
      };
    },
    [state],
  );

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>{children}</CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| HOOKS
|--------------------------------------------------------------------------
*/

export const useCart = () => useContext(CartStateContext);

export const useDispatchCart = () => useContext(CartDispatchContext);
