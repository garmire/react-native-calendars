import React, { Component } from 'react';
import {
  Animated,
} from 'react-native';

export default withScroll = (WrappedComponent, options) => {

  const AnimatedWrappedComponent = Animated.createAnimatedComponent(WrappedComponent);

  return class extends Component {

    componentDidMount() {
      const { scrollServer } = this.props;
      if (scrollServer) {
        scrollServer.connect();
      }

      // let clampedScroll = scrollServer.getClampedScrollValue();
      // if (clampedScroll > 0) {
      //   this.scrollToOffset(clampedScroll);
      // }
    }

    componentWillUnmount() {
      const { scrollServer } = this.props;
      if (scrollServer) {
        scrollServer.disconnect();
      }
    }

    getComponent = () => {
      return this.refs.componentRef._component || this.refs.componentRef;
    }

    scrollToOffset = ({offset, animated}) => {
      let component = this.getComponent();
      if (component) {
        component.scrollToOffset({
          offset,
          animated,
        });
      }
    }

    onScrollListener = (event) => {
      const { onScroll } = this.props;
      if (onScroll) {
        onScroll(event);
      }
    }

    render() {
      console.log('withScroll render')
      const { scrollServer, inverted } = this.props;

      if (scrollServer) {
        let height = scrollServer.getNavigationBarHeight();
        let contentContainerStyle;
        if (!(options || {}).noScrollBehind) {
          contentContainerStyle = inverted ? { paddingBottom: height } : { paddingTop: height };
        } else {
          contentContainerStyle = { paddingBottom: height }
        }

        return (
          <AnimatedWrappedComponent
            ref={'componentRef'}
            {...this.props}
            {...scrollServer.scrollProps}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollServer.scrollAnim } } }],
              {
                useNativeDriver: true,  //todo: taken out to solve rare crazy flicker of collapsed navigationbar on unmount
                listener: this.onScrollListener,
              },
            )}
            contentContainerStyle={contentContainerStyle}
          />
        );
      }

      return (
        <WrappedComponent
          ref={'componentRef'}
          {...this.props}
        />
      );
    }
  }
}
