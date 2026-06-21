import { MEMBER_COLUMNS, SHORTCUT_GROUPS, ShortcutGroup } from './bubudle-config';

// The Bubudle member-grid layout decision, lifted out of the DOM builder as
// pure data: given the group and the singers in play, which member ids land in
// which of the three columns, which are "extras" beyond the group's base
// roster, and how the subunit/year shortcut groups split left vs right. The
// button-building, Bootstrap pulls, and click wiring stay in createBubudleSlot;
// this owns the placement logic so "are extras/shortcuts placed correctly?"
// becomes a unit-test question instead of a render-and-eyeball one.

export interface BubudleGridLayout {
  /** Three columns of individual member ids. */
  memberCols: number[][];
  /** Member ids beyond the group's base roster (e.g. guests). */
  extras: number[];
  /** Shortcut groups for the left column (before extras are attached). */
  leftShortcuts: ShortcutGroup[];
  /** Shortcut groups for the right column. */
  rightShortcuts: ShortcutGroup[];
  /** Whether real subunit shortcuts exist — drives extras placement + grid widths. */
  hasSubunits: boolean;
}

/** `baseIds` is the group's base roster (from MEMBER_MAPPING at the call site).
 *  It is injected rather than read here so the layout is a pure function of its
 *  arguments — MEMBER_MAPPING is populated asynchronously at runtime, so reading
 *  it directly would make this untestable and empty outside the live app. */
export function bubudleGridLayout(group: string, singers: number[], baseIds: number[]): BubudleGridLayout {
  const singerSet = new Set(singers);
  const baseIdSet = new Set(baseIds);
  const extras = singers.filter((s) => !baseIdSet.has(s));

  const predefined = MEMBER_COLUMNS[group];
  const memberCols: number[][] = predefined
    ? predefined.map((col) => col.filter((id) => singers.includes(id)))
    : (() => {
        const base = singers.filter((s) => baseIdSet.has(s));
        const n = Math.ceil(base.length / 3);
        return [base.slice(0, n), base.slice(n, n * 2), base.slice(n * 2)];
      })();

  // Applicable shortcuts — only those whose members are all present (and, for
  // extra-only shortcuts, only when there actually are extras).
  const hasExtras = extras.length > 0;
  const shortcuts = (SHORTCUT_GROUPS[group] ?? []).filter(
    (g) => g.members.every((m) => singerSet.has(m)) && (!g.extraOnly || hasExtras),
  );
  const subunitShortcuts = shortcuts.filter((g) => g.subunit);
  const hasSubunits = subunitShortcuts.length > 0;

  // With subunits, split by the subunit flag. Without, fall back to splitting
  // by member id (extras/guests > 9 on the left, base members on the right).
  const leftShortcuts = hasSubunits ? subunitShortcuts : shortcuts.filter((g) => g.members.some((m) => m > 9));
  const rightShortcuts = hasSubunits
    ? shortcuts.filter((g) => !g.subunit)
    : shortcuts.filter((g) => g.members.every((m) => m <= 9));

  return { memberCols, extras, leftShortcuts, rightShortcuts, hasSubunits };
}
