const en = {
  home: 'Home',
  search: 'Search',
  messages: 'Messages',
  notifications: 'Notifications',
  create: 'Create',
  profile: 'Profile',
  log_out: 'Log out',
  edit_profile: 'Edit profile',
  settings: 'Settings',
  gallery: 'Gallery',
  followers: 'Followers',
  following: 'Following',
  account_privacy: 'Account privacy',
  best_friends: 'Best friends',
  change_photo: 'Change photo',
  username: 'Username',
  fullname: 'Fullname',
  bio: 'Bio',
  submit: 'Submit',
  private_account: 'Private account',
  private_account_description_public: 'When your account is public everyone can see your gallery and posts.',
  private_account_description_private:
    'When your account is private only your followers what you approved will be able to see your gallery and posts.',
  type_message: 'Message...',
  message: 'Message',
  unfollow: 'Unfollow',
  cancel_request: 'Cancel request',
  follow: 'Follow',
  upload_first_photo: 'Upload your first photo',
  share_photos_memories: 'Share photos and memories with peoples around you!',
  upload_photo: 'Upload your photo!',
  account_no_photos: "This account havent't got any public photos",
  account_is_private: 'This account is private',
  private_account_description: "After the user accept your follow request you'll be able to see the gallery!",
  typing: 'Typing...',
  topics: 'Topics',
  posts: 'Posts',
  no_comments_yet: 'No comments yet!',
  be_first_to_comment: 'Be the first who will write a comment!',
  remove_from_list: 'Remove from the list',
  add_to_list: 'Add to the list',
  suggested: 'Suggested',
  follow_people_suggest: 'Follow people to see their posts here!',
  no_recomended_posts: 'You have no recommended posts!',
  login_to_account: 'Login to your account!',
  email_address: 'Email address',
  password: 'Password',
  have_no_account: "Haven't got an account?",
  forgot_password: 'Forgot password?',
  login: 'Login',
  reset_password: 'Reset your password',
  back_to_login: 'Back to login?',
  send_request: 'Send request',
  sign_in_suggest: 'Sign in to connect with your friends',
  full_name: 'Full name',
  username: 'Username',
  existing_account: 'Existing account?',
  register: 'Register',
};
const bg = {
  home: 'Начало',
  search: 'Търси',
  messages: 'Съобщения',
  notifications: 'Нотификации',
  create: 'Създай',
  profile: 'Профил',
  log_out: 'Излез',
  edit_profile: 'Редактирай профил',
  settings: 'Настройки',
  gallery: 'Галерия',
  followers: 'Последователи',
  following: 'Последвани',
  account_privacy: 'Поверителност',
  best_friends: 'Добри приятели',
  change_photo: 'Смени снимка',
  username: 'Потребителско име',
  fullname: 'Пълно име',
  bio: 'Информация',
  submit: 'Изпрати',
  private_account: 'Скрит профил',
  private_account_description_public: 'Когато акаунта е публичен, публикациите са видими за всеки.',
  private_account_description_private:
    'Когато акаунта е скрит само одобрени последователи могат да виждат вашите публикациите.',
  type_message: 'Съобщение...',
  message: 'Пиши',
  unfollow: 'Отпоследвай',
  cancel_request: 'Откажи заявка',
  follow: 'Последвай',
  upload_first_photo: 'Качете първата си снимка!',
  share_photos_memories: 'Споделяй снимки и моменти с хората около вас!',
  upload_photo: 'Качете снимка!',
  account_no_photos: 'В акаунта няма качени снимки',
  account_is_private: 'Акаунта е скрит',
  private_account_description: 'След като потребителя потвърди заявката ви за следване галерията ще е видима!',
  typing: 'Писане...',
  topics: 'Теми',
  posts: 'Публикации',
  no_comments_yet: 'Няма още коментари!',
  be_first_to_comment: 'Бъди първият написал коментар!',
  remove_from_list: 'Премахни от списъка',
  add_to_list: 'Добави в списъка',
  suggested: 'Предложения',
  follow_people_suggest: 'Следвайте хора за да видите техните публикации тук!',
  no_recomended_posts: 'Нямате препоръчани публикации!',
  login_to_account: 'Влезте във вашия акаунт!',
  email_address: 'Имейл адрес',
  password: 'Парола',
  have_no_account: 'Нямате акаунт?',
  forgot_password: 'Забравена парола?',
  login: 'Влез',
  reset_password: 'Възстановяване на паролата',
  back_to_login: 'Към вписване?',
  send_request: 'Изпрати заявка',
  sign_in_suggest: 'Регистрирайте се за да се свържете с приятелите си',
  full_name: 'Пълно име',
  username: 'Потребителско име',
  existing_account: 'Съществуващ акаунт?',
  register: 'Регистриране',
};

export function getLocale(key) {
  if (localStorage.getItem('lang') === 'en') {
    return en[key] ? en[key] : '[NO AVAIBLE TRANSLATION]';
  } else {
    return bg[key] ? bg[key] : '[NO AVAIBLE TRANSLATION]';
  }
}
