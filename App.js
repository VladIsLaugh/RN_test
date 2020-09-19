import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  Picker,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";

export default class App extends React.Component {
  state = {
    sunrise: "",
    sunset: "",
    lat: "",
    lng: "",
    offSetTime: 0,
    loading: false,
    cities: [],
    pickerVal: 0,
  };

  componentDidMount = () => {
    axios.get("https://restcountries.eu/rest/v2/all").then((cities) => {
      let cityArr = [];
      cities.data.forEach((element) => {
        cityArr.push(element.capital);
      });
      this.onChangeHandler(cityArr[0]);
      this.setState({
        cities: cityArr,
      });
    });
  };

  getFromLocal = async () => {
    this.setState({
      loading: true,
    });
    await this.getLocation().then((location) => {
      this.setState({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        offSetTime: new Date(location.timestamp).getTimezoneOffset() / 60,
      });
    });
    await this.getSunTime().then((time) => {
      this.setState({
        sunrise: this.getDateWithOffset(time.data.results.sunrise),
        sunset: this.getDateWithOffset(time.data.results.sunset),
        loading: false,
      });
    });
  };

  getFromGlobal = async () => {
    this.setState({
      loading: true,
    });

    this.getSunTime().then((e) => {
      this.setState({
        lat: this.state.lat,
        lng: this.state.lng,
        sunrise: this.getDateWithOffset(e.data.results.sunrise),
        sunset: this.getDateWithOffset(e.data.results.sunset),
        loading: false,
      });
    });
  };

  getDateWithOffset = (date) => {
    let hours = Number(date.split(":")[0]) - Number(this.state.offSetTime);
    return hours + date.slice(date.indexOf(":"));
  };

  getCityLocation = async (pickerVal) => {
    return await axios.get(`http://open.mapquestapi.com/geocoding/v1/address?key=55AhwkWG4Q0TgrT21xTKdMHB36kLLqtE
&location=${pickerVal || this.state.pickerVal}`);
  };

  getLocation = async () => {
    Location.requestPermissionsAsync();
    return await Location.getCurrentPositionAsync({});
  };

  getOffset = async (lat, lng) => {
    return await axios.get(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=6XHWPNX38NKN&format=json&by=position&lat=${
        lat || this.state.lat
      }&lng=${lng || this.state.lng}`
    );
  };

  getSunTime = async (lat, lng) => {
    console.log(this.state);
    return await axios.get(
      `https://api.sunrise-sunset.org/json?lat=${lat || this.state.lat}&lng=${
        lng || this.state.lng
      }`
    );
  };

  onChangeHandler = async (itemValue) => {
    this.setState({
      loading: true,
      sunrise: "",
      sunset: "",
      pickerVal: itemValue,
    });
    let lat, lng;
    axios
      .get(
        `http://open.mapquestapi.com/geocoding/v1/address?key=55AhwkWG4Q0TgrT21xTKdMHB36kLLqtE
    &location=${itemValue}`
      )
      .then((location) => {
        lat = location.data.results[0].locations[0].latLng.lat;
        lng = location.data.results[0].locations[0].latLng.lng;
        axios
          .get(
            `http://api.timezonedb.com/v2.1/get-time-zone?key=6XHWPNX38NKN&format=json&by=position&lat=${lat}&lng=${lng}`
          )
          .then((timezone) => {
            console.log(timezone.data.gmtOffset);
            this.setState({
              offSetTime: timezone.data.gmtOffset / 3600,
              lat: lat,
              lng: lng,
              loading: false,
            });
          });
      });
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.loading ? (
          <React.Fragment>
            <Picker
              selectedValue={this.state.pickerVal}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue) => this.onChangeHandler(itemValue)}
            >
              {this.state.cities.map((item, index) => {
                return <Picker.Item label={item} value={index} key={index} />
              })}
            </Picker>
            {!!this.state.sunrise && (
              <React.Fragment>
                <Text>Sunrise:{this.state.sunrise}</Text>
                <Text>Sunset:{this.state.sunset}</Text>
              </React.Fragment>
            )}

            <View>
              <Button
                onPress={this.getFromLocal}
                title="Get my location"
                color="#841584"
                accessibilityLabel="Learn more about this purple button"
                style={styles.btn}
              />
            </View>
            <Button
              onPress={this.getFromGlobal}
              title="Get City location"
              color="#158484"
              accessibilityLabel="Learn more about this purple button"
              style={styles.btn}
            />
            <StatusBar style="auto" />
          </React.Fragment>
        ) : (<View><ActivityIndicator size="large" /></View>)}
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
