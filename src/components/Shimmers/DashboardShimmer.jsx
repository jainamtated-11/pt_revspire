import React from 'react'

const DashboardShimmer = () => {
  return (
    <div className='p-4'>
        <div  className='flex flex-col'>
            <div className='flex gap-3'>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px]  rounded-lg'></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px]  rounded-lg'></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px]  rounded-lg'></span>
            </div>
            <div className='w-full mt-4 bg-neutral-200 animate-pulse  h-[50px] rounded-lg'/>
            <div className=' w-full mt-6 bg-neutral-200 animate-pulse  min-h-[400px] rounded-lg '>

            </div>
        </div>

    </div>
  )
}

export default DashboardShimmer