import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Animated, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface AccountDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function AccountDrawer({ visible, onClose }: AccountDrawerProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(visible);
  
  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      // Ensure it starts from off-screen before animating in
      slideAnim.setValue(width);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        // Only hide the modal completely after the animation is finished
        setIsModalVisible(false);
      });
    }
  }, [visible]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          onClose();
          await logout();
          router.replace('/');
        }
      }
    ]);
  };
  
  const handleNavigation = (path: string) => {
    onClose();
    router.push(path as any);
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay Background */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        
        {/* Sliding Drawer */}
        <Animated.View 
          style={[
            styles.drawer, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {/* User Header - Only show if logged in */}
            {isAuthenticated && user && (
              <View style={styles.userHeader}>
                <IconSymbol name="person.crop.circle.fill" size={60} color={BrandColors.primary} />
                <Text style={styles.userName} numberOfLines={1}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user?.email || user?.phone || ''}</Text>
              </View>
            )}
            
            {/* Common Menu Links */}
            <View style={styles.menuLinks}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/(tabs)')}>
                <IconSymbol name="house.fill" size={24} color={BrandColors.dark} />
                <Text style={styles.menuText}>Home</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/(tabs)/category')}>
                <IconSymbol name="list.bullet" size={24} color={BrandColors.dark} />
                <Text style={styles.menuText}>Categories</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/(tabs)/wishlist')}>
                <IconSymbol name="heart.fill" size={24} color={BrandColors.dark} />
                <Text style={styles.menuText}>Wishlist</Text>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
              
              {isAuthenticated && (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); Alert.alert('My Orders', 'Coming soon!'); }}>
                    <IconSymbol name="cube.box" size={24} color={BrandColors.dark} />
                    <Text style={styles.menuText}>My Orders</Text>
                    <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => handleNavigation('/(tabs)/profile')}>
                    <IconSymbol name="person.crop.circle.fill" size={24} color={BrandColors.dark} />
                    <Text style={styles.menuText}>Account Settings</Text>
                    <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            
            <View style={{ flex: 1 }} />
            
            {/* Footer Action */}
            {isAuthenticated ? (
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <IconSymbol name="arrow.right.square" size={20} color={BrandColors.red} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.loginActionBtn} onPress={() => handleNavigation('/login')}>
                <IconSymbol name="person.crop.circle.fill" size={20} color="#FFFFFF" />
                <Text style={styles.loginBtnText}>Login / Register</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.dark,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.dark,
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  menuLinks: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.dark,
    marginLeft: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.red,
    marginLeft: 8,
  },
  loginActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
