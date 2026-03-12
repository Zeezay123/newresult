import React from 'react'
import DashboardCard from '../../components/Layout/lecturer/DashboardCard'
import DashboardTable from '../../components/Layout/lecturer/DashboardTable'
import { Button } from 'flowbite-react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../../Redux/user/slice'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


const Dashboard = () => {
 const [isAdvisor, setIsAdvisor] = React.useState(false);
  const dispatch = useDispatch();
   const navigate = useNavigate();

   const user = useSelector((state) => state.user.id);



  useEffect(() => {
    fetchCheckAdvisor();
  },[])

  const fetchCheckAdvisor = async () => {
    try {
      const response = await fetch('/api/lecturers/roles/checkAdvisor', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
          setIsAdvisor(true);
        console.log("Check Advisor Response:", data);
      } else {
        console.error('Failed to check advisor status');
      } 

    } catch (error) {
      console.error('Error checking advisor status:', error);
    }
  }


const goToAdvisorDash = async () => {

 try{

  dispatch(signInStart());
       const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
           
            body: JSON.stringify({
                username:user,
                role: 'advisor'
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

      }
    }




  return (
 <main className='flex flex-col w-full p-4'>
  <div className='bg-white rounded-lg shadow-sm  flex items-center justify-between p-4  '>

  <div className='py-4 px-2'>
<h1 className='text-3xl font-bold text-black '>Lecturer Dashboard</h1>  
<p className='text-sm text-slate-500'>Overview of students and courses</p>

    </div> 
    
 <div className='flex gap-4'> 
 {isAdvisor && <Button onClick={goToAdvisorDash}> Advisor Dashboard </Button> }
   <Button > HOD Dashboard </Button> 
   
   </div>
    
       </div>

    <DashboardCard/>
    
 
     
    <DashboardTable />  
    
    
    </main>
  )
}

export default Dashboard