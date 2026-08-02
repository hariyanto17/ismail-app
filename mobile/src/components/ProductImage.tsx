import React, { useState } from 'react';
import { Image, ImageStyle, StyleSheet, View } from 'react-native';

const placeholderImage = require('../assets/product-placeholder.png');

interface ProductImageProps {
  imageUrl?: string | null;
  style?: ImageStyle;
}

export const ProductImage: React.FC<ProductImageProps> = React.memo(({ imageUrl, style }) => {
  const [hasError, setHasError] = useState(false);

  const getSource = () => {
    if (imageUrl && !hasError) {
      return { uri: imageUrl };
    }
    return placeholderImage;
  };

  return (
    <Image
      source={getSource()}
      style={[styles.image, style]}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F9FAFB', // Matches background theme
  },
});

export default ProductImage;
