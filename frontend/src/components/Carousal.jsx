import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import banner1 from '../assets/banner1.png';
import banner2 from '../assets/banner2.png';
import banner3 from '../assets/banner3.png';
import banner4 from '../assets/banner4.png';
import banner5 from '../assets/banner5.png';

function CarouselFadeExample() {
  const carouselData = [
    {
      image: banner1,
      title: 'Professional Pest Control Solutions',
      description: 'Eliminate unwanted pests quickly and safely with our effective, eco-friendly pest control services.',
    },
    {
      image: banner2,
      title: 'Expert House Painting Services',
      description: 'Transform your home with a fresh coat of high-quality paint, ensuring a vibrant and long-lasting finish.',
    },
    {
      image: banner3,
      title: 'Trusted House Cleaning Services',
      description: 'Enjoy a spotless home with our thorough, reliable cleaning services tailored to your needs.',
    },
    {
      image: banner4,
      title: 'Expert Electrical Services',
      description: 'Ensure safety and reliability with our professional electrical solutions for your home or business.',
    },
    {
      image: banner5,
      title: 'Reliable Plumbing Services',
      description: 'Get fast, efficient plumbing repairs and installations with our trusted, expert technicians.',
    },
  ];

  return (
    <Carousel fade interval={2000}>
      {carouselData.map((item, index) => (
        <Carousel.Item key={index}>
          <div className="carousel-item-container">
            <img className="carousal_image" src={item.image} alt={`Banner ${index + 1}`} />
            <div className="overlay"></div>
            <Carousel.Caption className='carousal_text'>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Carousel.Caption>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselFadeExample;
