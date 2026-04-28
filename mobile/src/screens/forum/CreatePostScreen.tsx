import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORIES = ['General', 'Career', 'Tech', 'Research', 'Internships'];

export const CreatePostScreen = () => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation();

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    setLoading(true);
    try {
      await api.post('/posts/', { 
        content: content.trim(), 
        author: user?.id, 
        category 
      });
      Alert.alert('Success', 'Post published successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error publishing post:', error);
      Alert.alert('Error', 'Failed to publish post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePublish} 
          disabled={!content.trim() || loading}
          style={[styles.publishBtn, !content.trim() && { opacity: 0.5 }]}
        >
          <Text style={styles.publishText}>{loading ? '...' : 'Publish'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
          placeholderTextColor={Colors.textSecondary}
        />

        <Text style={styles.sectionTitle}>Select Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                category === cat && styles.categoryChipTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.footer}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolBtn}>
            <Ionicons name="image-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Ionicons name="link-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Ionicons name="at-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Ionicons name="happy-outline" size={24} color={Colors.primary} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: Colors.text,
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: Spacing.xl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '700',
  },
  userName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  userRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  input: {
    ...Typography.body,
    fontSize: 18,
    color: Colors.text,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    ...Typography.bodyBold,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  toolbar: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  toolBtn: {
    padding: 8,
  }
});
