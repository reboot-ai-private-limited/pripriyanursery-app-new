import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Modal, Pressable } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shopApi, VideoItem } from '@/services/api';
import { BrandColors } from '@/constants/theme';

import { useTranslation } from 'react-i18next';

export default function VideoGallerySection() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await shopApi.get('/videos');
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setVideos(list);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Failed to fetch video showcase:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [t]);

  if (loading) {
    return (
      <View style={[styles.section, styles.centered]}>
        <ActivityIndicator size="small" color={BrandColors.primary} />
      </View>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Watch & Learn</Text>
        <Text style={styles.subtitle}>Grafting tutorials, live harvesting & nursery walkthroughs</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {videos.map((item, idx) => {
          const thumb = item.thumbnailUrl || item.image || '';
          if (!thumb) return null;
          return (
            <TouchableOpacity
              key={item._id || item.id || idx.toString()}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => {
                const url = item.videoUrl;
                if (url) {
                  setActiveVideo(url);
                }
              }}
            >
              <Image
                source={{ uri: thumb }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={250}
              />
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <IconSymbol name="play.fill" size={24} color={BrandColors.primary} />
                </View>
              </View>
              <View style={styles.titleOverlay}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title || 'Plant Video Showcase'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Inline Video Player Modal */}
      <Modal
        visible={!!activeVideo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveVideo(null)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => setActiveVideo(null)}
            activeOpacity={0.8}
          >
            <IconSymbol name="xmark" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {activeVideo && (
            <Video
              style={styles.videoPlayer}
              source={{ uri: activeVideo }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    width: 200,
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: BrandColors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
  }
});
