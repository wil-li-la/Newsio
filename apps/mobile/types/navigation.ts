export type RootStackParamList = {
  MainTabs: undefined;
  ArticleDetail: { id: string };
  EmailVerification: { type: 'signup' | 'email_change' };
  Login: undefined;
  SignUpSuccess: undefined;
};

export type TabParamList = {
  Newsfeed: undefined;
  Search: undefined;
  Library: undefined;
  Settings: undefined;
};
