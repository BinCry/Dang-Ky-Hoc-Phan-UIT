import uniqBy from 'lodash/uniqBy';
import { Buoi, ClassModel } from 'types';
import { TTrungTkb } from './views/2XepLop/TrungTkbDialog';
import { isProd } from './constants';

export function uniqMaLop(classes: ClassModel[]): ClassModel[] {
  return uniqBy(classes, 'MaLop'); // Có nhiều lớp học nhiều buổi 1 tuần, xuất hiện nhiều lần, nhưng chỉ nên cộng 1 lần
}

export function calcTongSoTC(classes: ClassModel[]) {
  const { kept } = findOverlapedClasses(classes);
  const unique = uniqMaLop(kept);
  return unique.reduce((acc, cur) => acc + cur.SoTc, 0);
}

export function getTongSoTcJudgement(tongSoTC: number) {
  const text =
    tongSoTC < 14
      ? 'Chưa đạt số TC quy định: 14'
      : tongSoTC > 24
      ? 'Vượt quá số TC quy định: 24'
      : 'Thỏa mãn số TC quy định 14-24';
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

  // If separated by commas, spaces, or semicolons
  if (/[,;\s]/.test(str)) {
    return str
      .split(/[,;\s]+/)
      .map((s) => (s === '0' ? '10' : s.trim()))
      .filter(Boolean);
  }

  // Handle hyphen ranges: "1-2", "1-5", "6-10", "11-13"
  const rangeMatch = str.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
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

  // Multi-period evening classes with 2-digit periods (at least 2 periods, length >= 4): "111213", "1112", "1213", "141516", etc.
  if (/^(?:1[1-6]){2,}$/.test(str)) {
    return str.match(/1[1-6]/g) || [str];
  }

  // Single evening period "11"
  if (str === '11') {
    return ['11'];
  }

  // Afternoon classes ending with "10": "678910", "78910", "8910", "910", "10", etc.
  if (str.endsWith('10')) {
    const prefix = str.slice(0, -2);
    return [...prefix.split(''), '10'];
  }

  // Legacy format with '0' as period 10: "67890", "7890"
  if (str.includes('0')) {
    return str.split('').map((ch) => (ch === '0' ? '10' : ch));
  }

  // Standard single-digit sequence: "12", "45", "123", "1234", "12345", "67", "678", "6789", etc.
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
 * "*": Không lên trường
 * 2-1, 2-2, 2-3: Thứ 2, tiết 1,2,3
 * 7-11, 7-12, 7-13: Thứ 7, tiết 11,12,13
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

// Thường thì MaLop alone is enough because most of the classes only appear once a week or once every 2 weeks, nhưng mà có thể có môn Anh Văn học 1 tuần tới 2 buổi, nên cần có thêm Thu và Tiet
// TODO: maybe use STT?
export const getAgGridRowId = (classModel: ClassModel): string => {
  return classModel.MaLop + classModel.Thu + classModel.Tiet;
};

export const isSameAgGridRowId = (class1: ClassModel, class2: ClassModel) => {
  return getAgGridRowId(class1) === getAgGridRowId(class2);
};

export const findOverlapedClasses = (
  /** the first elements in the array will have higher priority, it's OK to have duplicated classes */
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
    // TODO: refactor the mess below
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
