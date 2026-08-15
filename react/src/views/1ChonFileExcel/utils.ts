import XLSX from 'xlsx';
import { ClassModelOriginal } from 'types';

// Normalize header text for fuzzy matching (remove diacritics, lowercase, remove special characters)
export function normalizeHeaderText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Field matching predicates based on standard UIT TKB Excel headers
export const FIELD_MATCHERS: Record<keyof ClassModelOriginal, (norm: string) => boolean> = {
  STT: (s) => s === 'stt' || s === 'so thu tu' || s === 'no' || s === 'order',
  MaMH: (s) =>
    s === 'ma mh' ||
    s === 'mamh' ||
    s === 'ma mon hoc' ||
    s === 'mamonhoc' ||
    s === 'ma mon' ||
    s === 'ma hoc phan' ||
    s === 'course id' ||
    s === 'subject id' ||
    s === 'subject code',
  MaLop: (s) =>
    s === 'ma lop' ||
    s === 'malop' ||
    s === 'ma lhp' ||
    s === 'malhp' ||
    s === 'ma lop hoc phan' ||
    s === 'malophocphan' ||
    s === 'class id' ||
    s === 'class code',
  TenMH: (s) =>
    s === 'ten mon hoc' ||
    s === 'tenmonhoc' ||
    s === 'ten mon' ||
    s === 'tenmon' ||
    s === 'ten mh' ||
    s === 'tenmh' ||
    s === 'ten hoc phan' ||
    s === 'tenhocphan' ||
    s === 'course name' ||
    s === 'subject name',
  MaGV: (s) =>
    s === 'ma giang vien' ||
    s === 'magiangvien' ||
    s === 'ma gv' ||
    s === 'magv' ||
    s === 'cb giang day' ||
    s === 'ma cb' ||
    s === 'lecturer id' ||
    s === 'instructor id',
  TenGV: (s) =>
    s === 'ten giang vien' ||
    s === 'tengiangvien' ||
    s === 'ten gv' ||
    s === 'tengv' ||
    s === 'giang vien' ||
    s === 'giangvien' ||
    s === 'gv giang day' ||
    s === 'gvgiangday' ||
    s === 'cb giang day' ||
    s === 'lecturer' ||
    s === 'instructor',
  SiSo: (s) =>
    s === 'si so' ||
    s === 'siso' ||
    s === 'si so lop' ||
    s === 'so luong' ||
    s === 'soluong' ||
    s === 'sl' ||
    s === 'capacity',
  SoTc: (s) =>
    s === 'so tc' ||
    s === 'sotc' ||
    s === 'so tin chi' ||
    s === 'sotinchi' ||
    s === 'tin chi' ||
    s === 'tinchi' ||
    s === 'tc' ||
    s === 'credits' ||
    s === 'credit',
  ThucHanh: (s) => s === 'thuc hanh' || s === 'thuchanh' || s === 'th lt' || s === 'th',
  HTGD: (s) =>
    s === 'htgd' ||
    s === 'hinh thuc giang day' ||
    s === 'hinhthucgiangday' ||
    s === 'ht giang day' ||
    s === 'htgiangday' ||
    s === 'hinh thuc' ||
    s === 'hinhthuc' ||
    s === 'loai gio' ||
    s === 'loaigio' ||
    s === 'teaching type' ||
    s === 'type',
  Thu: (s) => s === 'thu' || s === 'ngay hoc' || s === 'ngayhoc' || s === 'thu trong tuan' || s === 'day',
  Tiet: (s) => s === 'tiet' || s === 'tiet hoc' || s === 'tiethoc' || s === 'ca hoc' || s === 'cahoc' || s === 'period',
  CachTuan: (s) => s === 'cach tuan' || s === 'cachtuan' || s === 'tuan hoc' || s === 'tuanhoc' || s === 'frequency',
  PhongHoc: (s) =>
    s === 'phong hoc' ||
    s === 'phonghoc' ||
    s === 'phong' ||
    s === 'phong link' ||
    s === 'phong / link' ||
    s === 'room',
  KhoaHoc: (s) => s === 'khoa hoc' || s === 'khoahoc' || s === 'cohort' || s === 'khoa hoc khoa' || s === 'k',
  HocKy: (s) => s === 'hoc ky' || s === 'hocky' || s === 'hoc ki' || s === 'hocki' || s === 'hk' || s === 'semester',
  NamHoc: (s) => s === 'nam hoc' || s === 'namhoc' || s === 'nam' || s === 'academic year',
  HeDT: (s) => s === 'he dt' || s === 'hedt' || s === 'he dao tao' || s === 'hedaotao' || s === 'he' || s === 'program',
  KhoaQL: (s) =>
    s === 'khoa ql' ||
    s === 'khoaql' ||
    s === 'khoa quan ly' ||
    s === 'khoaquanly' ||
    s === 'don vi quan ly' ||
    s === 'donviquanly' ||
    s === 'faculty' ||
    s === 'department',
  NBD: (s) =>
    s === 'nbd' ||
    s === 'ngay bat dau' ||
    s === 'ngaybatdau' ||
    s === 'ngay bd' ||
    s === 'ngaybd' ||
    s === 'bat dau' ||
    s === 'start date' ||
    s === 'start',
  NKT: (s) =>
    s === 'nkt' ||
    s === 'ngay ket thuc' ||
    s === 'ngayketthuc' ||
    s === 'ngay kt' ||
    s === 'ngaykt' ||
    s === 'ket thuc' ||
    s === 'end date' ||
    s === 'end',
  GhiChu: (s) => s === 'ghi chu' || s === 'ghichu' || s === 'note' || s === 'notes' || s === 'luu y' || s === 'luuy',
  NgonNgu: (s) =>
    s === 'ngon ngu' ||
    s === 'ngonngu' ||
    s === 'ngon ngu giang day' ||
    s === 'ngonngugiangday' ||
    s === 'language' ||
    s === 'lang',
};

