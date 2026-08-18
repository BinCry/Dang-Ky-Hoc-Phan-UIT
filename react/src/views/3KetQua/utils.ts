export const getScriptDkhp = (listMonDangKy: string[]) =>
  `
// Chỉ cần thay mỗi môn trên một hàng cho biến monDangKy này là xong
// Lưu ý: Nếu sau này trường update website, các thẻ query không còn đúng nữa, thì bạn liên hệ messenger.com/t/loia5tqd001 để báo mình nhé

var monDangKy = \`
${listMonDangKy.join('\n')}
\`;

var successLog = (message) => console.log('%c' + message, 'font-weight:bold; color:green;');
var errorLog = (message) => console.log('%c' + message, 'font-weight:bold; color:red;');

DangKy(monDangKy);

function DangKy(monDangKyString) {
  try {
    var listMonDangKy = monDangKyString.trim().split('\\n').map((it) => it.trim())
    
    var allRows = [...document.querySelectorAll('form table tr')]

    var rowsToDangKy = allRows.filter((it) => listMonDangKy.includes(it.querySelector('td:nth-child(2)')?.textContent?.trim()))
    
    rowsToDangKy.forEach((it, index) => {
      it.querySelector('td:first-child input[type="checkbox"]').click();
      var tenLop = it.querySelector('td:nth-child(2)')?.textContent?.trim();
      successLog(index + 1 + '.Đã chọn lớp ' + tenLop);
    })
  } catch {
    errorLog('Chọn lớp không thành công! Bạn tự chọn lớp đi nhé!');
  }
}
`.trim();

export const getBotScriptDkhp = (listMonDangKy: string[]) =>
  `
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const monDangKy = [
${listMonDangKy.map(mon => `  "${mon}"`).join(',\n')}
];

(async () => {
    console.log("🚀 Bắt đầu khởi động Bot SIÊU TỐC...");
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
        protocolTimeout: 0 // Khắc phục lỗi văng bot khi chờ bạn đăng nhập quá lâu
    });
    
    const page = await browser.newPage();
    
    console.log("Đang mở web... Vui lòng tự đăng nhập và bấm vào trang có Bảng Môn Học nhé!");
    await page.goto('https://dkhp.uit.edu.vn/app');
    
    // Đứng chờ cho đến khi bạn vào trang danh sách lớp
    await page.waitForSelector('form table tr', { timeout: 0 }); 
    console.log("✅ Đã tìm thấy bảng danh sách lớp! Bắt đầu quét chớp nhoáng...");

    try {
        // BƯỚC 1: Quét thần tốc bằng Browser Context (Siêu việt)
        const selectorsToClick = await page.$$eval(
            'form table tr', 
            (rows, danhSach) => {
                const matchedPaths = [];
                rows.forEach((row, index) => {
                    const tdMaLop = row.querySelector('td:nth-child(2)');
                    if (tdMaLop && danhSach.includes(tdMaLop.textContent.trim())) {
                        matchedPaths.push(\`form table tr:nth-child(\${index + 1}) td:first-child input[type="checkbox"]\`);
                    }
                });
                return matchedPaths;
            }, 
            monDangKy
        );

        if (selectorsToClick.length === 0) {
            console.log("❌ Không tìm thấy môn nào trong danh sách hiện tại.");
            return;
        }

        // BƯỚC 2: Bắn lệnh click vật lý thần tốc (Không chớp mắt)
        let count = 0;
        for (const selector of selectorsToClick) {
            await page.click(selector); // Tự động cuộn trang tức thời và click thật
            count++;
            console.log(\`[\${count}] ⚡ Chớp nhoáng tick xong 1 môn!\`);
        }
        
        console.log(\`\\n🎉 ĐÃ TICK THẦN TỐC \${count} MÔN TRONG CHỚP MẮT!\`);
        console.log("👉 Bạn hãy nhanh tay ấn nút [Lưu/Đăng ký] cuối cùng nhé!");

    } catch (e) {
        console.log("❌ Có lỗi xảy ra trong quá trình click:", e);
    }
})();
`.trim();

