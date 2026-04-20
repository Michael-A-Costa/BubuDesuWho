/** Nickname labels for member buttons (seiyuu names) per group */
export const MEMBER_NICKNAMES: Record<string, Record<number, string>> = {
  muse: {
    1: 'Emitsun', 2: 'Nanjolno', 3: 'Ucchi', 4: 'Mimorin',
    5: 'Rippi', 6: 'Pile', 7: 'Kussun', 8: 'Shikaco', 9: 'Soramaru',
  },
  aqours: {
    1: 'Anchan', 2: 'Shukashuu', 3: 'Rikyako', 4: 'King',
    5: 'Furirin', 6: 'Aikyan', 7: 'Arisha', 8: 'Suwawa', 9: 'Ainya',
    10: 'Asamin', 11: 'Hinahina', 12: '',
  },
  nijigasaki: {
    1: 'Yurippe', 2: 'Mayuchi', 3: 'Kaorin', 4: 'Miyutan',
    5: 'Murapon', 6: 'Akarin', 7: 'Tomoriru', 8: 'Chunrun', 9: 'Chiemii',
    10: 'Moepii', 11: 'Homin', 12: 'Niinya', 13: 'Konomin',
  },
};

export type ShortcutGroup = { label: string; members: number[]; extraOnly?: boolean; subunit?: boolean };
export const SHORTCUT_GROUPS: Record<string, ShortcutGroup[]> = {
  muse: [
    { label: 'Printemps', members: [1, 3, 8], subunit: true },
    { label: 'lily white', members: [4, 5, 7], subunit: true },
    { label: 'BiBi', members: [2, 6, 9], subunit: true },
    { label: '1st years', members: [5, 6, 8] },
    { label: '2nd years', members: [1, 3, 4] },
    { label: '3rd years', members: [2, 7, 9] },
  ],
  aqours: [
    { label: 'CYaRon', members: [1, 2, 5], subunit: true },
    { label: 'Guilty Kiss', members: [3, 6, 9], subunit: true },
    { label: 'AZALEA', members: [4, 7, 8], subunit: true },
    { label: '1st years', members: [4, 5, 6] },
    { label: '2nd years', members: [1, 2, 3] },
    { label: '3rd years', members: [7, 8, 9] },
    { label: 'Aqours', members: [1, 2, 3, 4, 5, 6, 7, 8, 9], extraOnly: true },
    { label: 'Saint Snow', members: [10, 11] },
  ],
  nijigasaki: [
    { label: 'DiverDiva', members: [4, 5], subunit: true },
    { label: 'A·ZU·NA', members: [1, 3, 7], subunit: true },
    { label: 'QU4RTZ', members: [2, 6, 8, 9], subunit: true },
    { label: 'R3BIRTH', members: [10, 11, 12], subunit: true },
    { label: '1st years', members: [2, 3, 9, 10] },
    { label: '2nd years', members: [1, 5, 7, 11] },
    { label: '3rd years', members: [4, 6, 8, 12] },
  ],
};

/** Column layout for member buttons — must match play.html slot templates */
export const MEMBER_COLUMNS: Record<string, number[][]> = {
  muse: [
    [1, 3, 4],   // 2nd years: Honoka, Kotori, Umi
    [6, 5, 8],   // 1st years: Maki, Rin, Hanayo
    [9, 7, 2],   // 3rd years: Nico, Nozomi, Eli
  ],
  aqours: [
    [1, 2, 3],   // 2nd years: Chika, You, Riko
    [4, 5, 6],   // 1st years: Hanamaru, Ruby, Yoshiko
    [7, 8, 9],   // 3rd years: Dia, Kanan, Mari
  ],
  nijigasaki: [
    [1, 4, 7, 10, 13],  // Ayumu, Karin, Setsuna, Shioriko, Yu
    [2, 5, 8, 11],      // Kasumi, Ai, Emma, Lanzhu
    [3, 6, 9, 12],      // Shizuku, Kanata, Rina, Mia
  ],
};

export const HINT_SUBUNITS: Record<string, Record<string, string>> = {
  muse: { '1,3,8': 'Printemps', '4,5,7': 'lily white', '2,6,9': 'BiBi' },
  aqours: { '1,2,5': 'CYaRon', '3,6,9': 'Guilty Kiss', '4,7,8': 'AZALEA' },
  nijigasaki: { '4,5': 'DiverDiva', '1,3,7': 'A·ZU·NA', '2,6,8,9': 'QU4RTZ', '10,11,12': 'R3BIRTH' },
};
export const HINT_YEARS: Record<string, string[]> = {
  muse: ['1,3,4', '5,6,8', '2,7,9'],
  aqours: ['1,2,3', '4,5,6', '7,8,9'],
  nijigasaki: ['2,3,9,10', '1,5,7,11', '4,6,8,12'],
};
