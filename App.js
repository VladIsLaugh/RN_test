import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";

export default class App extends React.Component {
  state = {
    sunrise: "",
    sunset: "",
    lat: "",
    lng: "",
    offSetTime: 0,
    loading: false,
  };
  getAll = async() =>{
    this.setState({
      loading:true
    })
    await this.getLocation2().then((e)=>{
      this.setState({
        lat:e.coords.latitude,
        lng:e.coords.longitude,
        offSetTime: new Date(e.timestamp).getTimezoneOffset()/60
      })
    })
    await this.getSunTime2().then((e)=>{
     e.json().then((ee)=>{
       this.setState({
        sunrise:this.getDateWithOffset(ee.results.sunrise),
        sunset:this.getDateWithOffset(ee.results.sunset),
        loading: false
       })
     })
    })
    .then(()=>{
      console.log(this.state)
    })

  }
  getDateWithOffset = (date) =>{
    return (+date.slice(0,1)-(this.state.offSetTime)+date.slice(1))
  }

  getLocation2 = async () => {
    Location.requestPermissionsAsync();
    return await Location.getCurrentPositionAsync({})

  };

  
  getOffset2 = async () => {
    return await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=6XHWPNX38NKN&format=json&by=position&lat=${this.state.lat}&lng=${this.state.lng}`
    )
  };


  getSunTime2 = async () => {
    return await fetch(
      `https://api.sunrise-sunset.org/json?lat=${this.state.lat}&lng=${this.state.lng}`
    )
     
  };
  render() {
    return (
      <View style={styles.container}>
        {
          !this.state.loading
          ?(
            <React.Fragment>
            <Text>Sunrise:{this.state.sunrise}</Text>
            <Text>Sunset: {this.state.sunset}</Text>
            <Button
              onPress={this.getAll}
              title="Learn More"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
            <StatusBar style="auto" />
            </React.Fragment>
          )
          :(
            <ActivityIndicator size="large" />
          )
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
