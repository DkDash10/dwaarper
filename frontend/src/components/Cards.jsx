import React, { useEffect, useRef, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useDispatchCart, useCart } from "./ContextReducer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

export default function Cards(props) {
  const scrollRefs = useRef([]);
  const dispatch = useDispatchCart();
  const cartData = useCart();

  const [search, setSearch] = useState("");
  const [service, setService] = useState({});
  const [hasResults, setHasResults] = useState(true); // Track if any results are found

  const serviceData = props.serviceData;
  const serviceCategory = props.serviceCategory;

  const scrollLeft = (index) => {
    scrollRefs.current[index].scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = (index) => {
    scrollRefs.current[index].scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleCostChange = (id, value) => {
    setService((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    const filteredItemsByCategory = serviceCategory.map((data) =>
      serviceData.filter(
        (item) =>
          item.CategoryName === data.CategoryName &&
          (!search || item.name.toLowerCase().includes(search.toLowerCase()))
      )
    );

    // Check if any results exist across all categories
    setHasResults(filteredItemsByCategory.some((items) => items.length > 0));
  }, [serviceData, search]);

  // Toast notification function
  const showToast = (serviceName) => {
    toast.success(`${serviceName} has been added to the cart!`, {
      position: toast.POSITION?.TOP_RIGHT,
      autoClose: 3000, // Toast will automatically close after 3 seconds
    });
  };

  // Check if the service with the specific option is already in the cart
  const isServiceInCart = (id, selectedOption) => {
    return cartData.some(
      (item) => item.id === id && item.service === selectedOption
    );
  };

  return (
    <>
      {/* ToastContainer to render the toast messages */}
      <ToastContainer />

      <div className="search">
        <p>Search our available services</p>
        <div className="search_form">
          <Row>
            <Col xs="auto">
              <input
                type="search"
                placeholder="Search"
                className="mr-sm-2 search_input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </div>
      </div>
      <div className="cards">
        {hasResults ? (
          serviceCategory.map((data, index) => {
            const filteredItems = serviceData.filter(
              (item) =>
                item.CategoryName === data.CategoryName &&
                (!search ||
                  item.name.toLowerCase().includes(search.toLowerCase()))
            );

            // Hide category if no filtered items
            if (search && filteredItems.length === 0) return null;

            return (
              <React.Fragment key={`category-${index}`}>
                <div className="card_overflow">
                  <p className="card_category">{data.CategoryName}</p>
                  {filteredItems.length > 3 && ( // Show buttons only if more than 3 cards
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button onClick={() => scrollLeft(index)}>
                        <FaLongArrowAltLeft />
                      </button>
                      <button onClick={() => scrollRight(index)}>
                        <FaLongArrowAltRight />
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="card_section"
                  ref={(el) => (scrollRefs.current[index] = el)}
                >
                  {filteredItems.map((filterItems) => {
                    const defaultCost =
                      filterItems.options &&
                      Object.keys(filterItems.options[0])[0];

                    const selectedOption =
                      service[filterItems._id] || defaultCost;

                    const selectedPrice =
                      filterItems.options &&
                      parseInt(
                        filterItems.options[0][selectedOption].replace(/,/g, "")
                      );

                    return (
                      <div className="card_sections" key={filterItems._id}>
                        <img
                          src={filterItems.img}
                          alt={filterItems.name}
                          className="card_img"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            display: "flex",
                            gap: "20px",
                          }}
                        />
                        <p className="card_name">{filterItems.name}</p>
                        <p className="card_desc">{filterItems.description}</p>
                        <div className="card_option">
                          <select
                            value={selectedOption}
                            onChange={(e) =>
                              handleCostChange(filterItems._id, e.target.value)
                            }
                          >
                            {filterItems.options &&
                              Object.keys(filterItems.options[0]).map((key) => (
                                <option key={key} value={key}>
                                  {key}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="card_cart">
                          <p className="card_price">
                            Price: ₹{selectedPrice}/-
                          </p>
                          {localStorage.getItem("authToken") ? (
                            <button
                              className="card_cartbtn"
                              type="button"
                              disabled={isServiceInCart(
                                filterItems._id,
                                selectedOption
                              )} // Disable button if the service with the selected option is in the cart
                              onClick={() => {
                                // Prevent adding if the service with the selected option is already in the cart
                                if (!isServiceInCart(filterItems._id, selectedOption)) {
                                  const cartData = {
                                    type: "ADD",
                                    img: filterItems.img,
                                    id: filterItems._id,
                                    name: filterItems.name,
                                    price: selectedPrice,
                                    service: selectedOption,
                                  };
                                  dispatch(cartData);
                                  showToast(filterItems.name); // Show the toast notification
                                }
                              }}
                            >
                              {isServiceInCart(filterItems._id, selectedOption)
                                ? "Added to cart"
                                : "Add to cart"}
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="no-services">
            <p>No services found</p>
          </div>
        )}
      </div>
    </>
  );
}
