import React, { useEffect, useRef, useState } from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useDispatchCart, useCart } from "./ContextReducer";

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

  return (
    <>
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
                            value={service[filterItems._id] || defaultCost}
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
                            Price: ₹
                            {filterItems.options &&
                              parseInt(
                                filterItems.options[0][
                                  service[filterItems._id] || defaultCost
                                ].replace(/,/g, "")
                              )}
                            /-
                          </p>
                          {localStorage.getItem("authToken") ? (<button
                            className="card_cartbtn"
                            type="button"
                            onClick={() => {
                              const selectedPrice = filterItems.options[0][
                                service[filterItems._id] || defaultCost
                              ].replace(/,/g, "");

                              const cartData = {
                                type: "ADD",
                                img: filterItems.img,
                                id: filterItems._id,
                                name: filterItems.name,
                                price: selectedPrice,
                                service: service[filterItems._id] || defaultCost,
                              };
                              console.log(cartData);
                              dispatch(cartData);
                            }}
                          >
                            Add to cart
                          </button>): ""}
                          
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
