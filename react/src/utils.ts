import uniqBy from 'lodash/uniqBy';
import { Buoi, ClassModel } from 'types';
import { TTrungTkb } from './views/2XepLop/TrungTkbDialog';
import { isProd } from './constants';

export function uniqMaLop(classes: ClassModel[]): ClassModel[] {
  return uniqBy(classes, 'MaLop');
}

const getCreditGroupKey = (classModel: ClassModel) => {
  const maMH = String(classModel.MaMH ?? '').trim();
  const maLop = String(classModel.MaLop ?? '').trim();
  const subjectKey = maMH || (maLop ? (maLop.includes('.') ? maLop.split('.')[0] : maLop) : '');
  if (!subjectKey) return '';

  const htgd = String(classModel.HTGD ?? '').trim().toUpperCase();
  const isThucHanh =
    htgd.includes('HT1') || htgd.includes('HT2') || htgd.includes('TH')
      ? true
      : htgd === 'LT'
      ? false
      : /\.\d+$/.test(maLop) && (maLop.match(/\./g) || []).length >= 2;

  return `${subjectKey}-${isThucHanh ? 'TH' : htgd || 'LT'}`;
};

export function calcTongSoTC(classes: ClassModel[]) {
  const { kept } = findOverlapedClasses(classes);
  const unique = uniqMaLop(kept);

  // Group by subject + delivery type, then take the MAX of SoTc within each bucket.
  // This keeps duplicate LT rows collapsed, while still counting LT and TH separately
  // when the spreadsheet really contains both components.
  const creditsByCourse = new Map<string, number>();
  unique.forEach((c) => {
    const creditGroupKey = getCreditGroupKey(c);
    if (!creditGroupKey) return;

    const currentMax = creditsByCourse.get(creditGroupKey) || 0;
    if (c.SoTc > currentMax) {
      creditsByCourse.set(creditGroupKey, c.SoTc);
    }
  });

  let total = 0;
  creditsByCourse.forEach((soTc) => {
    total += soTc;
  });

  return total;
}

export function getTongSoTcJudgement(tongSoTC: number) {
  const text =
    tongSoTC < 14
      ? '\u0043h\u01b0a \u0111\u1ea1t s\u1ed1 TC quy \u0111\u1ecbnh: 14'
      : tongSoTC > 24
      ? '\u0056\u01b0\u1ee3t qu\u00e1 s\u1ed1 TC quy \u0111\u1ecbnh: 24'
      : '\u0054h\u1ecf\u0061 m\u00e3n s\u1ed1 TC quy \u0111\u1ecbnh 14-24';
  const isOk = tongSoTC >= 14 && tongSoTC <= 24;
  return {
    isOk,
    text,
  };
}

export function extractListMaLop(classes: ClassModel[]) {
  const unique = uniqMaLop(classes);
  return unique.map((it) => it.MaLop);
}

