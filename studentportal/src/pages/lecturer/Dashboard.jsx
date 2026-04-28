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
 const [isHod, setIsHod] = React.useState(false);
 const [isLecturer, setIsLecturer] = React.useState(false);
 const [formData, setFormData] = React.useState({
  username: '',
  role: 'Admin',
 })
  const dispatch = useDispatch();
   const navigate = useNavigate();

   const user = useSelector((state) => state.user.id);



  useEffect(() => {

    fetchRoles();
  },[])

   const fetchRoles = async () => {
    try {
      const response = await fetch('/api/lecturers/roles/getroles', {credentials: 'include'});
      const data = await response.json();
     setIsHod(data.isHod);
     setIsLecturer(data.isLecturer);
     setIsAdvisor(data.isAdvisor);
     console.log('Roles fetched:', data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }


  // const fetchCheckAdvisor = async () => {
  //   try {
  //     const response = await fetch('/api/lecturers/roles/checkAdvisor', { credentials: 'include' });
  //     if (response.ok) {
  //       const data = await response.json();
  //         setIsAdvisor(true);
  //       console.log("Check Advisor Response:", data);
  //     } else {
  //       console.error('Failed to check advisor status');
  //     } 

  //   } catch (error) {
  //     console.error('Error checking advisor status:', error);
  //   }
  // }


const goToAdvisorDash = async () => {
  
    const url = `/api/auth/login` 
    const role = 'Advisor';
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
        
  
             return navigate('/redirect');
          }
  
        }catch(error){
          dispatch(signInFailure(error.message || "Couldn't switch dashboard"));
        }
      }

      
          const goToHodDash  = async (e)=>{
            e.preventDefault()
            console.log('Switching to HOD dashboard for user:', user);
       setFormData({
  username: user,
  role: 'Admin'
       })
            try{
              dispatch(signInStart());
             const response = await fetch('/api/auth/staff-login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  credentials: 'include',
                 
                  body: JSON.stringify({
                      username:user,
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
                 // Redirect to root - will automatically redirect based on role
                 return navigate('/redirect');
              }
      
            }catch(error){
              dispatch(signInFailure(error.message || "Couldn't switch dashboard"));
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
 {isHod && <Button onClick={goToHodDash}> HOD Dashboard </Button> }
   
   </div>
    
       </div>

    <DashboardCard/>
    
 
     
    <DashboardTable />  
    
    
    </main>
  )
}

export default Dashboard