import { useState } from 'react';
import Navigationbar from '../components/Navigationbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import Cleaning from '../assets/WhyChooseUs/Cleaning.png';
import PestControl from '../assets/WhyChooseUs/Pest_control.png';
import Decor from '../assets/WhyChooseUs/Painting.png';
import Repair from '../assets/WhyChooseUs/General_repair.png';
import ApplianceRepair from '../assets/WhyChooseUs/Appliance_repair.png';
import { FaChevronDown, FaChevronUp  } from "react-icons/fa6";

const services = [
    {
      id: 1,
      title: "Cleaning Services",
      description: "Professional cleaning services to keep your home and office spotless. We use high-quality, eco-friendly products to ensure a safe and healthy environment. Our trained professionals are committed to delivering the best results with minimal disruption to your routine.",
      image: Cleaning,
      points: ["Eco-friendly products", "Trained professionals", "Affordable pricing", "Same-day service", "Customized cleaning plans"]
    },
    {
      id: 2,
      title: "Pest Control",
      description: "Effective and safe pest control solutions for a pest-free environment. Our experts use modern techniques and environmentally safe chemicals to eliminate pests while ensuring the safety of your family and pets. We provide long-term solutions to keep pests away.",
      image: PestControl,
      points: ["Non-toxic solutions", "Certified experts", "Long-lasting protection", "Safe for children and pets", "Odor-free treatments"]
    },
    {
      id: 3,
      title: "Decor & Painting",
      description: "Enhance your space with our expert painting and wall panel services. We offer a variety of designs and color palettes to suit your aesthetic preferences. Our skilled team ensures a flawless finish that lasts, adding value and beauty to your space.",
      image: Decor,
      points: ["High-quality paints", "Custom wall panels", "Fast service", "Wide range of colors", "Budget-friendly options"]
    },
    {
      id: 4,
      title: "General Repair",
      description: "Fixing everything from leaky faucets to broken furniture. Our experienced technicians handle all types of household repairs with efficiency and professionalism. No job is too big or too small for our team.",
      image: Repair,
      points: ["Skilled technicians", "Quick fixes", "Reliable service", "Affordable pricing", "Warranty on repairs"]
    },
    {
      id: 5,
      title: "Appliance Repair",
      description: "Expert repairs for all your home appliances. We provide multi-brand support for refrigerators, washing machines, microwaves, and more. Our certified professionals ensure quick and effective solutions to keep your appliances running smoothly.",
      image: ApplianceRepair,
      points: ["Multi-brand support", "Warranty included", "Fast turnaround", "Genuine spare parts", "Experienced professionals"]
    }
];

export default function WhyChooseUs() {
    const [selectedService, setSelectedService] = useState(services[0]);

  return (
    <>
        <Navigationbar/>
        <div className="whyChooseUs">
            <header className="whyChooseUs_banner">
                <p className="whyChooseUs_banner-title">Why Choose Us?</p>
                <p className="whyChooseUs_banner-desc">Best services at reasonable prices. Limited-time discounts available! DwaarPer offers a range of top-notch services, including professional cleaning, pest control, décor solutions (painting and wall panels), general repairs, and appliance repair. We prioritize customer satisfaction and strive to provide quality services that fit within your budget. With our limited-time discounts, you can enjoy affordable and reliable assistance for all your home needs. Don’t miss out on the chance to experience premium service at unbeatable prices!</p>
            </header>

            <div className="whyChooseUs_service">
                <div className="whyChooseUs_service-lists">
                {services.map((service) => (
                    <div className="whyChooseUs_service-list"  key={service.id}>
                      <div className={`whyChooseUs_service-item ${selectedService.id === service.id ? "active" : ""}`} onClick={() => setSelectedService(service)}>
                          <p>{service.title}</p>
                          {selectedService.id === service.id ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                      {selectedService.id === service.id && (
                          <div className="whyChooseUs_service-details">
                              <p>{service.description}</p>
                              <div className="whyChooseUs_service-badges">
                                  {service.points.map((point, index) => (
                                  <span key={index} className="whyChooseUs_service-badge">{point}</span>
                                  ))}
                              </div>
                          </div>
                      )}
                    </div>
                ))}
                </div>

                <div className="whyChooseUs_service-imgContainer">
                    <div className='color-change-4x'></div>
                    <img src={selectedService.image} alt={selectedService.title} className="whyChooseUs_service-img transition-effect" />
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
