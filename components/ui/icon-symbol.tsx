// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'cart.fill': 'shopping-cart',
  'magnifyingglass': 'search',
  'leaf.fill': 'eco',
  'checkmark.shield.fill': 'verified',
  'message.fill': 'chat',
  'sun.max.fill': 'wb-sunny',
  'play.fill': 'play-arrow',
  'list.bullet': 'category',
  'person.crop.circle.fill': 'account-circle',
  'chevron.left': 'chevron-left',
  'line.3.horizontal.decrease.circle': 'filter-list',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string | SymbolViewProps['name'];
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name as string] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
