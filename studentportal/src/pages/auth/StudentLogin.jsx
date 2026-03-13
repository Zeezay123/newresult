import { Button, Label, TextInput } from 'flowbite-react'
import { Database, User } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../../Redux/user/slice'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const StudentLogin = () => {

const [formData, setFormData] = React.useState({
    username: '',
    role: 'student',
    })

    const {loading, error} = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const hasAutoLoginAttempted = React.useRef(false);
const params = new URLSearchParams(location.search);
const matNo = params.get("matNo");

React.useEffect(() => {
    setFormData((prev) => ({...prev, username: matNo || ''}));
}, [matNo]);


    const loginStudent = async (username)=>{
      if(!username){
        return;
      }

      try{
        dispatch(signInStart());
       const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
           
            body: JSON.stringify({
              username,
              role: 'student'
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
           return navigate('/');
        }

      }catch(error){
        dispatch(signInFailure(error.message || "can't Login"));
      }
    }

    const HandleSubmit  = async (e)=>{
      e.preventDefault()
      await loginStudent(formData.username?.trim());
    }

    React.useEffect(() => {
      if (hasAutoLoginAttempted.current) {
        return;
      }

      if (!matNo || !matNo.trim()) {
        return;
      }

      hasAutoLoginAttempted.current = true;
      loginStudent(matNo.trim());
    }, [matNo]);


  return (
    <div className='w-full h-screen flex flex-col  bg-blue-700'>

        <header className='flex justify-between w-full text-slate-100 bg-blue-700  py-3 px-8 h-12 border-b border-slate-400'>
             <div className='flex items-center w-full gap-3'>
                 <span className='text-blue-400 -rotate-20'> <Database /></span> DELSU Result Management System </div>
        

        <div> <span>Help</span> <span></span></div>
        </header>
        
        <div className='flex justify-center items-center w-full h-full '>
           
           <div className='flex flex-col items-center justify-center bg-blue-700/20 gap-5'>
            
         <div className='flex flex-col gap-2'> 
            <h1 className='text-center text-slate-300 md:text-3xl font-bold'>Student Result Portal Login</h1>  
            <p className='text-center text-slate-50 font-light text-sm '>Please enter your details to sign in.</p>
            </div> 

      


            {/* Form Section */}

            <form action="" className='w-90 ' onSubmit={HandleSubmit}>
                <div>
                <Label htmlFor="username" value="Username" className='text-slate-200'></Label>
              <div> 
                
               <TextInput
                id="username"
                type="text"
                placeholder="Enter your Matric Number"
                required={true}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className='w-full'
              />
                </div> 
                </div>

                <Button type='submit' className='bg-white text-blue-800 w-full mt-2 hover:text-white'>Login</Button>
            </form>
             
              </div>

         
        </div>
  </div>
  )
}

export default StudentLogin