import React from "react";
import { Link } from "react-router-dom";
import { TbError404 } from "react-icons/tb";

const NotFound = () => {
  return (
    <div className="notFound">
        <div className="notFound_card">
            <TbError404 className="notFound_card-logo" />
            <p className="notFound_card-text">Oops! The page you're looking for doesn't exist.</p>
            <Link to="/">
                Go to Home
            </Link>
        </div>
    </div>
  );
};

export default NotFound;
