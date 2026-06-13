import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  onProceed: () => void;
};

// Prototype confirm gate — in-screen overlay (like CardDetailModal) so toasts stack above it.
export default function ConfirmModal({ request, scale, onClose }: {
  request: ConfirmRequest | null;
  scale: number;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  if (!request) return null;

  const z = (n: number) => n * scale;

  return (
    <Pressable
      onPress={onClose}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 21,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          width: z(400), backgroundColor: theme.modalBg, borderRadius: z(20), padding: z(22),
          shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
          elevation: 24,
        }}
      >
        <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(18), color: theme.modalText, marginBottom: z(6) }}>
          {request.title}
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(13), lineHeight: z(21), color: theme.inkDim, marginBottom: z(18) }}>
          {request.message}
        </Text>
        <View style={{ flexDirection: 'row', gap: z(9) }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1, padding: z(11), borderRadius: z(11),
              borderWidth: 1.5, borderColor: theme.ring2,
            }}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(13), color: theme.modalText, textAlign: 'center' }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { const run = request.onProceed; onClose(); run(); }}
            style={{
              flex: 1.3, padding: z(11), borderRadius: z(11),
              backgroundColor: theme.accent, borderWidth: 1, borderColor: theme.accentBorder,
            }}
          >
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(13), color: theme.accentText, textAlign: 'center' }}>
              {request.confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}
