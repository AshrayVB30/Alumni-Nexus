import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  AppTabParamList, 
  HomeStackParamList, 
  DirectoryStackParamList,
  ChatStackParamList,
  ProfileStackParamList,
  JobsStackParamList
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

// Simplified additional screens
import { View, Text } from 'react-native';
const MentorListScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: Colors.background}}><Text style={Typography.body}>Mentors List (Expandable)</Text></View>;
const MentorDetailScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: Colors.background}}><Text style={Typography.body}>Mentor Profile Detail</Text></View>;
const NotificationsScreen = () => <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: Colors.background}}><Text style={Typography.body}>Notifications (Coming Soon)</Text></View>;

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const DirectoryStack = createStackNavigator<DirectoryStackParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const JobsStack = createStackNavigator<JobsStackParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="MentorList" component={MentorListScreen} />
    <HomeStack.Screen name="MentorDetail" component={MentorDetailScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
  </HomeStack.Navigator>
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
  </ProfileStack.Navigator>
);

const JobsStackNavigator = () => (
  <JobsStack.Navigator screenOptions={{ headerShown: false }}>
    <JobsStack.Screen name="Jobs" component={JobsScreen} />
    <JobsStack.Screen name="CreateProject" component={CreateProjectScreen} />
  </JobsStack.Navigator>
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
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'JobsTab') {
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
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Chat' }} />
      <Tab.Screen name="JobsTab" component={JobsStackNavigator} options={{ title: 'Jobs' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
