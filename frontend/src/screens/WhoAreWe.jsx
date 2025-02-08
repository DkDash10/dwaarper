import React from 'react'
import Navigationbar from '../components/Navigationbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom';

const offerings = [
  {
    title: "Wide Range of Services",
    description: "From home cleaning and plumbing to electrical repairs, we offer diverse services tailored to customer needs."
  },
  {
    title: "Verified Professionals",
    description: "All service providers undergo a thorough verification process to ensure quality and trustworthiness."
  },
  {
    title: "Seamless Booking",
    description: "Our user-friendly platform allows hassle-free service booking with real-time updates."
  },
  {
    title: "Secure Payments",
    description: "Transactions are encrypted and processed securely via Stripe."
  }
  // ,
  // {
  //   title: "Customer Support",
  //   description: "Dedicated support team available to assist users at every step."
  // }
];

export default function WhoAreWe() {
  return (
    <>
    <Navigationbar/>
    <div className='whoAreWe'>
      <header className="whyChooseUs_banner">
          <p className="whyChooseUs_banner-title">Who We Are?</p>
          <p className="whyChooseUs_banner-desc">DwaarPer is a service-based platform designed to connect users with professional service providers. Our mission is to simplify service booking by offering a seamless, reliable, and secure experience for home and professional services. We strive to be the leading platform for on-demand services, providing convenience, trust, and efficiency to our users. We aim to bridge the gap between customers and service providers through technology and innovation.</p>
      </header>
      <div className='whoAreWe_overview'>
        <p className="whyChooseUs_banner-title">What We Offer</p>
        <div className="whoAreWe_cards">
          {offerings.map((offer, index) => (
            <div key={index} className="whoAreWe_card">
              <p className="whoAreWe_card-title">{offer.title}</p>
              <p className="whoAreWe_card-desc">{offer.description}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="whyChooseUs_bs">
          <p className='whyChooseUs_bs-title'>Browse Our Services</p>
          <p className='whyChooseUs_bs-desc'>Explore our range of services and find the perfect solution for your needs.</p>
          <button className="whyChooseUs_bs-btn"><Link to="/" >Explore Now</Link></button>
      </section>
    </div>
    <Footer/>
    </>
  )
}
