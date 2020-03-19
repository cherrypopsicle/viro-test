'use strict';

// we import react in the beginning. Component is also imported because this is a class-based component.
import React, { Component } from 'react';

// next we import StyleSheet from react .. pretty self-explanatory
import {StyleSheet} from 'react-native';

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
  ViroAnimations
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {

  // In a react component life-cycle, the constructor is called first. 
  // The two purposes for the instructor is initialize the local state and/or binding an event handler(s) into an instance.
  constructor() {
    // super() is the parent constructor. Usually, you pass props inside the super() function
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR..."
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  // In the next part of the component life-cycle, we render() the component. In this case, we are simply returning the ARScene with a child
  // ViroText that contains the initial state text `Initializing AR....`.
  render() {
    return (
      // When the onInitialized() state is TRACKING_NORMAL (meaning the application is running), it changes the text state to HelloWorld.
      // Else, it's got no tracking and we do nothing (or handle it). Every ARScene must have the component <ViroARScene> at the top level
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[0, 0, -0.5]} style={styles.helloWorldTextStyle} />
        {/* <ViroBox position={[0, 0, -.6]} scale={[.1, .1, .1]} materials={["grid"]} />
        				<ViroAmbientLight color={"#aaaaaa"} /> */}
        <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
          position={[0, 3, 1]} color="#ffffff" castsShadow={true} />
        <Viro3DObject
            source={require('./res/LTGMASK_3dmodel.obj')}
            resources={[require('./res/LTGMASK_3dmodel.obj'),
                require('./res/LTGMASK_3dmodel.obj'),
                require('./res/LTGMASK_3dmodel.obj')]}
            animation={{name:'loopRotate',
                run:true,
                loop:true}}
            position={[0, 0, -1]}
            scale={[.002, .002, .002]}
            type="OBJ" />
      </ViroARScene>
    );
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "LONO THE GOD"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Courier New',
    fontSize: 20,
    color: '#ffffff',
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
  loopRotate:{properties:{rotateY:"+=45"}, duration:1000},
});

module.exports = HelloWorldSceneAR;
