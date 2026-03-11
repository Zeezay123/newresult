import { Timeline, TimelineContent, TimelineItem, TimelinePoint, TimelineTime } from 'flowbite-react'
import React from 'react'


const ActivityLog = () => {
  return (
    <div className='bg-white p-4 rounded-lg shadow-sm'> 
    <h1 className='mb-4 text-lg font-semibold'>Result Logs</h1>
        <Timeline> 
        <TimelineItem>
            <TimelinePoint  className=''  />
            <TimelineContent>
                
                <div className='flex flex-col'> <h1 className='text-sm mb-2 '>  Dr. Johnson Alex Submitted CSC101 Result </h1>
                <TimelineTime>{new Date().toLocaleString()} </TimelineTime>
                 </div>
                
            </TimelineContent>
        </TimelineItem>

        <TimelineItem>
            <TimelinePoint  className=''  />
            <TimelineContent>
                
                <div className='flex flex-col'> <h1 className='text-sm mb-2 '>  Dr. Johnson Alex Submitted CSC101 Result </h1>
                <TimelineTime>{new Date().toLocaleString()} </TimelineTime>
                 </div>
                
            </TimelineContent>
        </TimelineItem>


        <TimelineItem>
            <TimelinePoint  className=''  />
            <TimelineContent>
                
                <div className='flex flex-col'> <h1 className='text-sm mb-2 '>  Dr. Johnson Alex Submitted CSC101 Result </h1>
                <TimelineTime>{new Date().toLocaleString()} </TimelineTime>
                 </div>
                
            </TimelineContent>
        </TimelineItem>


        <TimelineItem>
            <TimelinePoint  className=''  />
            <TimelineContent>
                
                <div className='flex flex-col'> <h1 className='text-sm mb-2 '>  Dr. Johnson Alex Submitted CSC101 Result </h1>
                <TimelineTime>{new Date().toLocaleString()} </TimelineTime>
                 </div>
                
            </TimelineContent>
        </TimelineItem>


        <TimelineItem>
            <TimelinePoint  className=''  />
            <TimelineContent>
                
                <div className='flex flex-col'> <h1 className='text-sm mb-2 '>  Dr. Johnson Alex Submitted CSC101 Result </h1>
                <TimelineTime>{new Date().toLocaleString()} </TimelineTime>
                 </div>
                
            </TimelineContent>
        </TimelineItem>


        </Timeline>
        
        
        <div className='flex items-center text-xs p-2 justify-center w-28 rounded  border border-blue-800/20'> View Results</div>
         </div>
  )
}

export default ActivityLog