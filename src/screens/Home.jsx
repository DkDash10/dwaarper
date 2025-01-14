import React from 'react'
import Navigationbar from '../components/Navigationbar'
import Footer from '../components/Footer'
import Cards from '../components/Cards'
import Carousal from '../components/Carousal'

export default function Home() {
 
  return (
    <>
        <Navigationbar/>
        <Carousal/>
        <Cards/>     
        <Footer/>
    </>
  )
}
