import { View, Image, Text, StyleSheet, ScrollView, TouchableNativeFeedback, TouchableOpacity, Modal, TextInput, Button} from 'react-native';
import React, { useState } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as fs from 'expo-file-system';
import colors from '../config/colors';

const readFileContents = async (fileName:string) => {
  const filePath = fs.documentDirectory + fileName;
  try {
    const content = await fs.readAsStringAsync(filePath);
    // console.log('File contents:', content);
    return content;
  } catch (error) {
    console.error('Error reading file: ', error);
    return "";
  }
};
const saveData = async (data:any, docName:string) => {
  const path = `${fs.documentDirectory}${docName}`;
  const content = await fs.readAsStringAsync(path);
  const jsonArray:any[] = JSON.parse(content)
  jsonArray.push(data)

  try {
    await fs.writeAsStringAsync(path, JSON.stringify(jsonArray));
    console.log('Data saved successfully', JSON.stringify(jsonArray));
  } catch (error) {
    console.error('Error saving data: ', error);
  }
};
const acceptRequest = async (docName:string, oldValue:any, acceptedOrNah:boolean|undefined) => {
  const path = `${fs.documentDirectory}${docName}`;
  const content = await fs.readAsStringAsync(path);
  const jsonArray:any[] = JSON.parse(content)
  const indexOfReq = jsonArray.findIndex(variable => variable.from === oldValue.from && variable.until === oldValue.until && variable.day === oldValue.day);
  if(indexOfReq !== -1){
    jsonArray[indexOfReq].accepted = acceptedOrNah
  }
  try {
    await fs.writeAsStringAsync(path, JSON.stringify(jsonArray));
    console.log('Data saved successfully', JSON.stringify(jsonArray));
  } catch (error) {
    console.error('Error saving data: ', error);
  }
};
// saveData({username:"keren", Id:2, permission:2}, "accounts.json")
const deleteLastEntry = async() => {
  const path = `${fs.documentDirectory}accounts.json`;
  const content = await fs.readAsStringAsync(path);
  console.log(content)
  const jsonArray:any[] = JSON.parse(content)
  const updatedArray:any[]=jsonArray.splice(0, -2)
  try {
    await fs.writeAsStringAsync(path, JSON.stringify(updatedArray));
    console.log('Data saved successfully', JSON.stringify(updatedArray));
  } catch (error) {
    console.error('Error saving data: ', error);
  }
}

function range(begin:number, einde:number, stap = 1){   /* js heeft geen range() optie dus hier gemaakt*/
    const result = [];
    for (let i = begin; i <= einde; i += stap) {
        result.push(i);
    }
    return result;
}
function returnColor(accepted:boolean){
  if(accepted){
    return "#92D56D"
  }
  else if(accepted === false){
    return "#F96969"
  }
  else {
    return "#FDE256"
  }
}
// touchableOpacity, touchableHighlight, touchableWithoutFeedback

let currentDate = {day:0, month:0, year:0}

let requests:any = []

