import { Platform } from 'react-native';

const tintColorLight = '#34A853';
const tintColorDark = '#34A853';

export const Colors = {
  light: {
    text: '#222222',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#34A853',
    secondary: '#FFBB00',
    dark: '#222222',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    greenLight: '#E8F7EC',
    redLight: '#FEF2F2',
    red: '#EF4444',
    muted: '#6B7280',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#34A853',
    secondary: '#FFBB00',
    dark: '#FFFFFF',
    surface: '#1F2937',
    border: '#374151',
    greenLight: '#14532D',
    redLight: '#450A0A',
    red: '#EF4444',
    muted: '#9CA3AF',
  },
};

export const BrandColors = {
  primary: '#34A853',
  secondary: '#FFBB00',
  dark: '#222222',
  lightGreen: '#E8F7EC',
  lightRed: '#FEF2F2',
  red: '#EF4444',
  border: '#E5E7EB',
  surface: '#F9FAFB',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
