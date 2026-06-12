import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TOAST_MS = 1900;

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message !== null && (
        <View pointerEvents="none" style={s.toast}>
          <Text style={s.toastText}>{message}</Text>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 92, alignSelf: 'center',
    backgroundColor: 'rgba(20,26,36,0.94)',
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 11,
    zIndex: 30, elevation: 30,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  toastText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 12.5 },
});