// Convert excel based date (1989-Dec-30) or Date object to YYYY-MM-DD string
export function convertExcelDateToStringDate(excelDate: any): string {
  if (excelDate === null || excelDate === undefined || excelDate === '') return '';
  if (typeof excelDate === 'string') return excelDate.trim();
  if (excelDate instanceof Date) {
    return (
      excelDate.getFullYear() +
      '-' +
      (excelDate.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      excelDate.getDate().toString().padStart(2, '0')
    );
  }
  if (typeof excelDate === 'number') {
    // In Excel, base date is 1899-Dec-31
    // @ts-ignore
    const offsetOfBases = new Date(0) - new Date(1899, 11, 31);
    const jsDate = new Date(excelDate * 24 * 60 * 60 * 1000 - offsetOfBases);
    if (isNaN(jsDate.getTime())) return String(excelDate);
    return (
      jsDate.getFullYear() +
      '-' +
      (jsDate.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      jsDate.getDate().toString().padStart(2, '0')
    );
  }
  return String(excelDate);
}

// Locate header row in a 2D sheet array and map column fields dynamically
export function findHeaderRowAndColMap(
  rows: any[][],
): { headerRowIndex: number; colMap: Record<keyof ClassModelOriginal, number> } | null {
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const currentMap: Partial<Record<keyof ClassModelOriginal, number>> = {};
    let matchCount = 0;

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell === null || cell === undefined || cell === '') continue;
      const norm = normalizeHeaderText(cell);
      if (!norm) continue;

      for (const [field, matcher] of Object.entries(FIELD_MATCHERS) as [
        keyof ClassModelOriginal,
        (s: string) => boolean,
      ][]) {
        if (currentMap[field] === undefined && matcher(norm)) {
          currentMap[field] = c;
          matchCount++;
          break;
        }
      }
    }

    // A valid header row should have at least MaLop or MaMH, plus other key headers (at least 3 matches)
    const hasCrucialFields =
      (currentMap.MaLop !== undefined || currentMap.MaMH !== undefined) &&
      (currentMap.TenMH !== undefined || currentMap.Thu !== undefined || currentMap.Tiet !== undefined);

    if (matchCount >= 3 && hasCrucialFields) {
      const completeMap = {} as Record<keyof ClassModelOriginal, number>;
      (Object.keys(FIELD_MATCHERS) as (keyof ClassModelOriginal)[]).forEach((key) => {
        completeMap[key] = currentMap[key] !== undefined ? currentMap[key]! : -1;
      });
      return { headerRowIndex: r, colMap: completeMap };
    }
  }

  return null;
}

export function sanitizeThu(val: any): string {
  if (val === null || val === undefined || val === '') return '*';
  const str = String(val).trim();
  if (str === '-' || str === '0' || str === 'null' || str === 'undefined' || str === '*') return '*';
  if (str.toLowerCase() === 'cn' || str.toLowerCase() === 'chu nhat') return '8';
  return str;
}

export function sanitizeTiet(val: any): string {
  if (val === null || val === undefined || val === '') return '*';
  const str = String(val).trim();
  if (str === '-' || str === '0' || str === 'null' || str === 'undefined' || str === '*') return '*';
  return str;
}