export const getDanhSachTiet = (tiet: ClassModel['Tiet']): string[] => {
  if (tiet === null || tiet === undefined || tiet === '') return [];
  const str = String(tiet).trim();
  if (str === '*') return ['*'];

  if (/[,;\s]/.test(str)) {
    return str
      .split(/[,;\s]+/)
      .map((s) => (s === '0' ? '10' : s.trim()))
      .filter(Boolean);
  }

  const rangeMatch = str.match(/^(\d+)\s*[-\u2013\u2014]\s*(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (start > 0 && end >= start && end <= 16) {
      const result: string[] = [];
      for (let i = start; i <= end; i++) {
        result.push(String(i));
      }
      return result;
    }
  }

  if (/^(?:1[1-6]){2,}$/.test(str)) {
    return str.match(/1[1-6]/g) || [str];
  }

  if (str === '11') {
    return ['11'];
  }

  if (str.endsWith('10')) {
    const prefix = str.slice(0, -2);
    return [...prefix.split(''), '10'];
  }

  if (str.includes('0')) {
    return str.split('').map((ch) => (ch === '0' ? '10' : ch));
  }

  return str.split('');
};

export const getBuoiFromTiet = (tiet: ClassModel['Tiet']): Buoi => {
  const listTiet = getDanhSachTiet(tiet);
  if (!listTiet.length || listTiet.includes('*')) return Buoi.N_A;

  if (listTiet.some((t) => ['11', '12', '13', '14', '15', '16'].includes(t))) {
    return Buoi.Toi;
  }
  if (listTiet.some((t) => ['1', '2', '3', '4', '5'].includes(t))) {
    return Buoi.Sang;
  }
  if (listTiet.some((t) => ['6', '7', '8', '9', '10'].includes(t))) {
    return Buoi.Chieu;
  }
  return Buoi.N_A;
};

/**
 * "*": KhÃ´ng lÃªn trÆ°á»ng
 * 2-1, 2-2, 2-3: Thá»© 2, tiáº¿t 1,2,3
 * 7-11, 7-12, 7-13: Thá»© 7, tiáº¿t 11,12,13
 */
type ValidTimeSlot = `${string}-${string}`;
type TimeSlots = '*' | ValidTimeSlot[];
const getTimeSlots = ({ Thu, Tiet }: ClassModel): TimeSlots => {
  if (Thu === '*') return '*';
  return getDanhSachTiet(Tiet).map((tiet): ValidTimeSlot => `${Thu}-${tiet}`);
};

const isTimeSlotsOverlap = (timeSlotsA: TimeSlots, timeSlotsB: TimeSlots) => {
  if (timeSlotsA === '*' || timeSlotsB === '*') return false;
  return timeSlotsA.some((slotA) => timeSlotsB.includes(slotA));
};

export const hasOverlapSchedule = (classAs: ClassModel[], classB: ClassModel) => {
  const classBTimeSlots = getTimeSlots(classB);
  return classAs.some((classA) => {
    if (isSameAgGridRowId(classA, classB)) return false;
    const classATimeSlots = getTimeSlots(classA);
    return isTimeSlotsOverlap(classATimeSlots, classBTimeSlots);
  });
};

export const getAgGridRowId = (classModel: ClassModel): string => {
  return classModel.MaLop + classModel.Thu + classModel.Tiet;
};

export const isSameAgGridRowId = (class1: ClassModel, class2: ClassModel) => {
  return getAgGridRowId(class1) === getAgGridRowId(class2);
};

export const findOverlapedClasses = (
  classes: ClassModel[],
): { kept: ClassModel[]; redundant: TTrungTkb[] } => {
  const kept: ClassModel[] = [];
  const redundant: TTrungTkb[] = [];

  const findExistingOverlap = (newClass: ClassModel) => {
    const newClassTimeSlots = getTimeSlots(newClass);
    return kept.find((existingClass) => {
      const existingClassTimeSlots = getTimeSlots(existingClass);
      return isTimeSlotsOverlap(existingClassTimeSlots, newClassTimeSlots);
    });
  };

  const processedAgGridRowIds = new Set<string>();
  classes.forEach((addingClass) => {
    const agGridRowId = getAgGridRowId(addingClass);
    if (processedAgGridRowIds.has(agGridRowId)) return;

    processedAgGridRowIds.add(agGridRowId);
    const existingClassOverlapped = findExistingOverlap(addingClass);
    const existingRedundant =
      existingClassOverlapped && redundant.find((it) => isSameAgGridRowId(it.existing, existingClassOverlapped));
    if (existingRedundant) {
      existingRedundant.new.push(addingClass);
    } else if (existingClassOverlapped) {
      redundant.push({
        existing: existingClassOverlapped,
        new: [addingClass],
      });
    } else {
      kept.push(addingClass);
    }
  });

  return { kept, redundant };
};

export const log = (...args: any[]) => {
  (window.__DEBUG__ || !isProd) && console.log(...args);
};
