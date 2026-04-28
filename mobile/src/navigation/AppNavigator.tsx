import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  AppTabParamList, 
  HomeStackParamList, 
  DirectoryStackParamList,
  ChatStackParamList,
  ProfileStackParamList,
  MarketplaceStackParamList
} from './types';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { DirectoryScreen } from '../screens/directory/DirectoryScreen';
import { ConversationsScreen } from '../screens/chat/ConversationsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { JobsScreen } from '../screens/jobs/JobsScreen';
import { CreateProjectScreen } from '../screens/jobs/CreateProjectScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { ForumScreen } from '../screens/forum/ForumScreen';
import { CreatePostScreen } from '../screens/forum/CreatePostScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { MentorsScreen } from '../screens/mentors/MentorsScreen';
import { MentorMatchingScreen } from '../screens/mentors/MentorMatchingScreen';

// Simplified additional screens
import { View, Text } from 'react-native';
const MentorDetailScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: Colors.background}}><Text style={Typography.body}>Mentor Profile Detail</Text></View>;

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const DirectoryStack = createStackNavigator<DirectoryStackParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const MarketplaceStack = createStackNavigator<MarketplaceStackParamList>();
const ForumStack = createStackNavigator<any>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="MentorList" component={MentorsScreen} />
    <HomeStack.Screen name="MentorDetail" component={MentorDetailScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="MentorMatching" component={MentorMatchingScreen} />
  </HomeStack.Navigator>
);

const ForumStackNavigator = () => (
  <ForumStack.Navigator screenOptions={{ headerShown: false }}>
    <ForumStack.Screen name="Forum" component={ForumScreen} />
    <ForumStack.Screen name="CreatePost" component={CreatePostScreen} />
  </ForumStack.Navigator>
);

const DirectoryStackNavigator = () => (
  <DirectoryStack.Navigator screenOptions={{ headerShown: false }}>
    <DirectoryStack.Screen name="Directory" component={DirectoryScreen} />
    <DirectoryStack.Screen name="UserProfile" component={UserProfileScreen} />
  </DirectoryStack.Navigator>
);

const ChatStackNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="Conversations" component={ConversationsScreen} />
    <ChatStack.Screen name="Chat" component={ChatScreen} />
  </ChatStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
  </ProfileStack.Navigator>
);

const MarketplaceStackNavigator = () => (
  <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
    <MarketplaceStack.Screen name="Marketplace" component={JobsScreen} />
    <MarketplaceStack.Screen name="CreateProject" component={CreateProjectScreen} />
  </MarketplaceStack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DirectoryTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ForumTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'MarketplaceTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors.white,
        },
        tabBarLabelStyle: {
          ...Typography.small,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="DirectoryTab" component={DirectoryStackNavigator} options={{ title: 'Directory' }} />
      <Tab.Screen name="ForumTab" component={ForumStackNavigator} options={{ title: 'Forum' }} />
      <Tab.Screen name="MarketplaceTab" component={MarketplaceStackNavigator} options={{ title: 'Marketplace' }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Chat' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
