import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import Login from './screens/Login';
import { useState } from 'react';

export default function App() {
  const handleLogin = (user:boolean|object) => {
    console.log("pressed login with user:", user);
    if(user === false){
      console.log(false)
      alert("Username is not correct")
    }
    else{
      console.log("login")
      changeCurrentScreen(<WelcomeScreen props={{ userDetails: user }} />);
    };
    }
    const handleLogout = () => {
      changeCurrentScreen(<Login onbuttonpress={handleLogin}/>)
    }

  const [currentScreen, changeCurrentScreen] = useState(
    <Login onbuttonpress={handleLogin}/>
  );
  // return <WelcomeScreen props={{userDetails:{permission:1}}} logOut={handleLogout} />;
  return currentScreen
}
