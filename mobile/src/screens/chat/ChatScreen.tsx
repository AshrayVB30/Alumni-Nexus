import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Avatar } from '../../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChatStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'Chat'>;

export const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { otherId, otherName } = route.params;
  const { user, token } = useAuthStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList | null>(null);

  useEffect(() => {
    // 1. Fetch History
    const fetchHistory = async () => {
      try {
        const data = await chatService.getChatHistory(otherId);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // 2. Connect WebSocket
    if (token) {
      const wsUrl = chatService.getWebSocketUrl(token);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WS Connected');
        setConnected(true);
      };

      ws.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        // Only append if message belongs to this conversation
        if (
          (data.sender_id === otherId && data.receiver_id === user?.id) ||
          (data.sender_id === user?.id && data.receiver_id === otherId)
        ) {
          setMessages(prev => [...prev, data]);
          // Scroll to bottom after state update
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      };

      ws.current.onerror = (e) => console.error('WS Error:', e);
      ws.current.onclose = () => {
        console.log('WS Closed');
        setConnected(false);
      };
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [otherId, token, user?.id]);

  const sendMessage = () => {
    if (!inputText.trim() || !ws.current || !connected) return;

    const messageData = {
      receiver_id: otherId,
      message: inputText.trim()
    };

    ws.current.send(JSON.stringify(messageData));
    setInputText('');
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && <Avatar name={otherName} size={32} style={styles.messageAvatar} />}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
            {item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Avatar name={otherName} size={36} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherName}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: connected ? Colors.success : Colors.error }]} />
            <Text style={styles.statusText}>{connected ? 'Online' : 'Reconnecting...'}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, idx) => item._id || idx.toString()}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    marginRight: Spacing.md,
  },
  headerAvatar: {
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
    lineHeight: 18,
  },
  myMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text,
  },
  timestamp: {
    ...Typography.small,
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTimestamp: {
    color: Colors.textMuted,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    ...Typography.body,
    color: Colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
});
