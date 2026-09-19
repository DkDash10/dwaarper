import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero/Hero";
import BookingJourney from "../components/BookingJourney/BookingJourney";
import WhyChoose from "../components/WhyChoose/WhyChoose";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <>
      <Navigationbar />
      <Hero
        search={search}
        setSearch={setSearch}
        onViewResults={(searchTerm) => {
          const query = searchTerm.trim();

          if (query) {
            navigate(`/services?search=${encodeURIComponent(query)}`);
          } else {
            navigate("/services");
          }
        }}
      />
      <BookingJourney />
      <WhyChoose />
      <Footer />
    </>
  );
}
