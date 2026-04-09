import { GroupName, MEMBER_MAPPING } from './types';
import { arrayEqual } from './utils';

export function mapToLabel(group: GroupName, ans: number[]): string {
  if (group === 'muse') {
    if (ans.length === 9) return "μ's";
    if (arrayEqual(ans, [1, 3, 8])) return 'Printemps';
    if (arrayEqual(ans, [4, 5, 7])) return 'lily white';
    if (arrayEqual(ans, [2, 6, 9])) return 'BiBi';
    if (arrayEqual(ans, [1, 3, 4])) return '2nd years';
    if (arrayEqual(ans, [5, 6, 8])) return '1st years';
    if (arrayEqual(ans, [2, 7, 9])) return '3rd years';
  } else if (group === 'aqours') {
    if (ans.length === 9) return 'Aqours';
    if (arrayEqual(ans, [1, 2, 5])) return 'CYaRon';
    if (arrayEqual(ans, [3, 6, 9])) return 'Guilty Kiss';
    if (arrayEqual(ans, [4, 7, 8])) return 'AZALEA';
    if (arrayEqual(ans, [1, 2, 3])) return '2nd years';
    if (arrayEqual(ans, [4, 5, 6])) return '1st years';
    if (arrayEqual(ans, [7, 8, 9])) return '3rd years';
  } else if (group === 'saint-aqours-snow') {
    if (arrayEqual(ans, [1, 2, 3, 4, 5, 6, 7, 8, 9])) return 'Aqours';
    if (arrayEqual(ans, [10, 11])) return 'Saint Snow';
    if (arrayEqual(ans, [1, 2, 3])) return '2nd years';
    if (arrayEqual(ans, [4, 5, 6])) return '1st years';
    if (arrayEqual(ans, [7, 8, 9])) return '3rd years';
    if (ans.length === 11) return 'Saint Aqours Snow';
  } else if (group === 'aqours-miku') {
    if (arrayEqual(ans, [1, 2, 3, 4, 5, 6, 7, 8, 9])) return 'Aqours';
    if (arrayEqual(ans, [1, 2, 5])) return 'CYaRon';
    if (arrayEqual(ans, [3, 6, 9])) return 'Guilty Kiss';
    if (arrayEqual(ans, [4, 7, 8])) return 'AZALEA';
    if (arrayEqual(ans, [1, 2, 3])) return '2nd years';
    if (arrayEqual(ans, [4, 5, 6])) return '1st years';
    if (arrayEqual(ans, [7, 8, 9])) return '3rd years';
    if (ans.length === 10) return 'Aqours & Miku';
  } else if (group === 'wug') {
    if (ans.length === 7) return 'Wake Up, Girls!';
  }
  return ans.map((a) => MEMBER_MAPPING[group][a]).join(', ');
}

export function getGroupColor(group: GroupName): string | null {
  if (group === 'muse') return 'muse-pink';
  if (group === 'aqours') return 'aqours-blue';
  if (group === 'saint-aqours-snow') return 'aqours-lightblue';
  if (group === 'aqours-miku') return 'aqours-blue';
  return null;
}

export function getNumSingersInGroup(group: GroupName): number {
  return Object.keys(MEMBER_MAPPING[group]).length;
}
