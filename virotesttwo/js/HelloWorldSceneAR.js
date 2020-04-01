"use strict";

// we import react in the beginning. Component is also imported because this is a class-based component.
import React, { Component } from "react";

// next we import StyleSheet from react .. pretty self-explanatory
import { StyleSheet } from "react-native";

// we import mercator as merc. this will allow us to convert geolocated coordinates into AR coordinates
var merc = require("mercator-projection");

// Necessary components from react-viro that are required to construct this scene
import {
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroBox,
  ViroMaterials,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroAnimations,
  ViroARPlaneSelector,
  ViroNode,
  ViroPolyline
} from "react-viro";

let interval;
export default class HelloWorldSceneAR extends Component {
  // In a react component life-cycle, the constructor is called first.
  // The two purposes for the instructor is initialize the local state and/or binding an event handler(s) into an instance.
  constructor() {
    // super() is the parent constructor. Usually, you pass props inside the super() function
    super();

    // Set initial state here
    this.state = {
      animation: "loopRotate",
      threeWords: "///searching.for.words",
      position: "",
      latitude: "",
      longitude: "",
      devicePosition: {},
      incrementor: 1,
      grid: "no grid yet",
      landmarks: ""
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.findCoordinates();
    }, 3000);
    // this.testLandmarks();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.setState({ incrementor: 0 });
  }

  testLandmarks = () => {
    // must use ngrok for requests to work on iOS!
    const textUrl = `https://f875121d.ngrok.io/landmarks`;
    console.log(textUrl);
    fetch(textUrl, {
      method: "GET"
    })
      .then(res => {
        res
          .json()
          .then(result => {
            this.setState({landmarks: JSON.stringify(result)});
          })
          .catch(e => console.error("Oops! Something is going on:  " + e));
      })
      .catch(e => {
        console.error("Ooops!! Here is the error: " + e);
      });
  };

  findCoordinates = () => {
    // this.setState({ incrementor: this.state.incrementor + 1 });
    navigator.geolocation.watchPosition(
      position => {
        const location = JSON.stringify(position);
        var devicePosition = merc.fromLatLngToPoint({
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.latitude)
        });
        // this.setState({ incrementor: this.state.incrementor + 1 });
        this.setState({
          position: position.coords.latitude + ", " + position.coords.longitude,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          devicePosition: devicePosition
        });
        console.log(devicePosition);
        this.get3Words(position.coords.latitude, position.coords.longitude);
        this.getGrid(position.coords.latitude, position.coords.longitude);
      },
      error => Alert.alert(error.message)
    );
  };

  get3Words = (lat, lng) => {
    var textURL = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=en&key=UAT9QR8X`;
    fetch(textURL, {
      method: "GET"
    }).then(res => {
      res
        .json()
        .then(result => {
          this.setState({
            threeWords: "///" + result.words
          });
        })
        .catch(e => console.error("Oops! Something is going on:  " + e));
    });
  };

  /**
   * getGrid takes the lat and lng of the device then it gets a north east corner by .001 degrees (roughly 1/3rd of a kilometer) and the southwest corner as well.
   * These two corners are needed for W3W in order to make a grid surrounding the device. This way, whenever a user uses this application, they get a grid displayed real-time around
   * them to interact with. 
   */
  getGrid = (lat, lng) => {
    var southWestLat = lat - 0.001;
    var southWestLng = lng - 0.001;
    var northEastLat = lat + 0.001;
    var northEastLng = lng + 0.001;
    var textUrl = `https://api.what3words.com/v3/grid-section?key=UAT9QR8X&bounding-box=${southWestLat}%2C${southWestLng}%2C${northEastLat}%2C${northEastLng}&format=json`;
    fetch(textUrl, {
      method: "Get"
    })
      .then(res => {
        res.json().then(result => {
          this.renderGrid(result);
          // this.setState({ grid: JSON.stringify(result) });
        });
      })
      .catch(e => {
        this.setState({ grid: e.toString() });
      });
  };

  // This function tkaes the grid found before and renders using ViroPolyline
  renderGrid = result => {
    var gridList = [];
    for (let element of result.lines) {
      var startPoint = merc.fromLatLngToPoint({
        lat: element.start.lat,
        lng: element.start.lng
      });
      var endPoint = merc.fromLatLngToPoint({
        lat: element.end.lat,
        lng: element.end.lng
      });
      console.log(startPoint);
      console.log(endPoint);
      var startPositionX = (startPoint.x * 2.12) - this.state.devicePosition.x;
      var startPositionZ = (startPoint.y * 2.12) - this.state.devicePosition.y;
      var endPositionX = endPoint.x - this.state.devicePosition.x;
      var endPositionZ = endPoint.y - this.state.devicePosition.y;
      var startPosition = { x: startPositionX, z: startPositionZ };
      var endPosition = { x: endPositionX, z: endPositionZ };
      var position = { start: startPosition, end: endPosition };
      gridList.push(position);
    }
    this.grid = gridList.map((element, index) => (
      // TODO: RENDER THIS PROPERLY
      <ViroPolyline
        key={index}
        position={[element.start.x, 0, element.end.z]}
        points={[
          [element.start.x, 0, element.start.z],
          [element.end.x, 0, element.end.z]
        ]}
      ></ViroPolyline>
    ));
  };

  // In the next part of the component life-cycle, we render() the component. In this case, we are simply returning the ARScene with a child
  // ViroText that contains the initial state text `Initializing AR....`.
  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized}>
        {this.grid}
        <ViroText
          text={this.state.threeWords}
          scale={[1, 1, 1]}
          position={[0.3, 1, -3.0]}
          style={styles.helloWorldTextStyle}
        />
        <ViroText
          text={this.state.position}
          scale={[1, 1, 1]}
          position={[0.3, 0.5, -3.0]}
          style={styles.helloWorldTextStyle}
        />
        <ViroText
          text={this.state.landmarks}
          scale={[1, 1, 1]}
          position={[-0.6, 0, -1.0]}
          style={styles.helloWorldTextStyle}
        />
        <ViroAmbientLight color={"#aaaaaa"} />
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -1, -0.2]}
          position={[0, 3, -1]}
          color="#ffffff"
          castsShadow={true}
        />
        <ViroARPlaneSelector>
          <Viro3DObject
            source={require("./res/LTGMASK_3dmodel.obj")}
            resources={[
              require("./res/LTGMASK_3dmodel.obj"),
              require("./res/LTGMASK_3dmodel.obj"),
              require("./res/LTGMASK_3dmodel.obj")
            ]}
            animation={{ name: "loopRotate", run: true, loop: true }}
            position={[-3, 0.1, -1]}
            scale={[0.002, 0.002, 0.002]}
            type="OBJ"
          />
        </ViroARPlaneSelector>
        <Viro3DObject
          source={require("./res/LTGMASK_3dmodel.obj")}
          resources={[
            require("./res/LTGMASK_3dmodel.obj"),
            require("./res/LTGMASK_3dmodel.obj"),
            require("./res/LTGMASK_3dmodel.obj")
          ]}
          animation={{ name: "loopRotate", run: true, loop: true }}
          position={[0, 0, -3]}
          scale={[0.002, 0.002, 0.002]}
          type="OBJ"
        />
        <ViroNode>
          <Viro3DObject
            source={require("./res/emoji_smile/emoji_smile.vrx")}
            resources={[
              require("./res/emoji_smile/emoji_smile_diffuse.png"),
              require("./res/emoji_smile/emoji_smile_normal.png"),
              require("./res/emoji_smile/emoji_smile_specular.png")
            ]}
            animation={{ name: this.state.animation, run: true, loop: true }}
            position={[-0.5, 0.1, -3]}
            scale={[0.6, 0.6, 0.6]}
            type="VRX"
          />
        </ViroNode>
      </ViroARScene>
    );
  }

  // When the onInitialized() state is TRACKING_NORMAL (meaning the application is running), it changes the text state to HelloWorld.
  // Else, it's got no tracking and we do nothing (or handle it). Every ARScene must have the component <ViroARScene> at the top level
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text: "LONO THE GOD"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  _onDrag(dragToPos, source) {
    // this.setState({
    //   text: "dragging emoji!"
    // });
    // dragtoPos[0]: x position
    // dragtoPos[1]: y position
    // dragtoPos[2]: z position
  }
}

// We declare the styles here. Self-explanatory...
var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: "Courier New",
    fontSize: 20,
    color: "#e11f26",
    fontWeight: "bold",
    textAlignVertical: "center",
    textAlign: "center"
  }
});

// We define the 'grid' value here. The require() function is a special function which converts the filepath into a value to be used, so the platform can fetch and use this resource.
ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require("./res/grid_bg.jpg")
  }
});

// Here we declare an animation that loops on rotate. It rotates around the Y axis, which is what we want!
ViroAnimations.registerAnimations({
  loopRotate: { properties: { rotateY: "+=45" }, duration: 500 }
});

module.exports = HelloWorldSceneAR;
