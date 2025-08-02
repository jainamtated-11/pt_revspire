import React from 'react'

const DashboardShimmer = () => {
  return (
    <div className='p-4'>
        <div  className='flex flex-col'>
            <div className='flex'>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] rounded-l-lg'></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] '></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] '></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] '></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] '></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] '></span>
                <span className='bg-neutral-200 animate-pulse h-[38px] w-[100px] rounded-r-lg'></span>
            </div>
            <div className='w-full mt-4 bg-neutral-200 animate-pulse  h-[50px] rounded-lg'/>
            <div className=' w-full mt-6 bg-neutral-200 animate-pulse  min-h-[400px] rounded-lg '>
              <div className='flex flex-wrap my-10 ml-10 gap-8'>

                <div>
                  <div className='bg-neutral-300 animate-pulse h-[230px] w-[250px] rounded-xl'/>
                  <div className='flex grid-cols-6 mt-2 gap-[100px]'>
                    <div className='bg-neutral-300 animate-pulse h-5 w-[120px] cols-start-4'/>
                    <div className='bg-neutral-300 animate-pulse h-5 w-[30px] cols-end-2 rounded-2xl'/>
                  </div>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-4'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                </div>

                <div>
                  <div className='bg-neutral-300 animate-pulse h-[230px] w-[250px] rounded-xl'/>
                  <div className='flex grid-cols-6 mt-2 gap-[100px]'>
                    <div className='bg-neutral-300 animate-pulse h-5 w-[120px] cols-start-4'/>
                    <div className='bg-neutral-300 animate-pulse h-5 w-[30px] cols-end-2 rounded-2xl'/>
                  </div>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-4'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                  <div className='bg-neutral-300 animate-pulse h-4 w-[250px] mt-1'/>
                </div>

              </div>
            </div>
        </div>

    </div>
  )
}

export default DashboardShimmer