import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ToastContext = createContext(null);

export function ToastProvider({ children, colors }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const timer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type });
    opacity.setValue(0);
    translateY.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 18, duration: 180, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 2200);
  }, [opacity, translateY]);

  const icon = toast?.type === 'error' ? 'alert-circle' : 'checkmark-circle';
  const color = toast?.type === 'error' ? colors.danger : colors.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={[
              styles.surface,
              styles.content,
              {
                backgroundColor: colors.glassFillStrong,
                borderColor: colors.glassBorder,
                shadowColor: colors.glassShadow,
              },
            ]}
          >
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    zIndex: 100,
  },
  surface: {
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});
