import { View, Image, Text, StyleSheet, ScrollView, TouchableNativeFeedback, TouchableOpacity, Modal, TextInput, Alert, Button} from 'react-native';
import React, { useState } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as fs from 'expo-file-system';
import colors from '../config/colors';

async function checkLogIn(usernameEntered:string){
    let user:any = {}
    const filePath = fs.documentDirectory + "accounts.json";
    try {
      const content = JSON.parse(await fs.readAsStringAsync(filePath))
      const userDetails = content.find(user => user.username === usernameEntered);
      user = userDetails
      if(user){
          return user
      }
      else{
        return false
      }
    } catch (error) {
      return false
    }
}
const tst = async () => {console.log( await checkLogIn("man"))}
tst()

export default function Login({ onbuttonpress }) {
    const [usernameInput, updateUsernameInput] = useState("");
  
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>LOGIN</Text>
          <TextInput
            style={styles.inputBox}
            placeholder='Username'
            onChangeText={(text) => { updateUsernameInput(text) }}
          />
          <Button title="Proceed" onPress={async () => onbuttonpress(await checkLogIn(usernameInput.toLowerCase()))} />
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
    container:{
        backgroundColor:colors.main,
        flex:1,
        alignItems:"center",
        justifyContent:"center",
        gap:100

      },
      content:{
        backgroundColor:colors.secondary,
        width:"85%",
        height:"60%",
        borderRadius:15,
        alignItems:"center"
      },
      inputBox:{
        width:"80%", 
        height:50,
        borderWidth:2,
        borderRadius:15,
        backgroundColor:"lightgrey",
        fontSize:20,
        margin:40,
        paddingLeft:20
      },
      title:{
        marginTop:20,
        fontSize:40
      }

    }

    )