import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({

  base:"/result/",
  server: {
    // This is the port your backend server is running on
    
    proxy:{
      // This will proxy requests from /api in the backend server
      // target is changed to match the backend server's URL
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      }
    }
  },
  plugins: [react(), tailwindcss(), flowbiteReact()],
})


// export default defineConfig({
//   base:"/result/", 
//   plugins: [react(), tailwindcss(), flowbiteReact()]
// })