export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  DirectoryTab: undefined;
  ChatTab: undefined;
  JobsTab: undefined;
  ProfileTab: undefined;
};

export type JobsStackParamList = {
  Jobs: undefined;
  CreateProject: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  MentorList: undefined;
  MentorDetail: { mentorId: string };
  Notifications: undefined;
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
};
