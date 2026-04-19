import { Timeline, TimelineContent, TimelineItem, TimelinePoint, TimelineTime } from 'flowbite-react'
import React, { useState } from 'react'


const ActivityLog = () => {
    const [logs, setLogs] = useState([]);

    React.useEffect(() => {
        fetchLogs();
    }, [])

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/hod/logs/resultlog', { credentials: 'include' });
            const data = await response.json();
            console.log("Fetched Logs:", data);
            setLogs(data.log || []);
        } catch (err) {
            console.error("Error fetching logs:", err);
        }
    }

  return (
    <div className='bg-white p-4 rounded-lg shadow-sm'> 
    <h1 className='mb-4 text-lg font-semibold'>Result Logs</h1>
        <Timeline>
            {logs.map((log, index) => (
                <TimelineItem key={index}>
                    <TimelinePoint className='' />
                    <TimelineContent>
                        <div className='flex flex-col'>
                            <h1 className='text-sm mb-2'>
                                {log.SubmittedBy} submitted {log.course_code} ({log.course_title}) result
                            </h1>
                            <TimelineTime>
                                {new Date(log.SubmittedDate).toLocaleString()}
                            </TimelineTime>
                        </div>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
        
        
        <div className='flex items-center text-xs p-2 justify-center w-28 rounded  border border-blue-800/20'> View Results</div>
         </div>
  )
}

export default ActivityLog