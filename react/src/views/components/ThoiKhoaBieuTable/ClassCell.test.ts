import { ClassModel } from '../../../types';
import { getMonChonRoiKey, isThucHanhClass } from './ClassCell';

describe('ClassCell - isThucHanhClass and getMonChonRoiKey', () => {
  const createMockClass = (overrides: Partial<ClassModel>): ClassModel => ({
    STT: 1,
    MaMH: 'SE347',
    MaLop: 'SE347.R11',
    TenMH: 'Công nghệ web và ứng dụng',
    TenGV: 'Trần Thị Hồng Yến',
    MaGV: '123',
    SiSo: '60',
    PhongHoc: 'C214',
    SoTc: 4,
    ThucHanh: 1,
    HTGD: 'LT',
    Thu: '2',
    Tiet: '123',
    CachTuan: '1',
    KhoaHoc: '2024',
    HocKy: '1',
    NamHoc: '2024-2025',
    HeDT: 'CQUI',
    KhoaQL: 'CNPM',
    NBD: '',
    NKT: '',
    GhiChu: '',
    NgonNgu: 'VN',
    ...overrides,
  });

  it('correctly identifies LT vs HT2/TH classes', () => {
    const classLT = createMockClass({ MaLop: 'SE347.R11', HTGD: 'LT' });
    const classHT2 = createMockClass({ MaLop: 'SE347.R11.1', HTGD: 'HT2', Thu: '*', Tiet: '*' });

    expect(isThucHanhClass(classLT)).toBe(false);
    expect(isThucHanhClass(classHT2)).toBe(true);

    expect(getMonChonRoiKey(classLT)).toBe('SE347-LT');
    expect(getMonChonRoiKey(classHT2)).toBe('SE347-TH');

    // Both should have DIFFERENT keys, meaning selecting both is NOT duplicate
    expect(getMonChonRoiKey(classLT)).not.toBe(getMonChonRoiKey(classHT2));
  });

  it('detects duplicate LT classes for same subject', () => {
    const classLT1 = createMockClass({ MaLop: 'SE347.R11', HTGD: 'LT' });
    const classLT2 = createMockClass({ MaLop: 'SE347.R12', HTGD: 'LT' });

    expect(getMonChonRoiKey(classLT1)).toBe(getMonChonRoiKey(classLT2));
  });
});
