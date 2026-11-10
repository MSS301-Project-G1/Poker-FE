import { paths } from './paths'

export const adminNavigation = [
  { path: paths.adminUsers, label: 'Users', icon: 'manage_accounts', description: 'Find accounts, ban or unban, and see their history.' },
  { path: paths.adminAvatars, label: 'Avatars', icon: 'account_circle', description: 'Upload and manage the avatar catalog.' },
  { path: paths.adminShop, label: 'Shop', icon: 'storefront', description: 'Manage products, categories and coin packs.' },
  { path: paths.adminSeasons, label: 'Seasons', icon: 'leaderboard', description: 'Manage seasons and ranking rewards.' },
  { path: paths.adminTournaments, label: 'Tournaments', icon: 'emoji_events', description: 'Manage tournaments and schedules.' },
  { path: paths.adminMatchSettings, label: 'Match settings', icon: 'tune', description: 'Settings and rules for the next match.' },
]
