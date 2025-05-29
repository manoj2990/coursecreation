import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


// import React,{useState,useEffect} from "react";
// import {LoginPage} from "@/components/LoginPage"
// import CourseCreationWizard from "@/components/CourseCreationWizard"
// const App = () => {
//   const [authToken, setAuthToken] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);


  
//   useEffect(() => {
//     const savedToken = localStorage.getItem('authToken');
//     if (savedToken) {
//       setAuthToken(savedToken);
//       setIsAuthenticated(true);
//     }
//   }, []);
  

//   const handleLogin = (token) => {
//     setAuthToken(token);
//     setIsAuthenticated(true);
//     console.log("authToken --->",authToken)
    
//   };

//   const handleLogout = () => {
//     setAuthToken(null);
//     setIsAuthenticated(false);
   
//     localStorage.removeItem('authToken');
//   };

  
//   if (!isAuthenticated) {
//     return <LoginPage onLogin={handleLogin} />;
//   }

 
//   return <CourseCreationWizard authToken={authToken} />;
// };

// export default App;