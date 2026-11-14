const fs = require('node:fs');
function browserOptions() {
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    if (!fs.existsSync(process.env.PLAYWRIGHT_EXECUTABLE_PATH)) throw Error('PLAYWRIGHT_EXECUTABLE_PATH does not exist');
    return { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH };
  }
  if (process.platform === 'win32') {
    const path = require('node:path');
    for (const folder of [process.env['PROGRAMFILES(X86)'], process.env.PROGRAMFILES].filter(Boolean)) {
      const candidate = path.join(folder, 'Microsoft/Edge/Application/msedge.exe');
      if (fs.existsSync(candidate)) return { executablePath: candidate };
    }
  }
  return {};
}
async function startTester(page) {
  await page.evaluate(() => mainMenu.start('tester'));
}
module.exports = { browserOptions, startTester };
