export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  DirectoryTab: undefined;
  ForumTab: undefined;
  ChatTab: undefined;
  MarketplaceTab: undefined;
  ProfileTab: undefined;
};

export type MarketplaceStackParamList = {
  Marketplace: undefined;
  CreateProject: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  MentorList: undefined;
  MentorDetail: { mentorId: string };
  Notifications: undefined;
  Forum: undefined;
  CreatePost: undefined;
};

export type DirectoryStackParamList = {
  Directory: undefined;
  UserProfile: { userId: string };
};

export type ChatStackParamList = {
  Conversations: undefined;
  Chat: { otherId: string; otherName: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  AdminDashboard: undefined;
};
