import React, { createContext, useEffect, useState } from 'react'

import Mainbody from '../../components/Layout/hod/Mainbody.jsx'
import Sidebar from '../../components/Layout/Sidebar.jsx'
import Submissions from '../../components/Layout/hod/Submissions.jsx'
import DashOverview from '../../components/Layout/hod/DashOverview.jsx'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/ui/Button.jsx';
import { signInFailure, signInStart, signInSuccess } from '../../Redux/user/slice.js'
import { useNavigate } from 'react-router-dom'

export const  ExpandContext = createContext()
const Dashboard = () => {

  const [isHod, setIsHod] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [isAdvisor, setAdvisor] = useState(false);

  const user = useSelector((state) => state.user.id);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
   fetchRoles()
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/hod/roles/getroles', {credentials: 'include'});
      const data = await response.json();
     setIsHod(data.isHod);
     setIsLecturer(data.isLecturer);
     setAdvisor(data.isAdvisor);

    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

  const goToAdvisorDash = async (selected ) => {
  
    const url = selected === 'lecturer' ? `/api/auth/login` : `/api/auth/login`;
    const role = selected === 'lecturer' ? 'Lecturer' : 'Advisor';
   try{
  
    dispatch(signInStart());
         const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              credentials: 'include',
             
              body: JSON.stringify({
                  username:user,
                  role: role
              })
          });
  
  
          const alldata = await response.json();
  
          const data = alldata.user;
         
          console.log('Login response data:', alldata);
         
          if(alldata.success === false){
              return dispatch(signInFailure(alldata.message || "can't Login"));
          }
       
          if(response.ok){
             // Pass data in the format Redux slice expects
             dispatch(signInSuccess({
                 user: data.user,
                 role: data.role,
                 department: data.department,
                 token: alldata.token,
                 id: data.id,
                 email: data.email
             }));
        
  
             return navigate('/');
          }
  
        }catch(error){
          dispatch(signInFailure(error.message || "Couldn't switch dashboard"));
        }
      }


  return (
    <main className='flex flex-col w-full p-4'>
 <div className='flex items-center justify-between mb-4'> 
  <div> 
     <h1 className='text-black font-bold text-xl md:text-3xl'>Dashboard</h1>
      <h5 className='text-sm text-slate-600 '> An Overview of the complete Result Portal </h5>
   </div>   

   <div className='flex gap-4'>
 {isLecturer && <Button text="Lecturer Dashboard" onClick={() => goToAdvisorDash('lecturer')} />}
 {isAdvisor && <Button text="Advisor Dashboard" onClick={() => goToAdvisorDash('advisor')} />}
   </div>

  </div> 
  
   <DashOverview/>
    
    
    </main>
  )
}

export default Dashboard