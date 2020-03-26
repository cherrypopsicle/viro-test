'use strict';

// we import react in the beginning. Component is also imported because this is a class-based component.
import React, { Component } from 'react';

// next we import StyleSheet from react .. pretty self-explanatory
import { StyleSheet } from 'react-native';

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
  ViroNode
} from 'react-viro';

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
      incrementor: 1
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.findCoordinates();
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.setState({ incrementor: 0 });
  }

  get3Words = (lat, lng) => {
    var textURL = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=en&key=UAT9QR8X`;
    fetch(textURL, {
      method: "GET"
    }).then(res => { res.json().then(result => {
        this.setState({
          threeWords: "///" + result.words
        })
      })
      .catch(e => console.error("Oops! Something is going on:  " + e));
    })
  }

  findCoordinates = () => {
    // this.setState({ incrementor: this.state.incrementor + 1 });
      navigator.geolocation.watchPosition(
        position => {
          const location = JSON.stringify(position);
          this.setState({ incrementor: this.state.incrementor + 1});
          this.setState({position: position.coords.latitude + ", " + position.coords.longitude});
          this.get3Words(position.coords.latitude, position.coords.longitude);
        },
        error => Alert.alert(error.message),
      );
  }

  // In the next part of the component life-cycle, we render() the component. In this case, we are simply returning the ARScene with a child
  // ViroText that contains the initial state text `Initializing AR....`.
  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        <ViroText text={this.state.threeWords} scale={[1, 1, 1]} position={[.3, 1, -3.0]} style={styles.helloWorldTextStyle} />
        <ViroText text={this.state.position} scale={[1, 1, 1]} position={[.3, 0.5, -3.0]} style={styles.helloWorldTextStyle} />
        <ViroText text={this.state.incrementor.toString()} scale={[1, 1, 1]} position={[.3, 0, -3.0]} style={styles.helloWorldTextStyle} />
        <ViroAmbientLight color={"#aaaaaa"} />
        <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
          position={[0, 3, -1]} color="#ffffff" castsShadow={true} />
          <ViroARPlaneSelector>
          <Viro3DObject
              source={require('./res/LTGMASK_3dmodel.obj')}
              resources={[require('./res/LTGMASK_3dmodel.obj'),
                  require('./res/LTGMASK_3dmodel.obj'),
                  require('./res/LTGMASK_3dmodel.obj')]}
              animation={{name:'loopRotate',
                  run:true,
                  loop:true}}
              position={[-3, .1, -1]}
              scale={[.002, .002, .002]}
              type="OBJ" />
          </ViroARPlaneSelector>
        <Viro3DObject
              source={require('./res/LTGMASK_3dmodel.obj')}
              resources={[require('./res/LTGMASK_3dmodel.obj'),
                  require('./res/LTGMASK_3dmodel.obj'),
                  require('./res/LTGMASK_3dmodel.obj')]}
              animation={{name:'loopRotate',
                  run:true,
                  loop:true}}
              position={[0, 0, -3]}
              scale={[.002, .002, .002]}
              type="OBJ" />
        <ViroNode>
          <Viro3DObject
                source={require('./res/emoji_smile/emoji_smile.vrx')}
                resources={[require('./res/emoji_smile/emoji_smile_diffuse.png'),
                    require('./res/emoji_smile/emoji_smile_normal.png'),
                    require('./res/emoji_smile/emoji_smile_specular.png')]}
                animation={{name: this.state.animation,
                    run:true,
                    loop:true}}
                position={[-.5, .1, -3]}
                scale={[.6, .6, .6]}
                type="VRX" />
        </ViroNode>
      </ViroARScene>
    );
  }

  // When the onInitialized() state is TRACKING_NORMAL (meaning the application is running), it changes the text state to HelloWorld.
  // Else, it's got no tracking and we do nothing (or handle it). Every ARScene must have the component <ViroARScene> at the top level
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "LONO THE GOD"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }

  _onDrag(dragToPos, source)  {
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
    fontFamily: 'Courier New',
    fontSize: 20,
    color: '#e11f26',
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',  
  },
});

// We define the 'grid' value here. The require() function is a special function which converts the filepath into a value to be used, so the platform can fetch and use this resource.
ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('./res/grid_bg.jpg'),
  }
});

// Here we declare an animation that loops on rotate. It rotates around the Y axis, which is what we want!
ViroAnimations.registerAnimations({
  loopRotate:{properties:{rotateY:"+=45"}, duration:500},
});

module.exports = HelloWorldSceneAR;
