
// import CourseCreationWizard from "@/components/CourseCreationWizard";

// const Index = () => {
//   return <CourseCreationWizard />;
// };

// export default Index;


import React,{useState,useEffect} from "react";
import {LoginPage} from "@/components/LoginPage"
import CourseCreationWizard from "@/components/CourseCreationWizard"
const Index = () => {
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);
  

  const handleLogin = (token) => {
    console.log("entring to habdle lopgin---")
    setAuthToken(token);
    setIsAuthenticated(true);
    console.log("authToken --->",authToken)
    
  };

 

  
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

 
  return <CourseCreationWizard authToken={authToken} setAuthToken={setAuthToken} setIsAuthenticated={setIsAuthenticated} />;
};

export default Index;
