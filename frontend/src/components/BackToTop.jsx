import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="
            fixed bottom-5 right-5
            flex h-10 w-10
            items-center justify-center
            rounded-full
            border-0
            bg-blue-500
            p-2
            text-white
            shadow-[0_2px_10px_rgba(0,0,0,0.2)]
            transition-all duration-300 ease-in-out
            hover:-translate-y-0.5
            hover:bg-blue-600
            hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
            focus:outline-none
            focus:ring-[3px]
            focus:ring-blue-500/50
          "
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default BackToTop;
