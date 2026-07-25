import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { shopApi } from '@/services/api';
import { BrandColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ReviewModalProps {
  visible: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImageAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
}

export default function ReviewModal({ visible, productId, onClose, onSuccess }: ReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<ImageAsset[]>([]);

  // Existing review states for edit mode
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>([]);
  const [imagesNeedsToRemove, setImagesNeedsToRemove] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (visible && productId) {
      checkExistingReview();
    } else {
      resetForm();
    }
  }, [visible, productId]);

  const resetForm = () => {
    setRating(5);
    setComment('');
    setImages([]);
    setExistingReviewId(null);
    setExistingImages([]);
    setImagesNeedsToRemove([]);
    setInitialLoading(true);
  };

  const checkExistingReview = async () => {
    setInitialLoading(true);
    try {
      const res = await shopApi.get(`/reviews/check/${productId}`);
      if (res.data?.data?.review) {
        const rev = res.data.data.review;
        setExistingReviewId(rev._id);
        setRating(rev.rating || 5);
        setComment(rev.comment || '');
        if (rev.images) {
          setExistingImages(rev.images);
        }
      }
    } catch (err: any) {
      console.log('[ReviewModal] No existing review found or check failed:', err?.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickImage = async () => {
    const totalImages = existingImages.length + images.length;
    if (totalImages >= 5) {
      Alert.alert(t('common.limitReached', 'Limit Reached'), t('reviews.maxImagesLimit', 'You can upload a maximum of 5 images.'));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5 - totalImages,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const remainingSlots = 5 - (existingImages.length + images.length);
        const selectedAssets = result.assets.slice(0, remainingSlots).map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName || `review_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        }));

        if (result.assets.length > remainingSlots) {
          Alert.alert(t('common.limitReached', 'Limit Reached'), t('reviews.maxImagesExtraIgnored', 'Only 5 images total are allowed. Extra selections were ignored.'));
        }

        setImages((prev) => [...prev, ...selectedAssets]);
      }
    } catch (error) {
      Alert.alert(t('common.error', 'Error'), t('reviews.galleryError', 'Failed to select image from gallery.'));
    }
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setImagesNeedsToRemove((prev) => [...prev, publicId]);
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert(t('common.notice', 'Notice'), t('reviews.validRatingNotice', 'Please select a valid star rating.'));
      return;
    }
    if (!comment.trim()) {
      Alert.alert(t('common.notice', 'Notice'), t('reviews.briefReviewNotice', 'Please write a brief review comment.'));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('comment', comment.trim());

      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `review_${idx}.jpg`,
          type: img.mimeType || 'image/jpeg',
        } as any);
      });

      if (existingReviewId) {
        if (imagesNeedsToRemove.length > 0) {
          formData.append('imagesNeedsToRemove', JSON.stringify(imagesNeedsToRemove));
        }
        await shopApi.patch(`/reviews/${existingReviewId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert(t('common.success', 'Success'), t('reviews.updateSuccess', 'Review updated successfully!'));
      } else {
        await shopApi.post(`/reviews/product/${productId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert(t('common.success', 'Success'), t('reviews.submitSuccess', 'Review submitted successfully!'));
      }

      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || t('reviews.submitFailed', 'Failed to submit review. Please ensure you have purchased this item.');
      Alert.alert(t('common.notice', 'Notice'), msg);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const totalImages = existingImages.length + images.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{existingReviewId ? t('reviews.editReview', 'Edit Your Review') : t('reviews.writeReview', 'Write a Review')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={loading}>
                <FontAwesome5 name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {initialLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text style={styles.loadingText}>{t('reviews.checkingExisting', 'Checking existing review...')}</Text>
              </View>
            ) : (
              <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                {/* Rating Section */}
                <Text style={styles.label}>{t('reviews.yourRating', 'Your Rating')}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starBtn}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5
                        name="star"
                        solid={star <= rating}
                        size={32}
                        color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comment Section */}
                <Text style={styles.label}>{t('reviews.yourReview', 'Your Review')}</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder={t('reviews.reviewPlaceholder', 'Tell us what you think about this product...')}
                  placeholderTextColor="#9CA3AF"
                  value={comment}
                  onChangeText={setComment}
                  editable={!loading}
                />

                {/* Photo Upload Section */}
                <View style={styles.photoHeader}>
                  <Text style={styles.label}>{t('reviews.addPhotos', 'Add Photos')} ({totalImages}/5)</Text>
                  {totalImages < 5 && (
                    <TouchableOpacity onPress={handlePickImage} style={styles.addPhotoBtn} disabled={loading}>
                      <FontAwesome5 name="camera" size={14} color={BrandColors.primary} style={styles.cameraIcon} />
                      <Text style={styles.addPhotoText}>{t('reviews.addPhotosBtn', 'Add Photos')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  <View style={styles.photoGrid}>
                    {/* Existing Cloud Images */}
                    {existingImages.map((img) => (
                      <View key={img.publicId} style={styles.imageThumbBox}>
                        <Image source={{ uri: img.url }} style={styles.thumbImage} contentFit="cover" />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removeExistingImage(img.publicId)}
                          disabled={loading}
                        >
                          <FontAwesome5 name="times-circle" solid size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {/* New Local Images */}
                    {images.map((img, index) => (
                      <View key={`new_${index}`} style={styles.imageThumbBox}>
                        <Image source={{ uri: img.uri }} style={styles.thumbImage} contentFit="cover" />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removeNewImage(index)}
                          disabled={loading}
                        >
                          <FontAwesome5 name="times-circle" solid size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {totalImages === 0 && (
                      <TouchableOpacity onPress={handlePickImage} style={styles.emptyPhotoBox} disabled={loading}>
                        <FontAwesome5 name="image" size={24} color="#9CA3AF" />
                        <Text style={styles.emptyPhotoText}>{t('reviews.selectUpTo5', 'Select up to 5 pictures')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitText}>{existingReviewId ? t('reviews.updateReview', 'Update Review') : t('reviews.submitReview', 'Submit Review')}</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.bottomSpacer} />
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
  },
  loadingBox: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  formContent: {
    maxHeight: 500,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  starBtn: {
    padding: 2,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
    height: 110,
    marginBottom: 20,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraIcon: {
    marginRight: 6,
  },
  addPhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  photoScroll: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  imageThumbBox: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  emptyPhotoBox: {
    width: 150,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
  },
  emptyPhotoText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 25,
  },
});
