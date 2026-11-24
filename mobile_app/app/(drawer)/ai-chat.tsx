import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServerWakeBanner } from '@/components/ServerWakeBanner';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAnimatedKeyboardHeight } from '@/hooks/use-animated-keyboard-height';
import { ApiError, aiApi, documentsApi, type ApiDocument } from '@/services/api';

// Enable LayoutAnimation on Android so selecting a bubble animates its expansion.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatScreen() {
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Smooth keyboard-driven lift so the input bar + send button glide above the keyboard.
  const { paddingStyle } = useAnimatedKeyboardHeight(16);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await documentsApi.list();
      setDocuments(docs);
      if (docs.length > 0) setSelectedId((prev) => prev ?? docs[0]._id);
    } catch {
      // Leave the selector empty; the empty state below guides the user.
    }
  }, []);

  // Refresh the document chips whenever the screen regains focus (e.g. after upload).
  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  // Selecting a bubble expands it in place (LayoutAnimation) while collapsing the rest.
  const selectDocument = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedId(id);
  }, []);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || !selectedId || sending) return;

    const userMessage: ChatMessage = { id: `${Date.now()}-u`, role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const text = await aiApi.chat(prompt, selectedId);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: 'assistant', content: text || 'No response' },
      ]);
      // AI analysis completed → tactile feedback.
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const isBusy = err instanceof ApiError && err.status === 503;
      // On a transient "high demand" 503, restore the prompt so the user can retry
      // without retyping it.
      if (isBusy) setInput(prompt);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: 'assistant',
          content: isBusy
            ? 'The AI service is currently busy. Please try again in a moment.'
            : err instanceof Error
              ? err.message
              : 'Something went wrong',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.flex}>
        <Animated.View style={[styles.container, paddingStyle]}>
          <ServerWakeBanner />

          <Text style={styles.sectionLabel}>Select Document</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipRow}>
            {documents.length === 0 ? (
              <Text style={styles.emptyHint}>No documents uploaded yet</Text>
            ) : (
              documents.map((item) => {
                const active = item._id === selectedId;
                const shortLabel = (item.title || 'Doc').trim().slice(0, 3) || 'Doc';
                return (
                  <Pressable
                    key={item._id}
                    onPress={() => selectDocument(item._id)}
                    style={[styles.chip, active && styles.chipActive]}>
                    {active ? (
                      <>
                        <Ionicons name="document-text" size={14} color="#ffffff" />
                        <Text
                          style={[styles.chipText, styles.chipTextActive]}
                          numberOfLines={1}>
                          {item.title || 'Untitled'}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.chipShort} numberOfLines={1}>
                        {shortLabel}
                      </Text>
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <FlatList
            ref={listRef}
            style={styles.flex}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="sparkles-outline" size={40} color={colors.accent} />
                <Text style={styles.emptyTitle}>
                  {selectedId ? 'Ask a question about your document' : 'Select a document to start'}
                </Text>
                <Text style={styles.emptyHint}>
                  {selectedId
                    ? 'The assistant answers using the selected document as context.'
                    : 'Pick a document above, then type your question.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isUser = item.role === 'user';
              return (
                <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              sending ? (
                <View style={styles.bubbleRow}>
                  <View style={[styles.bubble, styles.bubbleAssistant]}>
                    <ActivityIndicator size="small" color={colors.textMuted} />
                  </View>
                </View>
              ) : null
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={selectedId ? 'Type your question…' : 'Select a document first'}
              placeholderTextColor={colors.muted}
              editable={!!selectedId && !sending}
              style={styles.input}
              multiline
            />
            <Pressable
              onPress={send}
              disabled={!selectedId || sending || !input.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                (!selectedId || sending || !input.trim()) && styles.sendButtonDisabled,
                pressed && styles.sendButtonPressed,
              ]}>
              <Ionicons name="send" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 16,
      gap: 10,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: c.textMuted,
    },
    chipScroll: {
      flexGrow: 0,
      flexShrink: 0,
      maxHeight: 44,
    },
    chipRow: {
      gap: 8,
      paddingVertical: 2,
      alignItems: 'center',
    },
    chip: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 44,
      height: 38,
      borderRadius: 19,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.surface,
      paddingHorizontal: 12,
    },
    chipActive: {
      flexDirection: 'row',
      gap: 6,
      // maxWidth: 220,
      paddingHorizontal: 14,
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    chipShort: {
      fontSize: 13,
      fontWeight: '700',
      color: c.primary,
      textTransform: 'uppercase',
    },
    chipText: {
      fontSize: 13,
      color: '#ffffff',
      fontWeight: '600',
      flexShrink: 1,
    },
    chipTextActive: {
      color: '#ffffff',
    },
    messages: {
      flexGrow: 1,
      gap: 10,
      paddingVertical: 8,
    },
    bubbleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    bubbleRowUser: {
      justifyContent: 'flex-end',
    },
    bubble: {
      maxWidth: '80%',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleUser: {
      backgroundColor: c.primary,
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      backgroundColor: c.border,
      borderBottomLeftRadius: 4,
    },
    bubbleText: {
      fontSize: 14,
      lineHeight: 20,
      color: c.text,
    },
    bubbleTextUser: {
      color: '#ffffff',
    },
    emptyChat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
    },
    emptyHint: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: c.text,
    },
    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonPressed: {
      opacity: 0.85,
    },
  });