// Fallback legacy converter for fixed positional rows
export function arrayToTkbObject(array: any[]): ClassModelOriginal {
  return {
    STT: typeof array[0] === 'number' ? array[0] : parseInt(String(array[0]), 10) || 1,
    MaMH: String(array[1] ?? '').trim(),
    MaLop: String(array[2] ?? '').trim(),
    TenMH: String(array[3] ?? '').trim(),
    MaGV: array[4] ? String(array[4]).trim() : undefined,
    TenGV: array[5] ? String(array[5]).trim() : undefined,
    SiSo: String(array[6] ?? '').trim(),
    SoTc: parseInt(String(array[7]), 10) || 0,
    ThucHanh: typeof array[8] === 'number' ? array[8] : parseInt(String(array[8]), 10) || 0,
    HTGD: String(array[9] ?? '').trim(),
    Thu: sanitizeThu(array[10]),
    Tiet: sanitizeTiet(array[11]),
    CachTuan: String(array[12] ?? '1').trim(),
    PhongHoc: array[13] ? String(array[13]).trim() : undefined,
    KhoaHoc: String(array[14] ?? '').trim(),
    HocKy: String(array[15] ?? '').trim(),
    NamHoc: String(array[16] ?? '').trim(),
    HeDT: String(array[17] ?? '').trim(),
    KhoaQL: String(array[18] ?? '').trim(),
    NBD: convertExcelDateToStringDate(array[19]),
    NKT: convertExcelDateToStringDate(array[20]),
    GhiChu: String(array[21] ?? '').trim(),
    NgonNgu: String(array[22] ?? '').trim(),
  };
}

