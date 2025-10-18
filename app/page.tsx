import HomePageContent from '@/components/HomePageContent'
import Naavbar from '@/components/Naavbar'
import React from 'react'

const page = () => {
  return (
    <div className="overflow-x-hidden">
      <Naavbar/>
      <HomePageContent/>
    </div>
  )
}

export default page