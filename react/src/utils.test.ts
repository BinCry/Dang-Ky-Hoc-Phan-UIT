import { Buoi, ClassModel } from './types';
import {
  calcTongSoTC,
  extractListMaLop,
  findOverlapedClasses,
  getBuoiFromTiet,
  getDanhSachTiet,
  hasOverlapSchedule,
  uniqMaLop,
} from './utils';

const createMockClass = (overrides: Partial<ClassModel>): ClassModel => ({
  STT: 1,
  MaMH: 'IE212',
  MaLop: 'IE212.R12',
  TenMH: 'Hệ dữ liệu lớn',
  TenGV: 'Hà Minh Tân',
  MaGV: '123',
  SiSo: '60',
  PhongHoc: 'C214',
  SoTc: 3,
  ThucHanh: 0,
  HTGD: 'LT',
  Thu: '5',
  Tiet: '1234',
  CachTuan: '1',
  KhoaHoc: '2024',
  HocKy: '1',
  NamHoc: '2024-2025',
  HeDT: 'CQUI',
  KhoaQL: 'HTTT',
  NBD: '',
  NKT: '',
  GhiChu: '',
  NgonNgu: 'VN',
  ...overrides,
});

describe('utils - getDanhSachTiet', () => {
  it('correctly splits standard morning periods', () => {
    expect(getDanhSachTiet('12')).toEqual(['1', '2']);
    expect(getDanhSachTiet('23')).toEqual(['2', '3']);
    expect(getDanhSachTiet('34')).toEqual(['3', '4']);
    expect(getDanhSachTiet('45')).toEqual(['4', '5']);
    expect(getDanhSachTiet('123')).toEqual(['1', '2', '3']);
    expect(getDanhSachTiet('1234')).toEqual(['1', '2', '3', '4']);
    expect(getDanhSachTiet('12345')).toEqual(['1', '2', '3', '4', '5']);
  });

  it('correctly splits afternoon periods containing period 10', () => {
    expect(getDanhSachTiet('678910')).toEqual(['6', '7', '8', '9', '10']);
    expect(getDanhSachTiet('78910')).toEqual(['7', '8', '9', '10']);
    expect(getDanhSachTiet('8910')).toEqual(['8', '9', '10']);
    expect(getDanhSachTiet('910')).toEqual(['9', '10']);
    expect(getDanhSachTiet('10')).toEqual(['10']);
  });

  it('correctly splits legacy afternoon periods with 0 for 10', () => {
    expect(getDanhSachTiet('67890')).toEqual(['6', '7', '8', '9', '10']);
    expect(getDanhSachTiet('7890')).toEqual(['7', '8', '9', '10']);
    expect(getDanhSachTiet('890')).toEqual(['8', '9', '10']);
    expect(getDanhSachTiet('90')).toEqual(['9', '10']);
    expect(getDanhSachTiet('0')).toEqual(['10']);
  });

  it('correctly splits standard afternoon periods without 10', () => {
    expect(getDanhSachTiet('67')).toEqual(['6', '7']);
    expect(getDanhSachTiet('78')).toEqual(['7', '8']);
    expect(getDanhSachTiet('89')).toEqual(['8', '9']);
    expect(getDanhSachTiet('678')).toEqual(['6', '7', '8']);
    expect(getDanhSachTiet('6789')).toEqual(['6', '7', '8', '9']);
  });

  it('correctly splits evening periods (2-digit periods)', () => {
    expect(getDanhSachTiet('111213')).toEqual(['11', '12', '13']);
    expect(getDanhSachTiet('1112')).toEqual(['11', '12']);
    expect(getDanhSachTiet('1213')).toEqual(['12', '13']);
    expect(getDanhSachTiet('11')).toEqual(['11']);
  });

  it('correctly handles hyphen range periods', () => {
    expect(getDanhSachTiet('1-2')).toEqual(['1', '2']);
    expect(getDanhSachTiet('1-5')).toEqual(['1', '2', '3', '4', '5']);
    expect(getDanhSachTiet('6-10')).toEqual(['6', '7', '8', '9', '10']);
    expect(getDanhSachTiet('11-13')).toEqual(['11', '12', '13']);
  });

  it('correctly handles comma, space, and semicolon separated periods', () => {
    expect(getDanhSachTiet('1,2,3,4,5')).toEqual(['1', '2', '3', '4', '5']);
    expect(getDanhSachTiet('1, 2')).toEqual(['1', '2']);
    expect(getDanhSachTiet('6,7,8,9,10')).toEqual(['6', '7', '8', '9', '10']);
    expect(getDanhSachTiet('11, 12, 13')).toEqual(['11', '12', '13']);
    expect(getDanhSachTiet('6; 7; 8')).toEqual(['6', '7', '8']);
  });

  it('handles special values like * and empty string', () => {
    expect(getDanhSachTiet('*')).toEqual(['*']);
    expect(getDanhSachTiet('')).toEqual([]);
  });
});

