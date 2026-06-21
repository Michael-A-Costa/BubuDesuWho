import { describe, expect, it } from 'vitest';
import { bubudleGridLayout } from './bubudle-grid';

const labels = (gs: { label: string }[]): string[] => gs.map((g) => g.label);
const AQOURS_BASE = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // the group's base roster

describe('bubudleGridLayout — aqours, full roster', () => {
  const layout = bubudleGridLayout('aqours', [1, 2, 3, 4, 5, 6, 7, 8, 9], AQOURS_BASE);

  it('keeps the hand-authored three columns by school year', () => {
    expect(layout.memberCols).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  });

  it('has no extras when only base members are in play', () => {
    expect(layout.extras).toEqual([]);
  });

  it('routes subunits left and year-groups right', () => {
    expect(layout.hasSubunits).toBe(true);
    expect(labels(layout.leftShortcuts)).toEqual(['CYaRon', 'Guilty Kiss', 'AZALEA']);
    expect(labels(layout.rightShortcuts)).toEqual(['1st years', '2nd years', '3rd years']);
  });

  it('excludes extra-only shortcuts (Aqours) when there are no extras', () => {
    expect(labels(layout.rightShortcuts)).not.toContain('Aqours');
  });
});

describe('bubudleGridLayout — partial roster', () => {
  it('filters columns to the singers present and drops shortcuts missing a member', () => {
    const layout = bubudleGridLayout('aqours', [1, 2, 5], AQOURS_BASE); // CYaRon only
    expect(layout.memberCols).toEqual([[1, 2], [5], []]);
    expect(labels(layout.leftShortcuts)).toEqual(['CYaRon']);
    expect(layout.rightShortcuts).toEqual([]);
  });
});

describe('bubudleGridLayout — extras (guest singers beyond the base roster)', () => {
  const layout = bubudleGridLayout('aqours', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], AQOURS_BASE);

  it('reports ids beyond the base roster as extras', () => {
    expect(layout.extras).toEqual([10, 11]);
  });

  it('admits the Saint Snow subunit and the extra-only Aqours shortcut once extras exist', () => {
    expect(labels(layout.leftShortcuts)).toContain('Saint Snow');
    expect(labels(layout.rightShortcuts)).toContain('Aqours');
  });
});
