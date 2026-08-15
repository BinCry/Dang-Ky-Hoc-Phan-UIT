import { getScriptDkhp } from './utils';

describe('3KetQua utils - getScriptDkhp', () => {
  it('generates registration script with selected class codes', () => {
    const listMaLop = ['AI002.R11', 'BUS1125.R11', 'CE118.R11', 'CE118.R11.1'];
    const script = getScriptDkhp(listMaLop);

    expect(script).toContain('AI002.R11');
    expect(script).toContain('BUS1125.R11');
    expect(script).toContain('CE118.R11');
    expect(script).toContain('CE118.R11.1');
    expect(script).toContain('DangKy(monDangKy);');
    expect(script).toContain("document.querySelectorAll('form table tr')");
  });
});
