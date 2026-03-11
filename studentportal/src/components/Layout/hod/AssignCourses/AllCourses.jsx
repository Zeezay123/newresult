import React from 'react'
import AllCourseTable from '../../../Tables/AllCourseTable.jsx'
import { BookText, Check, UsersRound, X } from 'lucide-react'
import { useSelector } from 'react-redux'

const AllCourses = () => {
  const hodId = useSelector((state) => state.user.department);
  const [courseStats, setCourseStats] = React.useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
    lecturers: 0
  });

  React.useEffect(() => {
    fetchCourseStats();
  }, [hodId]);

  const fetchCourseStats = async () => {
    try {
      const [statsRes, lecturersCountRes] = await Promise.all([
        fetch(`/api/hod/courses/stats`, { credentials: 'include' }),
        fetch(`/api/hod/lecturers/count`, { credentials: 'include' })
      ]);

      if (!statsRes.ok || !lecturersCountRes.ok) {
        console.error("Failed to fetch course statistics");
        return;
      }

      const [statsData, lecturersCountData] = await Promise.all([
        statsRes.json(),
        lecturersCountRes.json()
      ]);

      setCourseStats({
        total: statsData.stats?.total || 0,
        assigned: statsData.stats?.assigned || 0,
        unassigned:  statsData.stats?.total - statsData.stats?.assigned || 0,
        lecturers: lecturersCountData.count || 0
      });

    } catch (err) {
      console.error("Error fetching course statistics:", err);
    }
  };

  
  const card= [{
    title: 'Total Courses',
    value: courseStats.total,
    icon: BookText,
    comment: 'Total number of courses in the department',
  },
  {
    title: 'Assigned Courses',
    value: courseStats.assigned,
    icon: Check,
    comment: 'Courses that have been assigned to a lecturer',
  },
{
    title: 'Unassigned Courses',
    value: courseStats.unassigned,
    icon: X,
    comment: 'Courses that are yet to be assigned',
},
{
    title: 'Lecturers',
    value: courseStats.lecturers,
    icon: UsersRound ,
    comment: 'Total number of lecturers in the department',
}
]
  return (

    <div>
        <div className='flex flex-col py-6 px-4'>
                 <h1 className='font-semibold text-3xl text-black'> Course Overview</h1> 
                 
                  <p className='text-sm font-light text-slate-800'> View Courses available to your department and assign them to faculty members. </p>
                 
                 <div className='mt-4 flex gap-4'>
                  {card.map((item, index) => (
                    <div key={index} className='flex flex-col border border-blue-900/90 p-4 bg-white rounded-xl gap-6 shadow-sm flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='font-[inter] font-medium text-sm text-gray-900'>{item.title}</div>
                        <div className={`bg-slate-50 flex items-center justify-center p-1 rounded-md ${
                          item.title === 'Total Courses' ? 'text-blue-700' : 
                          item.title === 'Assigned Courses' ? 'text-green-600' : 
                          item.title === 'Unassigned Courses' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          <item.icon size={18}/>
                        </div>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <h2 className='text-2xl font-semibold text-gray-900'>{item.value}</h2>
                        <p className='text-xs text-gray-500'>{item.comment}</p>
                      </div>
                    </div>
                  ))} 
               
                 </div>
                 </div> 
        
        <AllCourseTable/>
    </div>
  
  )
}

export default AllCourses