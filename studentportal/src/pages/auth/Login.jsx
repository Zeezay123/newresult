import React, { useState, useEffect } from 'react';
import { Label, TextInput, Select, Button, Card } from 'flowbite-react';
import { User, Lock, UserCog, Building2, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInFailure,signInSuccess,signInStart } from '../../Redux/user/slice';


const Login = () => {
  const [formData, setFormData] = useState({
    username: '', password:''
  });
  
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const {loading, error:error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  
  // Fetch departments on component mount
  // useEffect(() => {
  //   const fetchDepartments = async () => {
  //     try {
  //       const response = await fetch('/api/departments/all');
  //       const data = await response.json();
        
  //       if (data.success) {
  //         setDepartments(data.departments);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching departments:', error);
  //     } finally {
  //       setLoadingDepartments(false);
  //     }
  //   };
    
  //   fetchDepartments();
  // }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Senate and SuperAdmin don't require department
    // const rolesWithoutDepartment = ['senate', 'superadmin'];
    // const requiresDepartment = !rolesWithoutDepartment.includes(formData.role?.toLowerCase());
    
    // if(!formData.username || !formData.password || !formData.role){
    //   return dispatch(signInFailure("Username, password and role are required"));
    // }
    
    // if(requiresDepartment && !formData.department){
    //   return dispatch(signInFailure("Department is required for this role"));
    // }


    try{

        dispatch(signInStart());

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
           
            body: JSON.stringify(formData)
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
   dispatch(signInFailure(error.message || "Login failed"))
   console.error("Login error:", error);
    }
}

  return (
    <section className='min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 py-12 px-4'>
      <div className='w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden'>
        
        {/* Left Side - Branding */}
        <div className='bg-linear-to-br from-blue-600 to-blue-800 p-12 flex flex-col justify-center text-white'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold mb-4'>DELSU Result Portal</h1>
            <p className='text-blue-100 text-lg'>Please sign in to access your dashboard</p>
          </div>
          <div className='space-y-4 text-blue-50'>
            <div className='flex items-center gap-3'>
              <ShieldCheck className='w-6 h-6' />
              <span>Secure Access</span>
            </div>
            <div className='flex items-center gap-3'>
              <Clock className='w-6 h-6' />
              <span>Real-time Updates</span>
            </div>
            <div className='flex items-center gap-3'>
              <Navigation className='w-6 h-6' />
              <span>Easy Navigation</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className='p-12 flex flex-col justify-center'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-blue-800 mb-2'>Welcome Back</h2>
            <p className='text-gray-600'>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Username */}
            <div>
              <Label htmlFor='username' value='Username' className='mb-2 block font-semibold' />
              <TextInput
                id='username'
                name='username'
                type='text'
                icon={User}
                placeholder='Enter your username'
                value={formData.username}
                onChange={handleChange}
                required
                color='blue'
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor='password' value='Password' className='mb-2 block font-semibold' />
              <TextInput
                id='password'
                name='password'
                type='password'
                icon={Lock}
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleChange}
                required
                color='blue'
              />
            </div>

           

            {/* Submit Button */}
            <Button
              type='submit'
              color='blue'
              size='lg'
              className='w-full mt-6'
            >
              Sign In
            </Button>

            {/* Forgot Password Link */}
            <div className='text-center mt-4'>
              <a href='#' className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login