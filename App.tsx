import React from 'react';
import {SafeAreaView} from 'react-native';
import Reel from './src/Reel';
function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Reel />
    </SafeAreaView>
  );
}

export default App;
