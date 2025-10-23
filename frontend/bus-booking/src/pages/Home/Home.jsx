import React from 'react'
import Navbar from '../../component/Navbar/Navbar'
import { Link } from 'react-router-dom'
import { BusSearch } from '../../component/BusSearch/BusSearch'

const Home = () => {
  return (
    <div>
      <Navbar/>
      <BusSearch/>
    </div>
  )
}

export default Home