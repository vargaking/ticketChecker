import React, { useState, useEffect } from 'react';
import { StatusBar, Text, View, StyleSheet, Button, TouchableOpacity, TextInput, Clipboard } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase/app';
import database from 'firebase/database';
import md5 from 'md5';
import RadioButtonRN from 'radio-buttons-react-native';


var {vw, vh, vmin, vmax} = require('react-native-viewport-units');

const firebaseConfig = {
  //your firebase config
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}



export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [ticketIsValid, setTicketIsValid] = useState(false);
  const [promptIsVisible, setPromptIsVisible] = useState(false);
  const [hashKey, setHashKey] = useState(null);
  const [numOfCodes, setNumOfCodes] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [ticketType, setTicketType] = useState(null);
  const [numOfTickets, setNumOfTickets] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [newTicketType, setNewTicketType] = useState(null);
  const [currentPage, setCurrentPage] = useState('QR kód beolvasása');

  //radio buttons
  const data = [
    {
      label: 'Option1'
    },
    {
      label: 'Option2'
    },
    
  ]

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  function changeData(hashCode, isItValid, type) {
    if (type != null) { 
      firebase.database().ref(hashCode).set({
        valid: isItValid,
        type: type,
      });
    }else {
      firebase.database().ref(hashCode).set({
        valid: isItValid,
      });
    }
    
  }

  function removeData(hashCode) {
    firebase.database().ref(hashCode).remove();
  }

  function getData(hashCode) {
    firebase.database().ref(hashCode).get().then((snapshot) => {
      var validity = snapshot.child('/valid/').val();
      setTicketIsValid(validity);

      //TODO: hianyzo tipus kezelese
      if (validity == true) {
        var type = snapshot.child('/type/').val();
        if (type != null) {
          
          setTicketType(type);
        }else{
          setTicketType(null)
        }
      }
      
      
    });
    
  }


  function checkForUsed(key) {
    firebase.database().get().then((snapshot) => {
      console.log(snapshot);
    });
  }

  function generateCodes(key, count) {
    
    var codes = '';
    
    


    for (i = 0; i < count; i++) {
      var hash = md5(key + i);
      codes += hash + ';';

      firebase.database().ref(hash).set({
        valid: true,
      })

    }
    Clipboard.setString(codes);

    firebase.database().ref("/printCodes/" + key).set(codes);

    

  }

  const handleBarCodeScanned = ({ type, data }) => {
    setCurrentPage("Adatok lekérdezése...");
    setScanned(true);
    setQrCode(data);
    getData(data)
    
    
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle = "light-content" hidden={false} backgroundColor = "#35404a"></StatusBar>
      
      <View style={styles.menuBar}>      
        <Text style={styles.menuText}>QR kód beolvasása</Text>
        
      </View>
      {promptIsVisible != true && <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />}
      {promptIsVisible != true  && scanned != true && <Button title={'Kódok generálása'} onPress={() => {setPromptIsVisible(true); setCurrentPage("Kódok generálása")}}></Button>}
      {promptIsVisible && <View style={styles.generateCodes}>
        <TextInput
          onChangeText={setPrivateKey}
          style={styles.inputText}
          placeholder={'Privát kulcs'}
        ></TextInput>
        <TextInput
          onChangeText={setNumOfTickets}
          style={styles.inputText}
          placeholder={'Kódok száma'}
          keyboardType={'numeric'}
        ></TextInput>
        
        <View style={styles.generateButton}><TouchableOpacity onPress={() => {generateCodes(privateKey, numOfTickets); setPromptIsVisible(false); setCurrentPage("QR kódok generálása")}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 20}}>Generálás</Text></TouchableOpacity></View>
        <View style={styles.cancelButton}><TouchableOpacity onPress={() => {setPromptIsVisible(false); setCurrentPage("QR kódok beolvasása")}}><Text style={{color: '#fff', textAlign: 'center', fontSize: 20}}>Mégse</Text></TouchableOpacity></View>
      </View>}
             
      {scanned && <Button title={'Új kód beolvasása'} onPress={() => {setScanned(false); setCurrentPage("QR kód beolvasása")}} />}
      {scanned && <View style={styles.qrPopup}>
        {ticketIsValid && ticketType != null && <View>
          <Text style={styles.menuText}>Érvényes jegy</Text>
          {ticketIsValid && <Text style={styles.acceptText}>{ticketType} </Text>}
          <TouchableOpacity onPress={() => {changeData(qrCode, false, null); setScanned(false); setCurrentPage("QR kód beolvasása")}}><Text style={styles.useTicket}>Jegy felhasználása</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => {removeData(qrCode); setScanned(false); setCurrentPage("QR kód beolvasása")}}><Text style={styles.deleteTicket}>Jegy törlése</Text></TouchableOpacity>
        </View>
        }
        {ticketIsValid && ticketType == null && <View>
          <Text style={styles.menuText}>Hmm... Ez a jegy érvényes, de még nem választottak hozzá típust</Text>
          <RadioButtonRN
            data={data}
            selectedBtn={(e) => setNewTicketType(e.label)}
            boxActiveBgColor={"#c9ffea"}
            boxStyle={{
              height: 50
            }}
          />
          <TouchableOpacity onPress={() => {changeData(qrCode, true, newTicketType); setScanned(false); setCurrentPage("QR kód beolvasása")}}><Text style={styles.useTicket}>Típus kiválasztása</Text></TouchableOpacity>

        </View>
        }
        {ticketIsValid == false && <View>
          <Text style={styles.menuText}>Hoppá. Ez a jegy már fel lett használva</Text>
          <TouchableOpacity onPress={() => {changeData(qrCode, true, null); setScanned(false);}}><Text style={styles.useTicket}>Jegy hozzáadása az adatbázishoz</Text></TouchableOpacity>
        </View>}
        {ticketIsValid == null && <View>
          <Text style={styles.menuText}>Érvénytelen jegy</Text>
          <TouchableOpacity onPress={() => {changeData(qrCode, true, null); setScanned(false);}}><Text style={styles.useTicket}>Jegy hozzáadása az adatbázishoz</Text></TouchableOpacity>
        </View>}
      </View>}
      
    </View>
  );
}

