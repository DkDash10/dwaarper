import React, {useState, useEffect} from 'react'
import Navigationbar from '../components/Navigationbar'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Carousal from '../components/Carousal'

export default function Home() {

  const [serviceCategory,  setServiceCategory] = useState([]);
  const [serviceData, setServiceData] = useState([]);

  const loadData = async () => {
    let response = await fetch(`${window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://dwaarper.onrender.com'}/api/service_data`, {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      }
    });

    response = await response.json();
    // console.log(response[0], response[1])
    setServiceData(response[0]);
    setServiceCategory(response[1]);
  }

  useEffect(()=>{
    loadData()
  },[])
 
  return (
    <>
        <Navigationbar/>
        <Carousal/>
        <Cards serviceCategory={serviceCategory} serviceData={serviceData} />     
        <Footer/>
    </>
  )
}
