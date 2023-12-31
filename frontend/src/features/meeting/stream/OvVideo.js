import React, { Component } from 'react';
import * as handpose from "@tensorflow-models/handpose";
import '@tensorflow/tfjs-backend-webgl';
import * as fp from "fingerpose";

export default class OvVideoComponent extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.decideHeight = this.decideHeight.bind(this);
    this.runHandpose = this.runHandpose.bind(this);
    this.detect = this.detect.bind(this);
  }


  detect = async (net) => {
    // Check data is available
    if (
      typeof this.videoRef.current !== "undefined" &&
      this.videoRef.current !== null
    ) {
      // Get Video Properties
      const video = this.videoRef.current;
      console.log('느어어어',this.videoRef.current);
      // Make Detections
      const hand = await net.estimateHands(video);

      console.log(hand);

      if(hand[0]){
        const landmarks = hand[0].landmarks;

        const thumbTip = landmarks[4];
        const thumbMiddle = landmarks[3]; 
      
        const indexTip = landmarks[8];
        const indexMiddle = landmarks[7]; 
      
        const middleTip = landmarks[12];
        const middleMiddle = landmarks[11];
      
        const ringTip = landmarks[16];
        const ringMiddle = landmarks[15]; 
      
        const pinkyTip = landmarks[20];
        const pinkyMiddle = landmarks[19]; 
      
        // 각 손가락의 끝 부분과 중간 관절의 y좌표 비교
        const isThumbOpen = thumbTip[1] < thumbMiddle[1];
        const isIndexOpen = indexTip[1] < indexMiddle[1];
        const isMiddleOpen = middleTip[1] < middleMiddle[1];
        const isRingOpen = ringTip[1] < ringMiddle[1];
        const isPinkyOpen = pinkyTip[1] < pinkyMiddle[1];

        console.log(isThumbOpen, isIndexOpen, isMiddleOpen, isRingOpen, isPinkyOpen);
        console.log(this.props.user.isReaction(), '손');

        console.log(this.props.handsUp);

        if (isThumbOpen&&isIndexOpen&&isMiddleOpen&&isRingOpen&&isPinkyOpen&&this.props.user.isReaction()!=='hand'){
            this.props.handsUp();
            console.log('손 들었음');
            console.log(this.props.user.isReaction(), '손 들은거 넣었당');
        }
        else{
          console.log('손 안들었음 '); // 시간

        }
      }
    }
};

runHandpose = async() => {
const net = await handpose.load();
console.log('handpose model loaded');

setInterval(()=> {
    this.detect(net);
}, 2000);
}
  

  
  componentDidMount() {
    console.log('사용자 상태 확인', this.props.user);
    if (this.props && this.props.user.streamManager && !!this.videoRef) {
      console.log('PROPS: ', this.props);
      this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
      if(this.props.handsUp&&this.props.user.isReaction()!=='hand'){
        this.runHandpose();
      }
    }

    if (this.props && this.props.user.streamManager.session && this.props.user && !!this.videoRef) {
      this.props.user.streamManager.session.on('signal:userChanged', (event) => {
        const data = JSON.parse(event.data);
        if (data.isScreenShareActive !== undefined) {
          this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
        }
      });
    }
  }

  componentDidUpdate(props) {
    if (props && !!this.videoRef) {
      this.props.user.getStreamManager().addVideoElement(this.videoRef.current);
    }
  }

  decideHeight() {
    if (this.props.user.isHost()) {
      if (this.props.cam) {
        return '56vh';
      } else {
        return '88vh';
      }
    }
    return '26vh';
  }

  render() {
    return (
      <video
        autoPlay={true}
        id={'video-' + this.props.user.getStreamManager().stream.streamId}
        ref={this.videoRef}
        muted={this.props.mutedSound}
        style={{ height: this.decideHeight() }}
      />
    );
  }
}