const styles = StyleSheet.create({
  inputText: {
    position: 'relative',
    left: 10*vw,
    height: 40,
    width: 80*vw,
    borderWidth: 1,
    color: '#000',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 3*vh,
  },
  generateButton: {
    width: 60*vw,
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: '#62c236',
    color: '#fff',
    padding: 5*vw,
    left: 20*vw,
    top: 70*vh
  },
  cancelButton:{
    width: 60*vw,
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: '#fa3232',
    color: '#fff',
    padding: 5*vw,
    left: 20*vw,
    top: 80*vh
  },
  generateCodes: {
    backgroundColor: '#000',
    height: 100*vh,
    width: 100*vw,
  },
  headerText: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
  },
  simpleText:{
    color: '#fff',
    textAlign: 'center',
  },
  qrPopup: {
    backgroundColor: '#000',
    width: 100*vw,
    height: 100*vh,
  },
  useTicket: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    backgroundColor: 'green',
    marginTop: 7*vh,
    padding: 5*vh,
    paddingVertical: 2*vh,
  },
  deleteTicket: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    backgroundColor: 'red',
    marginTop: 10*vh,
    padding: 5*vh,
    paddingVertical: 2*vh,
  },
  acceptText: {
    top: 5*vh,
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
  },
  submitButton: {
    position: 'absolute',
    bottom:0,
    left:0,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  screen: {
    width: 100*vw,
    height: 100*vh,
    position: 'absolute',
    top: 0,
    backgroundColor: '#fff',
  },
  menuBar: {
    backgroundColor: '#35404a',
    width: 100*vw,
    height: 15*vw,
    justifyContent: 'center',
  },
  menuIcon: {
    position: 'relative',
    top: 1*vw,
    backgroundColor:'white',
    width: 9 * vw,
    height: 1 * vw,
    margin: 1*vw,
    borderRadius: 99,
  },
  menuWrapper: {
    position: 'absolute',
    left: 1*vw,
    top: -1*vw,
  },
  menuText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 3*vh
  },
  menuContainerOpened: {
    zIndex: -1,
    height: 100*vh - 15*vw,
    width: 70*vw,
    backgroundColor: '#85969e',
  },
  menuContainerClosed: {
    display:'none',
  },
  menuLinkText: {
    color: '#fff',
    backgroundColor: '#6d7d85',
    padding: 1*vw,
    fontSize: 5*vw,
    margin: 1*vw
  }
});
