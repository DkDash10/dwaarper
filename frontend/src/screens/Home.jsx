import React, {useState, useEffect} from 'react'
import Navigationbar from '../components/Navigationbar'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Carousal from '../components/Carousal'

export default function Home() {

  const [serviceCategory, setServiceCategory] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response = await fetch(`${window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://dwaarper.onrender.com'}/api/service_data`, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        }
      });

      const data = await response.json();
      setServiceData(data[0]);
      setServiceCategory(data[1]);
    } catch (err) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);
 
  return (
    <>
        <Navigationbar/>
        <Carousal/>
        <Cards
          serviceCategory={serviceCategory}
          serviceData={serviceData}
          loading={loading}
          error={error}
        />     
        <Footer/>
    </>
  )
}