describe('utils - getBuoiFromTiet', () => {
  it('correctly classifies Sang for morning periods', () => {
    expect(getBuoiFromTiet('12')).toBe(Buoi.Sang);
    expect(getBuoiFromTiet('45')).toBe(Buoi.Sang);
    expect(getBuoiFromTiet('1234')).toBe(Buoi.Sang);
    expect(getBuoiFromTiet('12345')).toBe(Buoi.Sang);
    expect(getBuoiFromTiet('123')).toBe(Buoi.Sang);
  });

  it('correctly classifies Chieu for afternoon periods (including 678910)', () => {
    expect(getBuoiFromTiet('67')).toBe(Buoi.Chieu);
    expect(getBuoiFromTiet('678910')).toBe(Buoi.Chieu);
    expect(getBuoiFromTiet('6789')).toBe(Buoi.Chieu);
    expect(getBuoiFromTiet('67890')).toBe(Buoi.Chieu);
    expect(getBuoiFromTiet('78910')).toBe(Buoi.Chieu);
  });

  it('correctly classifies Toi for evening periods', () => {
    expect(getBuoiFromTiet('111213')).toBe(Buoi.Toi);
    expect(getBuoiFromTiet('11,12,13')).toBe(Buoi.Toi);
  });

  it('handles N_A for * and empty', () => {
    expect(getBuoiFromTiet('*')).toBe(Buoi.N_A);
    expect(getBuoiFromTiet('')).toBe(Buoi.N_A);
  });
});

describe('utils - hasOverlapSchedule', () => {
  it('does NOT conflict lecture class IE212.R12 (1234) with its lab class IE212.R12.1 (678910) on same day', () => {
    const classLT = createMockClass({
      MaLop: 'IE212.R12',
      Thu: '5',
      Tiet: '1234',
    });
    const classTH1 = createMockClass({
      MaLop: 'IE212.R12.1',
      Thu: '5',
      Tiet: '678910',
    });
    const classTH2 = createMockClass({
      MaLop: 'IE212.R12.2',
      Thu: '5',
      Tiet: '678910',
    });

    expect(hasOverlapSchedule([classLT], classTH1)).toBe(false);
    expect(hasOverlapSchedule([classLT], classTH2)).toBe(false);
  });

  it('conflicts lecture class IE212.R12 (Thu 5, 1234) with IE212.R11.1 (Thu 5, 12345)', () => {
    const classLT = createMockClass({
      MaLop: 'IE212.R12',
      Thu: '5',
      Tiet: '1234',
    });
    const classTH_R11_1 = createMockClass({
      MaLop: 'IE212.R11.1',
      Thu: '5',
      Tiet: '12345',
    });

    expect(hasOverlapSchedule([classLT], classTH_R11_1)).toBe(true);
  });

  it('does not conflict same row id with itself', () => {
    const classLT = createMockClass({
      MaLop: 'IE212.R12',
      Thu: '5',
      Tiet: '1234',
    });

    expect(hasOverlapSchedule([classLT], classLT)).toBe(false);
  });
});
