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
import Moment from "react-moment";

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
    fetch("https://restcountries.eu/rest/v2/all").then((response) => {
      let cityArr = [];
      response.json().then((e) => {
        e.forEach((element) => {
          cityArr.push(element.capital);
        });
        this.setState({
          cities: cityArr,
        });
      });
    });
  };

  getFromLocal = async () => {
    this.setState({
      loading: true,
    });
    await this.getLocation().then((e) => {
      this.setState({
        lat: e.coords.latitude,
        lng: e.coords.longitude,
        offSetTime: new Date(e.timestamp).getTimezoneOffset() / 60,
      });
    });
    await this.getSunTime()
      .then((e) => {
        e.json().then((ee) => {
          this.setState({
            sunrise: this.getDateWithOffset(ee.results.sunrise),
            sunset: this.getDateWithOffset(ee.results.sunset),
            loading: false,
          });
        });
      })
      .then(() => {
        console.log(this.state);
      });
  };

  getFromGlobal = async () => {
    this.setState({
      loading: true,
    });
    let lat, lng;
    await this.getCityLocation().then((response) => {
      response.json().then((e) => {
        console.log(1);
        console.log(e);
        lat = e.results[0].locations[0].latLng.lat;
        lng = e.results[0].locations[0].latLng.lng;
        this.getSunTime(lat, lng)
          .then((e) => {
            e.json().then((ee) => {
              console.log(2);
              this.setState({
                lat: lat,
                lng: lng,
                sunrise: ee.results.sunrise,
                sunset: ee.results.sunset,
                loading: false,
              });
            });
          })

          .then(() => {
            console.log(this.state);
          });
      });
    });
  };

  getDateWithOffset = (date) => {
    console.log(new Date(String(date)));
    return date.slice(0, 1) - Number(this.state.offSetTime) + date.slice(1);
  };

  getCityLocation = async () => {
    return await fetch(`http://open.mapquestapi.com/geocoding/v1/address?key=55AhwkWG4Q0TgrT21xTKdMHB36kLLqtE
&location=${this.state.pickerVal}`);
  };

  getLocation = async () => {
    Location.requestPermissionsAsync();
    return await Location.getCurrentPositionAsync({});
  };

  getOffset = async () => {
    return await fetch(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=6XHWPNX38NKN&format=json&by=position&lat=${this.state.lat}&lng=${this.state.lng}`
    );
  };

  getSunTime = async (lat, lng) => {
    console.log(this.state);
    return await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat || this.state.lat}&lng=${
        lng || this.state.lng
      }`
    );
  };
  render() {
    return (
      <View style={styles.container}>
        {!this.state.loading ? (
          <React.Fragment>
            <Picker
              selectedValue={this.state.pickerVal}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue) =>
                this.setState({ pickerVal: itemValue })
              }
            >
              {this.state.cities.map((item, index) => {
                return <Picker.Item label={item} value={index} key={index} />;
              })}
            </Picker>
            {this.state.sunrise && (
              <React.Fragment>
                <Text>Sunrise:{this.state.sunrise}</Text>
                <Text>Sunset: {this.state.sunset}</Text>
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
        ) : (
          <ActivityIndicator size="large" />
        )}
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
  buttonContainer: {
    flexDirection: "row",
  },
  btn: {},
});
