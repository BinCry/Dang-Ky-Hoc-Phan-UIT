import XLSX from 'xlsx';
import {
  findHeaderRowAndColMap,
  normalizeHeaderText,
  parseWorkbookToTkb,
  sanitizeThu,
  sanitizeTiet,
  convertExcelDateToStringDate,
} from './utils';

describe('1ChonFileExcel utils', () => {
  describe('normalizeHeaderText', () => {
    it('normalizes Vietnamese diacritics and special characters', () => {
      expect(normalizeHeaderText('MÃ MH')).toBe('ma mh');
      expect(normalizeHeaderText('MÃ LỚP')).toBe('ma lop');
      expect(normalizeHeaderText('TÊN MÔN HỌC')).toBe('ten mon hoc');
      expect(normalizeHeaderText('MÃ GIẢNG VIÊN')).toBe('ma giang vien');
      expect(normalizeHeaderText('TÊN GIẢNG VIÊN')).toBe('ten giang vien');
      expect(normalizeHeaderText('SĨ SỐ')).toBe('si so');
      expect(normalizeHeaderText('SỐ TC')).toBe('so tc');
      expect(normalizeHeaderText('THỰC HÀNH')).toBe('thuc hanh');
      expect(normalizeHeaderText('HTGD')).toBe('htgd');
      expect(normalizeHeaderText('THỨ')).toBe('thu');
      expect(normalizeHeaderText('TIẾT')).toBe('tiet');
      expect(normalizeHeaderText('CÁCH TUẦN')).toBe('cach tuan');
      expect(normalizeHeaderText('PHÒNG HỌC')).toBe('phong hoc');
      expect(normalizeHeaderText('Khóa học')).toBe('khoa hoc');
    });
  });

  describe('sanitizeThu and sanitizeTiet', () => {
    it('sanitizes valid days and periods', () => {
      expect(sanitizeThu('2')).toBe('2');
      expect(sanitizeThu('6')).toBe('6');
      expect(sanitizeThu('CN')).toBe('8');
      expect(sanitizeThu('')).toBe('*');
      expect(sanitizeThu(undefined)).toBe('*');
      expect(sanitizeThu('-')).toBe('*');

      expect(sanitizeTiet('678')).toBe('678');
      expect(sanitizeTiet('1234')).toBe('1234');
      expect(sanitizeTiet('')).toBe('*');
      expect(sanitizeTiet(undefined)).toBe('*');
    });
  });

  describe('convertExcelDateToStringDate', () => {
    it('formats string or date object correctly', () => {
      expect(convertExcelDateToStringDate('2026-08-15')).toBe('2026-08-15');
      expect(convertExcelDateToStringDate('')).toBe('');
      expect(convertExcelDateToStringDate(null)).toBe('');
    });
  });

  describe('findHeaderRowAndColMap', () => {
    it('detects header row with hidden column E from the new UIT Excel format', () => {
      const sheetData: any[][] = [
        ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN'],
        ['THỜI KHÓA BIỂU DỰ KIẾN HỌC KỲ 1 NĂM HỌC 2026-2027'],
        [],
        [],
        [],
        [],
        [],
        // Row 8 (index 7) with new format headers (Col E hidden/gap)
        [
          'STT', // Col A (0)
          'MÃ MH', // Col B (1)
          'MÃ LỚP', // Col C (2)
          'TÊN MÔN HỌC', // Col D (3)
          '', // Col E (4) - hidden / gap
          'MÃ GIẢNG VIÊN', // Col F (5)
          'TÊN GIẢNG VIÊN', // Col G (6)
          'SĨ SỐ', // Col H (7)
          'SỐ TC', // Col I (8)
          'THỰC HÀNH', // Col J (9)
          'HTGD', // Col K (10)
          'THỨ', // Col L (11)
          'TIẾT', // Col M (12)
          'CÁCH TUẦN', // Col N (13)
          'PHÒNG HỌC', // Col O (14)
          'Khóa học', // Col P (15)
        ],
        // Data row
        [
          2,
          'AI002',
          'AI002.R11',
          'Tư duy Trí tuệ nhân tạo',
          '',
          '80273',
          'Ngô Đức Thành',
          50,
          3,
          1,
          'LT',
          '2',
          '678',
          '1',
          'C316',
          'K19',
        ],
      ];

      const result = findHeaderRowAndColMap(sheetData);
      expect(result).not.toBeNull();
      expect(result?.headerRowIndex).toBe(7);
      expect(result?.colMap.STT).toBe(0);
      expect(result?.colMap.MaMH).toBe(1);
      expect(result?.colMap.MaLop).toBe(2);
      expect(result?.colMap.TenMH).toBe(3);
      expect(result?.colMap.MaGV).toBe(5);
      expect(result?.colMap.TenGV).toBe(6);
      expect(result?.colMap.SiSo).toBe(7);
      expect(result?.colMap.SoTc).toBe(8);
      expect(result?.colMap.ThucHanh).toBe(9);
      expect(result?.colMap.HTGD).toBe(10);
      expect(result?.colMap.Thu).toBe(11);
      expect(result?.colMap.Tiet).toBe(12);
      expect(result?.colMap.CachTuan).toBe(13);
      expect(result?.colMap.PhongHoc).toBe(14);
      expect(result?.colMap.KhoaHoc).toBe(15);
    });
  });

  describe('parseWorkbookToTkb', () => {
    it('correctly parses workbook with new UIT format matching the user screenshot', () => {
      const dataLT = [
        ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN'],
        [],
        [],
        [],
        [],
        [],
        [],
        [
          'STT',
          'MÃ MH',
          'MÃ LỚP',
          'TÊN MÔN HỌC',
          '',
          'MÃ GIẢNG VIÊN',
          'TÊN GIẢNG VIÊN',
          'SĨ SỐ',
          'SỐ TC',
          'THỰC HÀNH',
          'HTGD',
          'THỨ',
          'TIẾT',
          'CÁCH TUẦN',
          'PHÒNG HỌC',
          'Khóa học',
        ],
        [
          2,
          'AI002',
          'AI002.R11',
          'Tư duy Trí tuệ nhân tạo',
          '',
          '80273',
          'Ngô Đức Thành',
          50,
          3,
          1,
          'LT',
          2,
          678,
          1,
          'C316',
          '2024',
        ],
        [
          3,
          'BUS1125',
          'BUS1125.R11',
          'Khởi nghiệp kinh doanh',
          '',
          '11264',
          'Phạm Trung Tuấn',
          100,
          2,
          1,
          'LT',
          2,
          123,
          1,
          'B6.06',
          '2024',
        ],
        [
          8,
          'CE118',
          'CE118.R11',
          'Thiết kế luận lý số',
          '',
          '80349',
          'Trương Văn Cương',
          60,
          3,
          1,
          'LT',
          4,
          6789,
          1,
          'B1.04',
          '2024',
        ],
      ];

      const dataTH = [
        ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN - THỰC HÀNH'],
        [],
        [],
        [],
        [],
        [],
        [],
        [
          'STT',
          'MÃ MH',
          'MÃ LỚP',
          'TÊN MÔN HỌC',
          '',
          'MÃ GIẢNG VIÊN',
          'TÊN TRỢ GIẢNG',
          'SĨ SỐ',
          'SỐ TC',
          'THỰC HÀNH',
          'HTGD',
          'THỨ',
          'TIẾT',
          'CÁCH TUẦN',
          'PHÒNG HỌC',
          'Khóa học',
        ],
        [
          1,
          'CE118',
          'CE118.R11.1',
          'Thiết kế luận lý số',
          '',
          '80349',
          'Trương Văn Cương',
          30,
          0,
          1,
          'HT1',
          5,
          1234,
          2,
          'C205',
          '2024',
        ],
      ];

      const wsLT = XLSX.utils.aoa_to_sheet(dataLT);
      const wsTH = XLSX.utils.aoa_to_sheet(dataTH);
      const wb: XLSX.WorkBook = {
        SheetNames: ['TKB LT', 'TKB TH,DA,KLTN,TTTN'],
        Sheets: {
          'TKB LT': wsLT,
          'TKB TH,DA,KLTN,TTTN': wsTH,
        },
      };

      const classes = parseWorkbookToTkb(wb);

      expect(classes.length).toBe(4);

      // Check Class 1
      expect(classes[0].STT).toBe(2);
      expect(classes[0].MaMH).toBe('AI002');
      expect(classes[0].MaLop).toBe('AI002.R11');
      expect(classes[0].TenMH).toBe('Tư duy Trí tuệ nhân tạo');
      expect(classes[0].MaGV).toBe('80273');
      expect(classes[0].TenGV).toBe('Ngô Đức Thành');
      expect(classes[0].SiSo).toBe('50');
      expect(classes[0].SoTc).toBe(3);
      expect(classes[0].ThucHanh).toBe(1);
      expect(classes[0].HTGD).toBe('LT');
      expect(classes[0].Thu).toBe('2');
      expect(classes[0].Tiet).toBe('678');
      expect(classes[0].CachTuan).toBe('1');
      expect(classes[0].PhongHoc).toBe('C316');

      // Check Class 3 (CE118.R11)
      expect(classes[2].MaLop).toBe('CE118.R11');
      expect(classes[2].Thu).toBe('4');
      expect(classes[2].Tiet).toBe('6789');
      expect(classes[2].SoTc).toBe(3);

      // Check Lab class from Sheet 2
      expect(classes[3].MaLop).toBe('CE118.R11.1');
      expect(classes[3].HTGD).toBe('HT1');
      expect(classes[3].Thu).toBe('5');
      expect(classes[3].Tiet).toBe('1234');
      expect(classes[3].PhongHoc).toBe('C205');
    });

    it('inherits TenGV, MaGV, SoTc, and TenMH from previous row if MaLop base is same', () => {
      const dataLT = [
        ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN'],
        [], [], [], [], [], [],
        [
          'STT', 'MÃ MH', 'MÃ LỚP', 'TÊN MÔN HỌC', '', 'MÃ GIẢNG VIÊN', 'TÊN TRỢ GIẢNG', 'SĨ SỐ', 'SỐ TC', 'THỰC HÀNH', 'HTGD', 'THỨ', 'TIẾT', 'CÁCH TUẦN', 'PHÒNG HỌC', 'Khóa học',
        ],
        [
          2, 'CE119', 'CE119.R11.1', 'Thực hành kiến trúc máy tính', '', '80349', 'Trần Văn Quang', 30, 0, 1, 'HT1', 5, 1234, 2, 'C205', '2024',
        ],
        [
          3, 'CE119', 'CE119.R11.2', '', '', '', '', 30, 0, 1, 'HT1', 5, 6789, 2, 'C206', '2024',
        ],
      ];

      const wsLT = XLSX.utils.aoa_to_sheet(dataLT);
      const wb: XLSX.WorkBook = {
        SheetNames: ['TKB TH,DA,KLTN,TTTN'],
        Sheets: {
          'TKB TH,DA,KLTN,TTTN': wsLT,
        },
      };

      const classes = parseWorkbookToTkb(wb);

      expect(classes.length).toBe(2);

      // Check Class 1
      expect(classes[0].MaLop).toBe('CE119.R11.1');
      expect(classes[0].TenMH).toBe('Thực hành kiến trúc máy tính');
      expect(classes[0].MaGV).toBe('80349');
      expect(classes[0].TenGV).toBe('Trần Văn Quang');

      // Check Class 2 (Inherits)
      expect(classes[1].MaLop).toBe('CE119.R11.2');
      expect(classes[1].TenMH).toBe('Thực hành kiến trúc máy tính');
      expect(classes[1].MaGV).toBe('80349');
      expect(classes[1].TenGV).toBe('Trần Văn Quang');
    });

    it('handles legacy fixed-format files properly', () => {
      const legacyData = [
        [
          'STT',
          'Mã MH',
          'Mã lớp',
          'Tên môn học',
          'Mã GV',
          'Tên GV',
          'Sĩ số',
          'Số TC',
          'Thực hành',
          'HTGD',
          'Thứ',
          'Tiết',
          'Cách tuần',
          'Phòng học',
          'Khóa học',
          'Học kỳ',
          'Năm học',
          'Hệ ĐT',
          'Khoa QL',
          'NBD',
          'NKT',
          'Ghi chú',
          'Ngôn ngữ',
        ],
        [
          1,
          'IT001',
          'IT001.N11',
          'Nhập môn lập trình',
          '12345',
          'Nguyễn Văn A',
          80,
          4,
          1,
          'LT',
          3,
          123,
          1,
          'A101',
          '2023',
          '1',
          '2023-2024',
          'CQUI',
          'KHTN',
          '2023-09-01',
          '2023-12-31',
          '',
          'VN',
        ],
      ];

      const ws = XLSX.utils.aoa_to_sheet(legacyData);
      const wb: XLSX.WorkBook = {
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: ws },
      };

      const result = parseWorkbookToTkb(wb);
      expect(result.length).toBe(1);
      expect(result[0].MaMH).toBe('IT001');
      expect(result[0].MaLop).toBe('IT001.N11');
      expect(result[0].TenMH).toBe('Nhập môn lập trình');
      expect(result[0].TenGV).toBe('Nguyễn Văn A');
      expect(result[0].Thu).toBe('3');
      expect(result[0].Tiet).toBe('123');
      expect(result[0].SoTc).toBe(4);
    });
  });
});
