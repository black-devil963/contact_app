import React, { useState, useEffect , useRef} from 'react';
import Contacts from 'react-native-contacts';
import asImage from './as.png';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,TouchableOpacity,Image,Animated,useColorScheme,View,PermissionsAndroid,Alert,
} from 'react-native';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [cnt, setCnt] = useState();
  const [record, setr] = useState([]);
  const [search, setsearch] = useState(true);
  const [inputText, setInputText] = useState('');
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [stage, setStage] = useState(false);
  const contentWidth = useRef(new Animated.Value(0)).current;
  
  const fetchContactsCount = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        const count = await Contacts.getCount();
        setCnt(count);

        if (count !== 0) {
          Contacts.getAll()
            .then(contacts => {
              contacts.sort((a, b) =>
                a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
              );

              setr(contacts);            })
            .catch(e => {
              Alert.alert('Permission to access contacts was denied');
              console.warn('Permission to access contacts was denied');
            });
        }
      } else if (permission === PermissionsAndroid.RESULTS.DENIED) {
        console.log('Permission denied by user.');
      } else if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('Permission denied by user and cannot be requested again.');
      }
    } catch (error) {
      console.log('Error requesting permission:', error);
    }
  };

  useEffect(() => {
    fetchContactsCount();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'grey' : 'white',
    height: screenHeight,
  };

  function handleSearch(text) {
    setInputText(text);
    if (text.length) {
      setsearch(false);
      Contacts.getContactsMatchingString(text)
        .then(contacts => {
          contacts.sort((a, b) =>
            a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
          );
          setr(contacts);
        })
        .catch(e => {
          Alert.alert('Permission to access contacts was denied');
          console.warn('Permission to access contacts was denied');
        });
    } else {
      setsearch(true);
    }
  }

  const handleAlert = (a, s, d) => {
    Alert.alert(
      s ,//+ '\n' + s,
      (d && d.length > 0) ? d[0].number : a,
      [
        { text: 'OK', style: 'cancel' },
      ]
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View style={{ ...styles.header, backgroundColor: 'red',alignItems:'center' }}>
        <Text style={{ fontSize: 30,color:'white' }}>MY CONTACT APP</Text>
      </View>

      {stage && search && (
        <View style={{ ...styles.search, width:screenWidth-40,marginLeft:20}}>
          <Image source={asImage} style={{ width: 20, height: 20, alignSelf: 'center', marginStart: 15 }} />
        </View>
      )}
      
      {stage && <TextInput
        style={{ ...styles.search, zIndex: 1, width:screenWidth-40,marginLeft:20}}
        underlineColorAndroid="transparent"
        placeholder="                                 Search"
        value={inputText}
        placeholderTextColor="#3C3C47"
        autoCapitalize="none"
        onChangeText={text => handleSearch(text)}
      />}
      <View style={styles.maincontainer}>

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{
            backgroundColor: '#151620',
            height: stage?screenHeight - 150:screenHeight - 100,
            marginTop: stage?50:0
          }}
        >


          
          {record.map(item => (
            <TouchableOpacity
              key={item.recordID}
              onPress={() => handleAlert(item.recordID, item.displayName, item.phoneNumbers)}
              style={{ ...styles.container, width: screenWidth }}
            >
              {item.hasThumbnail ? (
                <Image source={{ uri: item.thumbnailPath }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <View style={styles.circle}>
                  <Text>{item.displayName[0]}</Text>
                </View>
              )}
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: 'white' }}>{item.displayName}</Text>
                {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                  <Text style={{ color: 'white' }}>{item.phoneNumbers[0].number}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
              onPress={() => setStage(!stage)}
              style={{ height:60,width:60,position:'absolute',backgroundColor:'lightblue',borderRadius:30,bottom:20,right:20,paddingTop:14}}>
                <Image source={asImage} style={{ width: 30, height: 30, alignSelf: 'center' }} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    backgroundColor: '#151620',
    height: 47,
    paddingLeft: 10,
    paddingTop: 7,
    marginBottom: 2,
  },

  header: {
    height: 100,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#151620',
  },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: '#3c3c47',
    flexDirection: 'row',
    borderRadius: 25,
    position: 'absolute',
    marginTop: 105,
    
  },

  circle: {
    backgroundColor: 'red',
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});

export default App;
