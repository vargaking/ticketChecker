# ticketChecker_v1.1

***//eng***
An android application made with React Native (Expo) and Firebase RealtimeDatabase to generate (print) and check qr code based tickets. I made it in a hurry, but it's one of my summer projects, to make this app more user friendly and less buggy. 

***//hun***
Ez egy androidos applikáció ami React Native (és Expo), valamint Firebase RealtimeDatabase használatával készült. Az appal qr kód alapú jegyeket lehet ellenőrizni. Picit siettségben csináltam, viszont a nyári projektjeim között van egy felhasználóbarátabb, kevésbé bugos verzió készítése.

## Telepítés/Felkészülés a használatra ⚙️
Először is telepítened kell az Expo Cli-t. Egyszerűen csak kövesd a hivatalos React Native dokumentációt: https://reactnative.dev/docs/environment-setup

Ezután néhány bővítményt kell telepítened:

 - expo-barcode-scanner
  `$ expo install expo-barcode-scanner`
 - firebase
  `$ expo install firebase`
 - md5
 `npm install md5`
 - radio-buttons-react-native
 `npm install radio-buttons-react-native --save`
 - react-native-viewport-units
 `npm install react-native-viewport-units --save`

Utána néhány dolgot még be kell állítgatni

 **1. Másolj át mindent a repoban található app.js-ből a projekted mappájában található app.js file-ba**
 
 **2.  Állítsd be a firebase-t**
 
 Menj el a console.firebase.google.com oldalra és csinálj egy új projektet az instrukciókat követve. Utána nyisd meg a Realtime Database lapot, indítsd el test mode-ban és a rules tabon mindent írj át true-ra.
 Utána nyisd meg az app.js file-t és a firebaseConfig nevű const-on belül másold be a saját adataid (project settings -> Your apps)
 
 **3. Állítsd be a jegytípusokat**
 
 Az app.js file-ban írd át a labeleket, illetve ha szükséges adj hozzá újakat az előzőek mintájára. Emellett érdemes beállítani a config file-od, valamint kicserélni a különböző indexképeket a sajátjaidra. További információkhoz olvasd el az expo dokumentációt. 
 



