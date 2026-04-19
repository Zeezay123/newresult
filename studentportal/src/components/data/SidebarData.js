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
  LogOut
} from 'lucide-react'

// HOD Sidebar Data
const hodSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "HOD",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
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
            {
              name: 'Set Score Type',
              url: '/hod/scoretpy',
              icon:Settings2,
            }
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
          name:'Sign Out',
          url:'/signout',
          icon: LogOut,
          items:[]
        }
        
      ]
    },
    {
      title: 'Reports',
      items:[
        {
          name:'Lecturer Report',
          url:'/hod/lecturer-report',
          icon: ClipboardList,
          items:[]
        },
        {
          name:'Student Report',
          url:'/hod/student-report',
          icon: GraduationCap,
          items:[]
        }
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'HOD User',
    email:'hod@delsu.edu.ng'
  }
}

// Lecturer Sidebar Data
const lecturerSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Lecturer",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
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
          name:'Sign Out',
          url:'/signout',
          icon: LogOut,
          items:[]
        }
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Lecturer User',
    email:'lecturer@delsu.edu.ng'
  }
}

// Student Sidebar Data
const studentSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Student",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
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
        // {
        //   name:'Help Center',
        //   url:'/help',
        //   icon: HelpCircle,
        //   items:[]
        // },
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Student User',
    email:'student@delsu.edu.ng'
  }
}
// Level Advisor Sidebar Data
const AdvisorSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Level Advisor",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
        {
          name:'Dashboard',
          url:'/advisor/dashboard',
          icon: LayoutDashboard,
          items:[]
        }, 
      
    
        {
          name:'Results',
          url:'/advisor/results',
          icon: FileCheck,
          items:[]
        },
        {
          name:'Sign Out',
          url:'/signout',
          icon: LogOut,
          items:[]
        },
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Level Advisor',
    email:'advisor@delsu.edu.ng'
  }
}

// Senate Sidebar Data
const SenateSidebarData = { 
  logoItems : {
    main:"Delta State University", 
    sub: "Senate",
    image: logo,
  },

  mainItems : [
    {  
      title: 'General',
      items:[
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
          name:'Sign Out',
          url:'/signout',
          icon: LogOut ,
          items:[]

        }
       
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Senate User',
    email:'senate@delsu.edu.ng'
  }
}

// Dean Sidebar Data
const deanSidebarData = {
  logoItems : {
    main:"Delta State University",
    sub: "Dean",
    image: logo,
  },

  mainItems : [
    {
      title: 'General',
      items:[
        {
          name:'Dashboard',
          url:'/dean/dashboard',
          icon: LayoutDashboard,
          items:[]
        },
        {
          name:'Level Results',
          url:'/dean/level-results',
          icon: FileCheck,
          items:[]
        },
        {
          name:'Lecturer Resubmission',
          url:'/dean/lecturer-resubmission',
          icon: ClipboardList,
          items:[]
        },
        {
          name:'Sign Out',
          url:'/signout',
          icon: LogOut,
          items:[]
        }
      ]
    },
    {
      title: 'Reports',
      items:[
        {
          name:'Student Report',
          url:'/dean/student-report',
          icon: GraduationCap,
          items:[]
        }
      ]
    },
  ],

  bottomSide : {
    image: avatar,
    username: 'Dean User',
    email:'dean@delsu.edu.ng'
  }
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
    case 'Dean':
      return deanSidebarData;
    default:
      return studentSidebarData; // Default to student
  }
}

// Default export for backwards compatibility
export default hodSidebarData;