// Main parser for entire workbook (supports both new form and legacy forms across all sheets)
export function parseWorkbookToTkb(wb: XLSX.WorkBook): ClassModelOriginal[] {
  const allParsedClasses: ClassModelOriginal[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const sheetData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
    if (!sheetData || sheetData.length === 0) continue;

    const headerInfo = findHeaderRowAndColMap(sheetData);

    if (!headerInfo) {
      // Fallback: check if rows have numeric STT in column 0
      const legacyRows = sheetData.filter((row) => typeof row[0] === 'number');
      for (const row of legacyRows) {
        allParsedClasses.push(arrayToTkbObject(row));
      }
      continue;
    }

    const { headerRowIndex, colMap } = headerInfo;
    let sttCounter = allParsedClasses.length + 1;

    for (let r = headerRowIndex + 1; r < sheetData.length; r++) {
      const row: any = sheetData[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const maLop = colMap.MaLop !== -1 ? String(row[colMap.MaLop] ?? '').trim() : '';
      const maMH = colMap.MaMH !== -1 ? String(row[colMap.MaMH] ?? '').trim() : '';
      const tenMH = colMap.TenMH !== -1 ? String(row[colMap.TenMH] ?? '').trim() : '';

      // Skip empty or header-like rows
      if (!maLop && !maMH && !tenMH) continue;
      const normMaLop = normalizeHeaderText(maLop);
      const normMaMH = normalizeHeaderText(maMH);
      if (normMaLop === 'ma lop' || normMaMH === 'ma mh' || normMaLop.startsWith('tong so') || normMaMH.startsWith('tong so')) {
        continue;
      }

      // Infer MaMH if missing from MaLop (e.g. AI002.R11 -> AI002)
      const finalMaMH = maMH || (maLop.includes('.') ? maLop.split('.')[0] : maLop);
      const finalMaLop = maLop || finalMaMH;
      let finalTenMH = tenMH || finalMaMH;

      const rawStt: any = colMap.STT !== -1 ? row[colMap.STT] : undefined;
      const stt: number =
        typeof rawStt === 'number'
          ? rawStt
          : rawStt !== undefined && rawStt !== null && String(rawStt).trim() !== ''
          ? parseInt(String(rawStt), 10) || sttCounter
          : sttCounter;

      const defaultHtgd = sheetName.toLowerCase().includes('th') ? 'TH' : 'LT';
      const rawHtgd =
        colMap.HTGD !== -1 && row[colMap.HTGD] !== undefined && row[colMap.HTGD] !== null && String(row[colMap.HTGD]).trim() !== ''
          ? String(row[colMap.HTGD]).trim()
          : defaultHtgd;

      const rawThucHanh = colMap.ThucHanh !== -1 ? row[colMap.ThucHanh] : undefined;
      const thucHanh: number =
        typeof rawThucHanh === 'number'
          ? rawThucHanh
          : rawThucHanh !== undefined && rawThucHanh !== null && String(rawThucHanh).trim() !== ''
          ? parseInt(String(rawThucHanh), 10) || 0
          : 0;

      let maGV = colMap.MaGV !== -1 && Boolean(row[colMap.MaGV]) ? String(row[colMap.MaGV]).trim() : undefined;
      let tenGV = colMap.TenGV !== -1 && Boolean(row[colMap.TenGV]) ? String(row[colMap.TenGV]).trim() : undefined;
      let soTc = colMap.SoTc !== -1 ? parseInt(String(row[colMap.SoTc]), 10) || 0 : 0;

      if (allParsedClasses.length > 0) {
        const getBaseMaLop = (ml: string) => ml.split('.').slice(0, 2).join('.');
        
        // Search backwards for the last class with the same MaLop base
        // This is crucial because LT classes (Sheet 1) and TH classes (Sheet 2) are separated,
        // and even within the same sheet, some classes might be skipped.
        for (let i = allParsedClasses.length - 1; i >= 0; i--) {
          const lastClass = allParsedClasses[i];
          if (getBaseMaLop(finalMaLop) === getBaseMaLop(lastClass.MaLop)) {
            if (!tenGV) tenGV = lastClass.TenGV;
            if (!maGV) maGV = lastClass.MaGV;
            if (!soTc) soTc = lastClass.SoTc;
            if (!tenMH) finalTenMH = lastClass.TenMH;
            break;
          }
        }
      }

      const parsedClass: ClassModelOriginal = {
        STT: stt,
        MaMH: finalMaMH,
        MaLop: finalMaLop,
        TenMH: finalTenMH,
        MaGV: maGV,
        TenGV: tenGV,
        SiSo: colMap.SiSo !== -1 && Boolean(row[colMap.SiSo]) ? String(row[colMap.SiSo]).trim() : '',
        SoTc: soTc,
        ThucHanh: thucHanh,
        HTGD: rawHtgd,
        Thu: sanitizeThu(colMap.Thu !== -1 ? row[colMap.Thu] : '*'),
        Tiet: sanitizeTiet(colMap.Tiet !== -1 ? row[colMap.Tiet] : '*'),
        CachTuan: colMap.CachTuan !== -1 && Boolean(row[colMap.CachTuan]) ? String(row[colMap.CachTuan]).trim() : '1',
        PhongHoc: colMap.PhongHoc !== -1 && Boolean(row[colMap.PhongHoc]) ? String(row[colMap.PhongHoc]).trim() : undefined,
        KhoaHoc: colMap.KhoaHoc !== -1 && Boolean(row[colMap.KhoaHoc]) ? String(row[colMap.KhoaHoc]).trim() : '',
        HocKy: colMap.HocKy !== -1 && Boolean(row[colMap.HocKy]) ? String(row[colMap.HocKy]).trim() : '',
        NamHoc: colMap.NamHoc !== -1 && Boolean(row[colMap.NamHoc]) ? String(row[colMap.NamHoc]).trim() : '',
        HeDT: colMap.HeDT !== -1 && Boolean(row[colMap.HeDT]) ? String(row[colMap.HeDT]).trim() : '',
        KhoaQL: colMap.KhoaQL !== -1 && Boolean(row[colMap.KhoaQL]) ? String(row[colMap.KhoaQL]).trim() : '',
        NBD: colMap.NBD !== -1 && Boolean(row[colMap.NBD]) ? convertExcelDateToStringDate(row[colMap.NBD]) : '',
        NKT: colMap.NKT !== -1 && Boolean(row[colMap.NKT]) ? convertExcelDateToStringDate(row[colMap.NKT]) : '',
        GhiChu: colMap.GhiChu !== -1 && Boolean(row[colMap.GhiChu]) ? String(row[colMap.GhiChu]).trim() : '',
        NgonNgu: colMap.NgonNgu !== -1 && Boolean(row[colMap.NgonNgu]) ? String(row[colMap.NgonNgu]).trim() : '',
      };

      allParsedClasses.push(parsedClass);
      sttCounter++;
    }
  }

  return allParsedClasses;
}

// from Date object to 'hh:mm dd/MM/yyyy' format
export function toDateTimeString(date: Date) {
  return (
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0') +
    ' ' +
    date.getDate().toString().padStart(2, '0') +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getFullYear()
  );
}

// Format epoch timestamp to 'hh:mm dd/MM/yyyy' format
export function formatTimestampToString(timestamp: number): string {
  return toDateTimeString(new Date(timestamp));
}

// Get formatted lastUpdate string from dataExcel (backward compatible)
export function getLastUpdateString(
  dataExcel: { lastUpdate?: string; lastUpdateTimestamp?: number } | null,
): string | undefined {
  if (!dataExcel) return undefined;
  if (dataExcel.lastUpdateTimestamp !== undefined) {
    return formatTimestampToString(dataExcel.lastUpdateTimestamp);
  }
  return dataExcel.lastUpdate;
}

// copied from: https://github.com/SheetJS/sheetjs/blob/master/demos/react/sheetjs.jsx#L134-L136
export const sheetJSFT = [
  '.xlsx',
  '.xlsb',
  '.xlsm',
  '.xls',
  // '.xml',
  '.csv',
  // '.txt',
  // '.ods',
  // '.fods',
  // '.uos',
  // '.sylk',
  // '.dif',
  // '.dbf',
  // '.prn',
  // '.qpw',
  // '.123',
  // '.wb*',
  // '.wq*',
  // '.html',
  // '.htm',
].join(',');