const data:object[] = [
]
let hoursArray:string[] = [];    
for( const i of range(1, 24, 1)){
  if(String(i).length===1){
    hoursArray.push(`0${i}:00`)
    data.push({key:String(i), value:`0${i}:00`})
  }
  else{
    hoursArray.push(`${i}:00`)
    data.push({key:String(i), value:`${i}:00`})
  }
}
let showFirstDay = true
function showDay(day:number, month:number, year:number){
if(currentDate.day === 0 ){
  currentDate.day = day
  currentDate.month = month
  currentDate.year = year
}
  //use state variables
  const dateString:string = `${day}-${month}-${year}`
  const [displayText, setDisplayText] = useState(dateString);
  const [bookings, showBookings] = useState(true);
  const [popup, showPopup] = useState(false)
  const [datePopUp, showDatePopup] = useState(false)
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date("2002-1-1"))
  const [reqTitle, setReqTitle] = useState("")
  const [currentBookings, updatecurrentBookings] = useState([<View></View>])

  const updateBookings = async(currentDateToCheck:any) => {
    const bookingsToShow:any[] = []
    const result = await readFileContents("database.json")
    let i = 0
      for(const req of JSON.parse(result)){
        const booked = req.year === currentDateToCheck.year && req.month === currentDateToCheck.month && req.day === currentDateToCheck.day // if booking is on this day
        const lengthInHours = req.until - req.from
        if(booked){
          bookingsToShow.push(
            <View style={[styles.bubble, {backgroundColor:returnColor(req.accepted), height:lengthInHours*44,top:req.from*44, left:55}]} key ={i} >
            <Text>{req.title}</Text>
            </View>
          )
          i+=1
        }
    }
    updatecurrentBookings(bookingsToShow)
  }
  if(showFirstDay){
    const today = new Date()
    let reqCount = async () => {await readFileContents("database.json")}
    console.log("amount of requests: ", reqCount)
    updateBookings({day:today.getDate(), year: today.getFullYear(), month:today.getMonth()+1})
    showFirstDay = false
  }
  // event: DateTimePickerEvent, date?: Date
  const onchange = ({type}:DateTimePickerEvent, date: Date|undefined) => {
    if(type === "set"){
      const currentDate = date;
      setSelectedDate(currentDate);
      showDatePopup(false)
    }
    else{
      showDatePopup(false);
    }
  };
  return (
    <View style={styles.background}>
      <TouchableNativeFeedback onPress={()=>{
        return
      }}>
        <View style={{position:"absolute", alignSelf:"flex-start", top:30, left:20}}>
          <Text>Log out</Text>
        </View>
      </TouchableNativeFeedback>
      <Text style={styles.welcomeMSG}>MATAN</Text>
      <View style={styles.mainContent}>
        <TouchableOpacity onPress={() => {
          currentDate.day-=1
          if (currentDate.day <=0){ // if gone to past month
            if(currentDate.month-1 <= 0){ // if gone to past year
              currentDate.day = 31
              currentDate.month = 12
              currentDate.year -= 1
            }
            else{ // if gone to past month
              currentDate.day = 31
              currentDate.month -= 1
            }
          }
          setDisplayText(`${currentDate.day}-${currentDate.month}-${currentDate.year}`)
          showBookings(true)
          updateBookings(currentDate)
        }}>
        <Image source={require("../assets/arrowLeft.png")} style={styles.arrow}/>
        </TouchableOpacity>
        <View style={styles.dateWindow}>
          <Text style= {styles.topDate}>{displayText}</Text>
          <ScrollView style={styles.hoursContainer} contentOffset={{ x: 0, y: 300 }}>
            {hoursArray.map((text, index) => {
              return (
                <View style={styles.hourAndLine} key={index}>
                  <Text>{text}</Text>
                  <View style={styles.line}/>
                </View>
              );
            })}
            {currentBookings}
          </ScrollView>
        </View>
        <TouchableOpacity onPress={() => {
          currentDate.day += 1
          if (currentDate.day + 1 > 31){ // if gone to past month
            if(currentDate.month + 1 >= 12){ // if gone to past year
              currentDate.day = 1
              currentDate.month = 1
              currentDate.year += 1
            }
            else{ // if gone to past month
              currentDate.day = 1
              currentDate.month += 1
            }
          }
          setDisplayText(`${currentDate.day}-${currentDate.month}-${currentDate.year}`)
          showBookings(true)
          updateBookings(currentDate)
        }}>
        <Image source={require("../assets/arrowRight.png")} style={styles.arrow} />
        </TouchableOpacity> 
      </View>
        <View style={styles.legend}>
          <View style={styles.legendTag}>
            <View style={[styles.legendCircle, {backgroundColor:"#92D56D"}]}></View>
            <Text>Accepted</Text>
          </View>
          <View style={styles.legendTag}>
            <View style={[styles.legendCircle, {backgroundColor:"#FDE256"}]}></View>
            <Text>Pending</Text>
          </View>
          <View style={styles.legendTag}>
            <View style={[styles.legendCircle, {backgroundColor:"#F96969"}]}></View>
            <Text>Denied</Text>
          </View>
        </View>
      <TouchableNativeFeedback onPress={()=>{showPopup(true)}}>
        <View style={styles.requestButton}>
        <Text>Make car request</Text>
        </View>
      </TouchableNativeFeedback>
      <Modal
        animationType="slide"
        transparent={true}
        visible={popup}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
          <Text style={styles.popupTitle}>Select Date</Text>
          <View style={[styles.line, {width:"90%"}]}/>
          <View style={styles.popupLine}>
              <Text>Title:</Text>
              <TextInput style={styles.textInput} onChangeText={(inputText)=>{
                setReqTitle(inputText)
              }}/>
            </View>
            <View style={styles.popupLine}>
              <Text>From:</Text>
                <SelectList 
              setSelected={(value:string) => setSelectedTime(value)} 
              data={data} 
              save="value"
              />
            </View>
            <View style={styles.popupLine}>
              <Text>Until:</Text>
                <SelectList 
              setSelected={(value:string) => setSelectedEndTime(value)} 
              data={data} 
              save="value"
              />
            </View>
            <View style={styles.popupLine}>
              <Text>Date:</Text>
              {selectedDate.getTime() !== new Date("2002-1-1").getTime() && <Text>{selectedDate.toLocaleDateString()}</Text>}
              {selectedDate.getTime() === new Date("2002-1-1").getTime() && <TouchableNativeFeedback onPress={()=>{showDatePopup(true)}}>
                    <View style={styles.dateButton}>
                    <Text>Select date</Text>
                    </View>
                  </TouchableNativeFeedback>}
            </View>
            { datePopUp && <RNDateTimePicker value={new Date()} mode="date" display='spinner' onChange={onchange}
/>} 
            <View style={{flexDirection:"row", marginTop:10, gap:10}}>
            <TouchableOpacity onPress={()=>{showPopup(false)}} style={[styles.dateButton, { borderWidth:1, backgroundColor:"rgba(255, 0, 0, 0.7)", borderRadius:10 }]}>
            <Text>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{
              console.log(parseInt(selectedEndTime.split(":")[0]), selectedEndTime, selectedDate.toLocaleDateString(), reqTitle)
              if(!reqTitle){
                console.log("no title")
                alert("Please enter a title.")
              }
              else if(!selectedEndTime || !selectedTime){
                alert("Please select start and end hours of request.")
              }
              else if(parseInt(selectedEndTime.split(":")[0]) < parseInt(selectedTime.split(":")[0])){
                alert("Please make sure the starting hour is before ending hour.")
              }
              else if(selectedDate.getTime() === new Date("2002-1-1").getTime()){
                alert("Please select date.")
              }
              else{
              saveData(
              {
                  day: selectedDate.getDate(),
                  month: selectedDate.getMonth()+1,
                  year: selectedDate.getFullYear(),
                  from: parseInt(selectedTime.split(":")[0]),
                  until: parseInt(selectedEndTime.split(":")[0]),
                  title: reqTitle,
                  accepted: undefined
                }, "database.json"
            )
            updateBookings(currentDate)
            showPopup(false)
              }
}} style={[styles.dateButton, {backgroundColor:"green", borderRadius:10, borderWidth:1}]}>
            <Text>Confirm</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function showAdmin(day:number, month:number, year:number){
  if(currentDate.day === 0 ){
    currentDate.day = day
    currentDate.month = month
    currentDate.year = year
  }
  
    //use state variables
    const dateString:string = `${day}-${month}-${year}`
    const [displayText, setDisplayText] = useState(dateString);
    const [popup, showPopup] = useState(false)
    const [currentBookings, updatecurrentBookings] = useState([<View></View>])
    const [pressedReq, setPressedReq] = useState({title:"empty", from: 0, until: 0, year:0, month:0, day:0})
    
    const updateBookings = async(currentDateToCheck:any) => {
      const bookingsToShow:any[] = []
      const result = await readFileContents("database.json")
      let i = 0
        for(const req of JSON.parse(result)){
          const booked = req.year === currentDateToCheck.year && req.month === currentDateToCheck.month && req.day === currentDateToCheck.day // if booking is on this day
          const lengthInHours = req.until - req.from
          if(booked){
            console.log(req)
            bookingsToShow.push(
              <TouchableNativeFeedback onPress={()=> {
                showPopup(true)
                setPressedReq(req)
              }}>
              <View style={[styles.bubble, {backgroundColor:returnColor(req.accepted), height:lengthInHours*44,top:req.from*44, left:55}]} key ={i} >
              <Text>{req.title}</Text>
              </View>
              </TouchableNativeFeedback>
            )
            i+=1
          }
      }
      updatecurrentBookings(bookingsToShow)
    }
    if(showFirstDay){
      const today = new Date()
      updateBookings({day:today.getDate(), year: today.getFullYear(), month:today.getMonth()+1})
      showFirstDay = false
    }
    return (
      <View style={styles.background}>
        <Text style={styles.welcomeMSG}>KEREN</Text>
        <View style={styles.mainContent}>
          <TouchableOpacity onPress={() => {
            currentDate.day-=1
            if (currentDate.day <=0){ // if gone to past month
              if(currentDate.month-1 <= 0){ // if gone to past year
                currentDate.day = 31
                currentDate.month = 12
                currentDate.year -= 1
              }
              else{ // if gone to past month
                currentDate.day = 31
                currentDate.month -= 1
              }
            }
            setDisplayText(`${currentDate.day}-${currentDate.month}-${currentDate.year}`)
            updateBookings(currentDate)
          }}>
          <Image source={require("../assets/arrowLeft.png")} style={styles.arrow}/>
          </TouchableOpacity>
          <View style={styles.dateWindow}>
            <Text style= {styles.topDate}>{displayText}</Text>
            <ScrollView style={styles.hoursContainer} contentOffset={{ x: 0, y: 300 }}>
              {hoursArray.map((text, index) => {
                return (
                  <View style={styles.hourAndLine} key={index}>
                    <Text>{text}</Text>
                    <View style={styles.line}/>
                  </View>
                );
              })}
              {currentBookings}
            </ScrollView>
          </View>
          <TouchableOpacity onPress={() => {
            currentDate.day += 1
            if (currentDate.day + 1 > 31){ // if gone to past month
              if(currentDate.month + 1 >= 12){ // if gone to past year
                currentDate.day = 1
                currentDate.month = 1
                currentDate.year += 1
              }
              else{ // if gone to past month
                currentDate.day = 1
                currentDate.month += 1
              }
            }
            setDisplayText(`${currentDate.day}-${currentDate.month}-${currentDate.year}`)
            updateBookings(currentDate)
          }}>
          <Image source={require("../assets/arrowRight.png")} style={styles.arrow} />
          </TouchableOpacity> 
        </View>
          <View style={styles.legend}>
            <View style={styles.legendTag}>
              <View style={[styles.legendCircle, {backgroundColor:"#92D56D"}]}></View>
              <Text>Accepted</Text>
            </View>
            <View style={styles.legendTag}>
              <View style={[styles.legendCircle, {backgroundColor:"#FDE256"}]}></View>
              <Text>Pending</Text>
            </View>
            <View style={styles.legendTag}>
              <View style={[styles.legendCircle, {backgroundColor:"#F96969"}]}></View>
              <Text>Denied</Text>
            </View>
          </View>
          <Modal
        animationType="slide"
        transparent={true}
        visible={popup}
      >
        <View style={{flex:1, alignItems:"center", justifyContent:"center"}}>
          <View style={styles.adminPopup}>
            <View  style={{alignItems:"center"}}>
            <Text style={[styles.popupTitle, {color:"white", margin:10}]}>{pressedReq.title}</Text>
            <View style={{width:"80%", height:3, backgroundColor:"white"}}/>
            <Text style={[styles.popupTitle, {color:"white", marginTop:10}]}>Date:  {pressedReq.day}-{pressedReq.month}-{pressedReq.year}</Text>
            <Text style={[styles.popupTitle, {color:"white", marginTop:10}]}>From:  {pressedReq.from}</Text>
            <Text style={[styles.popupTitle, {color:"white", marginTop:10}]}>Until:  {pressedReq.until}</Text>
            </View>
            <View style={{flexDirection:"row", justifyContent:"space-between", margin:30}}>
              <TouchableNativeFeedback onPress={async()=> {
                await acceptRequest("database.json", pressedReq, true)
                updateBookings(currentDate)
                showPopup(false)
              }}>
                <View style={[styles.acceptButton, {backgroundColor:"green"}]}>
                <Text>Accept</Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={async()=> {
                await acceptRequest("database.json", pressedReq, false)
                updateBookings(currentDate)
                showPopup(false)
              }}>
                <View style={[styles.acceptButton, {backgroundColor:"rgba(255,0, 0, 0.75)"}]}>
                <Text>Reject</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
            <Button title = "Close" onPress={()=>showPopup(false)}/>
          </View>
        </View>
        </Modal>
        <TouchableNativeFeedback onPress={()=>{showPopup(true)}}>
          <View style={styles.requestButton}>
          <Text>View requests</Text>
          </View>
        </TouchableNativeFeedback>
       
      </View>
    );
  }

