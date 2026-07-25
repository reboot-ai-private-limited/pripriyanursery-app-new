import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import WholesaleFormModal from './WholesaleFormModal';

const { width } = Dimensions.get('window');

export default function WholesaleBanner() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => setModalVisible(true)}
          style={styles.bannerWrapper}
        >
          <Image
            source={require('@/assets/images/wholesale.avif')}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </TouchableOpacity>
      </View>

      <WholesaleFormModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  bannerWrapper: {
    width: '100%',
    height: (width - 32) / 3, // aspect-3/1 roughly, subtracting horizontal padding
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
