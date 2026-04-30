import React from 'react'
import logo from '../../assets/delsulogo.png'
import avatar from '../../assets/avatar.jpg'
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  UserCog,
  Users,
  FileCheck,
  CheckCircle,
  Settings2,
  ClipboardList,
  GraduationCap,
} from 'lucide-react'

// HOD Sidebar Data
const hodSidebarData = { 

  mainItems : [

        {
          name:'Dashboard',
          url:'/hod/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
         {
          name:'Courses',
          url:'/hod/assign-course',
          icon: BookOpen,
          items:[{
              name: 'Assign to Lecturer',
              url: '/hod/assign-course/lecturer',
              icon:UserCog,
            },
       ]
        }, 
         {
          name:'Assign Advisors',
          url:'/hod/assign-advisors',
          icon: Users,
          items:[]
        },
        {
          name:'Results',
          url:'/hod/results',
          icon: FileCheck,
          items:[{
              name: 'Test Results',
              url: '/hod/test-results',
              icon:UserCog,
            },
        {
              name: 'Exam Results',
              url: '/hod/exam-results',
              icon:Settings2,
            },
        {
              name: 'Level Results',
              url: '/hod/level-results',
              icon:CheckCircle,
            }]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
    
  ],


}

// Lecturer Sidebar Data
const lecturerSidebarData = { 


  mainItems : [
  
        {
          name:'Dashboard',
          url:'/lecturer/dashboard',
          icon: LayoutDashboard,
          items:[]
        },
         {
          name:'Submit Results',
          url:'/lecturer/test-results',
          icon: ClipboardList,
          items:[]
        },
        {
          name:'Uploaded Results',
          url:'/lecturer/uploaded-results',
          icon: FileCheck,
          items:[]
        },
        {
          name:'My Courses',
          url:'/lecturer/courses',
          icon: BookOpen,
          items:[]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
   

}

// Student Sidebar Data
const studentSidebarData = { 


  mainItems : [
 
        {
          name:'Dashboard',
          url:'/student/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
        {
          name:'My Courses',
          url:'/student/courses',
          icon: BookOpen,
          items:[]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
 
}
// Level Advisor Sidebar Data
const AdvisorSidebarData = { 

  mainItems : [
  
  
    
        {
          name:'Results',
          url:'/advisor/results',
          icon: FileCheck,
          items:[]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
  


}

// Senate Sidebar Data
const SenateSidebarData = { 

  mainItems : [

        {
          name:'Dashboard',
          url:'/senate/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
        {
          name:'Results Review',
          url:'/senate/results',
          icon: FileCheck,
          items:[]
        },
        {
          name:'Help Center',
          url:'/help',
          icon: HelpCircle,
          items:[]
        },
      ]
   
}

// Function to get sidebar data based on role
export const getSidebarDataByRole = (role) => {
  switch(role) {
    case 'Admin':
      return hodSidebarData;
    case 'Lecturer':
      return lecturerSidebarData;
    case 'Student':
      return studentSidebarData;
    case 'Advisor':
      return AdvisorSidebarData;
    case 'Senate':
      return SenateSidebarData;
    default:
      return studentSidebarData; // Default to student
  }
}

// Default export for backwards compatibility
export default hodSidebarData;

