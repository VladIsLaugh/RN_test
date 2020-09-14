import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Button, ActivityIndicator} from "react-native";
import * as Location from 'expo-location';

export default  function App() {
   const [sunrise, setSunrise] = React.useState();
   const [sunset, setSunset] = React.useState();
     const [location, setLocation] = React.useState("qwd");
       const [errorMsg, setErrorMsg] = React.useState(null);

        const getLocation = async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    
  };

  const getOffset = async() =>{

await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=6XHWPNX38NKN&format=json&by=position&lat=${location.coords.latitude}&lng=${location.coords.longitude}`)
  .then(response => response.json())
  .then(commits => {
    console.log(commits.gmtOffset)
  })}

  const fetchData = async()=>{
    getLocation()
    getOffset()
    console.log(location.coords.latitude)
await fetch(`https://api.sunrise-sunset.org/json?lat=${location.coords.latitude}&lng=${location.coords.longitude}`)
  .then(response => response.json())
  .then(commits => {
setSunrise(commits.results.sunrise)
setSunset(commits.results.sunset)
  } )
  }

  return (
    <View style={styles.container}>
      <Text>Sunrise:{sunrise}</Text>
      <Text>Sunset: {sunset}</Text>
      <Text> {JSON.stringify(location)}</Text>
     <Button
  onPress={fetchData}
  title="Learn More"
  color="#841584"
  accessibilityLabel="Learn more about this purple button"
/>
      <StatusBar style="auto" />
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
