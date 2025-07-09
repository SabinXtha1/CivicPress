'use client'
import React from 'react'

const page = () => {
  const dataLoader=async()=>{
    const data = await fetch("/api/user")
   const msg =await data.json()
    console.log(msg.msg)

  }
  dataLoader()
  
  return (
    <div>
      Fuck Off 
    </div>
  )
}

export default page
