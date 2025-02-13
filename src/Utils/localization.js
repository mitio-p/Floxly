const en = {
  home: "Home",
  search: "Search",
  messages: "Messages",
  notifications: "Notifications",
  create: "Create",
  profile: "Profile",
  log_out: "Log out",
  edit_profile: "Edit profile",
  settings: "Settings",
  gallery: "Gallery",
  followers: "Followers",
  following: "Following",
  account_privacy: "Account privacy",
  best_friends: "Best friends",
  change_photo: "Change photo",
  username: "Username",
  fullname: "Fullname",
  bio: "Bio",
  submit: "Submit",
  private_account: "Private account",
  private_account_description_public:
    "When your account is public everyone can see your gallery and posts.",
  private_account_description_private:
    "When your account is private only your followers what you approved will be able to see your gallery and posts.",
  type_message: "Message...",
};
const bg = {
  home: "Начало",
  search: "Търси",
  messages: "Съобщения",
  notifications: "Нотификации",
  create: "Създай",
  profile: "Профил",
  log_out: "Излез",
  edit_profile: "Редактирай профил",
  settings: "Настройки",
  gallery: "Галерия",
  followers: "Последователи",
  following: "Последвани",
  account_privacy: "Поверителност",
  best_friends: "Добри приятели",
  change_photo: "Смени снимка",
  username: "Потребителско име",
  fullname: "Пълно име",
  bio: "Информация",
  submit: "Изпрати",
  private_account: "Скрит профил",
  private_account_description_public:
    "Когато акаунта е публичен, публикациите са видими за всеки.",
  private_account_description_private:
    "Когато акаунта е скрит само одобрени последователи могат да виждат вашите публикациите.",
  type_message: "Съобщение...",
};

export function getLocale(key) {
  if (localStorage.getItem("lang") === "bg") {
    return bg[key];
  } else {
    return en[key];
  }
}
