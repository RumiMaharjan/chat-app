//@refresh reset
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import { StyleSheet, Text, View, LogBox, TextInput, Button} from 'react-native';
import * as firebase from "firebase";
import AsyncStorage from '@react-native-community/async-storage';
import "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA0VcVT-FoJj5EpfQ4ruorEYrvkYUvzeVI",
  authDomain: "react-native-chat-19e27.firebaseapp.com",
  projectId: "react-native-chat-19e27",
  storageBucket: "react-native-chat-19e27.appspot.com",
  messagingSenderId: "783962239750",
  appId: "1:783962239750:web:79065b9045359e31ae6487",
  measurementId: "G-XKKLBHX7SQ"
};

if (firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig);

}

LogBox.ignoreWarnings(['Setting a timer for a long period of time']);

const db = firebaseConfig.firestore();
const chatsRef = db.collection('chats');

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);


  useEffect(()=>{
    readUser();
    const unsubscribe = chatsRef.onSnapshot(querySnapshot =>{
      const messagesFirestore = querySnapshot
      .docChanges()
      .filter(({type})=> type === 'added')
      .map(({doc})=>{
        const message = doc.data();
        return {...message, createdAt: message.createdAt.toDate()}
        
      }).sort((a,b)=> b.createdAt.getTime() - a.createdAt.getItem());
    appendMessages(messagesFirestore);
    })
    return ()=> unsubsribe()

  }, []);
  
  const appendMessages = useCallback((messages)=>{
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser(){
    const user = await AsyncStorage.getItem('user');
    if(user){
      setUser(JSON.parse(user));
    }

  };

  async function handlePress(){
    const _id = Math.random().toString(36).substring(7);
    const user= {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function handleSend(messages){
    const writes = messages.map((m) => chatsRef.add(m));
    await Promise.all(writes)
  }

  if(!user){
    return (
    <View style={styles.container}>
      <TextInput 
      style={styles.input}
       placeholder="Enter your name" 
       value={name}
       onChangeText={setName}
       />

       <Button
        title="Enter the chat"
        onPress={handlePress}
        />

    </View>
    );
  }


  return <GiftedChat 
  messages={messages}
   user={user}
   onSend={handleSend}/>;
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  input:{
    height:50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    borderColor: 'gray',
    marginBottom:20
  }
});



// <!-- The core Firebase JS SDK is always required and must be listed first -->
// <script src="https://www.gstatic.com/firebasejs/8.1.2/firebase-app.js"></script>

// <!-- TODO: Add SDKs for Firebase products that you want to use
//      https://firebase.google.com/docs/web/setup#available-libraries -->
// <script src="https://www.gstatic.com/firebasejs/8.1.2/firebase-analytics.js"></script>
