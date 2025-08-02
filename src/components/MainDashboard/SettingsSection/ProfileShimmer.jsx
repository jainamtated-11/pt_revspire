import React from 'react'

const ProfileShimmer = () => {
  return (
    <div className='p-4'>
        <div  className='flex flex-col'>
            <div className=' w-full mt-2 bg-neutral-200 animate-pulse  min-h-[400px] rounded-lg '>
                <div className='mt-6 ml-10'>
                    <div className='bg-neutral-300 animate-pulse h-8 w-[150px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[300px] rounded-lg mt-2'/>
                </div>
              <div className='flex mt-[40px] ml-10 gap-20'>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
              </div>
              <div className='flex mt-8 ml-10 gap-20'>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
              </div>

              <div className='flex mt-8 ml-10 gap-20'>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
              </div>

              <div className='flex mt-8 ml-10 gap-20'>
                <div>
                    <div className='bg-neutral-300 animate-pulse h-4 w-[130px] rounded-lg'/>
                    <div className='bg-neutral-300 animate-pulse h-[40px] w-[400px] rounded-md mt-2'></div>
                </div>
              </div>

              <div className='flex mt-6 ml-10 gap-20'>
                <div className='bg-neutral-400 animate-pulse h-[40px] w-[200px] rounded-md'></div>
              </div>
            </div>
        </div>
    </div>
  )
}

export default ProfileShimmer