export const USERS: Record<string, { type: 'PUBLIC' | 'GOV'; full_name?: string; wallet_address?: string }> = {
  'user-1': { type: 'PUBLIC', full_name: 'Amina K.' },
  'user-2': { type: 'PUBLIC', full_name: 'Brian O.' },
  'user-3': { type: 'GOV', full_name: 'Gov Registry' },
  'user-4': { type: 'PUBLIC', full_name: 'Chao W.' },
};