export default function WelcomeScreen({props}:any):any {
  const userDetails = props.userDetails
  const date = new Date();
  requests.push("hello")
  if(userDetails.permission === 1){
    return showDay(date.getDate(), date.getMonth()+1, date.getFullYear());
  }
  else if( userDetails.permission === 2){
    return showAdmin(date.getDate(), date.getMonth()+1, date.getFullYear());
  }
  else{
    console.log("none")
  }
}
const styles = StyleSheet.create({
  acceptButton:{
    width:100, 
    height:40,
    alignItems:"center",
    justifyContent:"center"
  },
  adminPopup:{
    height:"50%",
    width:"80%",
    backgroundColor:"rgba(0, 0, 0, 0.75)"
  },
  arrow:{
    width:20,
    height:30,
    padding: 20
  },
  background:{
    backgroundColor:colors.main,
    flex:1,
    alignItems:"center",
    gap:100
  },
  bubble:{
    width:75,
    position:"absolute",
    alignItems:"center"
  },
  mainContent:{
    width:"100%",
    top:60,
    height:"60%",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"row",
    gap:10
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  popupContent: {
    width:"80%",
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    gap:20
  },
  popupLine:{
    flexDirection:"row",
    gap:30,
    alignItems:"center",
  },
  popupTitle:{
fontSize:30,
fontWeight:"600"
  },
  dateButton:{
    padding:10,
    height:50,
    backgroundColor:colors.button,
    justifyContent:"center",
    borderWidth:0,

  },
  dateWindow:{
    backgroundColor:colors.secondary,
    width:"70%",
    height:"100%",
    borderRadius:15,
    alignItems:"center",
    padding: 10
  },
  hourAndLine:{
    flexDirection:"row",
    gap:20,
    marginTop:25
  },
  hoursContainer:{
    marginTop:30,
    width:"95%"
  },
  legend:{
    flexDirection:"row",
    backgroundColor:"lightgrey",
    gap:20,
    padding:10,
  },
  legendCircle:{
    width:20,
    height:20,
    borderRadius:1500
  },
  legendTag:{
    flexDirection:"row",
    gap:7
  },

  line:{
    borderBottomWidth: 1, 
    width: '70%', 
  },
  requestButton:{
    bottom:50,
    padding:10,
    height:50,
    backgroundColor:colors.button,
    justifyContent:"center",
    borderWidth:3
  },
  text:{
    fontSize:30,
    color:"white"
  },
  textInput:{
borderWidth:2,
width:"70%",
  },
topDate:{
  top:20,
  fontSize:20
},
welcomeMSG:{
fontSize:20,
position:"absolute",
top:30,
right: 50
},

});
