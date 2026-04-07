export function arrayEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

export function toTimeStr(secs: number, precision = 1, roundAt = 1.0): string {
  let fsecs = Math.floor(secs / precision);
  if (fsecs + roundAt <= secs) fsecs += 1;
  fsecs *= precision;

  const min = Math.floor(fsecs / 60).toString();
  let secsStr = (Math.floor(fsecs) % 60).toString();
  if (secsStr.length === 1) secsStr = '0' + secsStr;

  if (precision < 1) {
    const precisionLen = precision.toString().substring(2).length;
    let subsecsStr = (fsecs - Math.floor(fsecs)).toString();
    if (subsecsStr === '0') {
      subsecsStr = '0.' + '0'.repeat(precisionLen);
    }
    secsStr += subsecsStr.substring(1, 1 + precisionLen + 1);
  }
  return min + ':' + secsStr;
}

export function parseURLParams(querystring: string): Record<string, string> {
  const urlParams: Record<string, string> = {};
  const pl = /\+/g;
  const search = /([^&=]+)=?([^&]*)/g;
  const decode = (s: string) => decodeURIComponent(s.replace(pl, ' '));
  let match: RegExpExecArray | null;
  while ((match = search.exec(querystring)) !== null) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
}
