const fs = require("fs");
const path = require("path");

const resultsDir = path.join(__dirname, "..", "results");
let currentFilePath = "";

const Reporter = {

  /**
   * Initializes the report with the detailed header and table structure
   */
  initReport(config, { title, url, mode = 'new' }) {
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    const now = new Date();

    const separatorLine = "=".repeat(170) + "\n";
    const header = separatorLine +
                   `                                           ${title.toUpperCase()} OPERATION REPORT\n` +
                   `                                   Page URL: ${url || 'N/A'}\n` + 
                   `                                   Date: ${now.toLocaleDateString()} | Time: ${now.toLocaleTimeString()}\n` +
                   separatorLine + "\n";

    const tableBorder = `+------+------------------------------------------------------------------------+------------+-------------------------------------------------------------------------+\n`;
    const tableHeader = tableBorder +
                        `| S/N  | Operation Name                                                         | Status     | Error Log / Reason                                                      |\n` +
                        tableBorder;

    if (mode === 'new') {
      const timestamp = `${now.toISOString().split('T')[0]}_${now.toTimeString().split(' ')[0].replace(/:/g, "-")}`;
      const fileName = `Report_${timestamp}.txt`;
      currentFilePath = path.join(resultsDir, fileName);
      fs.writeFileSync(currentFilePath, header + tableHeader);
    } else {
      // Logic to find the latest report file if mode is not 'new'
      const files = fs.readdirSync(resultsDir)
        .filter(f => f.endsWith('.txt'))
        .map(f => ({ name: f, time: fs.statSync(path.join(resultsDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        currentFilePath = path.join(resultsDir, files[0].name);
        fs.appendFileSync(currentFilePath, `\n\n` + header + tableHeader);
      }
    }
    return currentFilePath;
  },

  /**
   * Writes a row to the table with text wrapping support
   */
  writeOperationTableReport({ sn, name, status, errorLog }) {
    if (!currentFilePath) return false;

    const nameWidth = 70;
    const errorWidth = 71;
    const statusWidth = 10;

    // Helper to wrap long text into multiple lines
    const wrapText = (text, width) => {
      const result = [];
      let str = String(text || "N/A");
      while (str.length > 0) {
        result.push(str.substring(0, width));
        str = str.substring(width);
      }
      return result.length > 0 ? result : [""];
    };

    const nameLines = wrapText(name, nameWidth);
    const errorLines = wrapText(errorLog, errorWidth);
    const maxLines = Math.max(nameLines.length, errorLines.length);

    let rowContent = "";
    const pad = (text, width) => (String(text || "")).padEnd(width).substring(0, width);

    for (let i = 0; i < maxLines; i++) {
      const snCell = i === 0 ? pad(String(sn), 4) : pad("", 4);
      const statusCell = i === 0 ? pad(status.toUpperCase(), statusWidth) : pad("", statusWidth);
      const nameCell = pad(nameLines[i], nameWidth);
      const errorCell = pad(errorLines[i], errorWidth);

      rowContent += `| ${snCell} | ${nameCell} | ${statusCell} | ${errorCell} |\n`;
    }

    const tableBorder = `+------+------------------------------------------------------------------------+------------+-------------------------------------------------------------------------+\n`;
    fs.appendFileSync(currentFilePath, rowContent + tableBorder);
    return true;
  },

// Add these methods inside the Reporter object in reporter.js

  /**
   * Writes the Page Performance table (Primary and Full Load)
   */
  writePerformanceText(row) {
    if (!currentFilePath) return false;
    const pageHeader = `\n======================================================================\n` +
                       `📄 PAGE PERFORMANCE REPORT\n` +
                       `Page name: ${row.page}\nPage URL: ${row.url}\n`;
    const line = "+---------------------+----------------------+--------------------+\n";
    const tableHeader = line + "| Page                | Primary Load (ms)    | Full Load (ms)     |\n" + line;
    const format = (text, width) => (String(text || "N/A") + " ".repeat(width)).substring(0, width);
    const rowText = "| " + format(row.page, 20) + " | " + format(String(row.primaryLoadTime), 20) + 
                    " | " + format(String(row.fullLoadTime), 18) + " |\n" + line;
    
    fs.appendFileSync(currentFilePath, pageHeader + tableHeader + rowText);
    return true;
  },

  /**
   * Writes the ranked list of API calls for the page
   */
  writeBottleneckReport({ allApis, failedApis }) {
    if (!currentFilePath) return false;

    const format = (text, width) => (String(text || "N/A") + " ".repeat(width)).substring(0, width);
    let report = `\n⚠️  BACKEND API CALLS FOR THIS PAGE (SORTED BY DURATION):\n`;
    const apiLine = "+------+--------------------------------------------------------------------------------------------------------------------------+----------------------+\n";
    report += apiLine + "| Rank | API URL                                                                                                                  | Duration (ms)        |\n" + apiLine;

    allApis.forEach((api, index) => {
      const rank = format(String(index + 1), 4);
      let cleanUrl = api.url.split('?')[0]; 
      let urlDisplay = cleanUrl.length > 120 ? cleanUrl.substring(0, 117) + "..." : cleanUrl;
      report += `| ${rank} | ${format(urlDisplay, 120)} | ${format(String(api.duration), 20)} |\n`;
    });
    report += apiLine + "\n";

    fs.appendFileSync(currentFilePath, report);
    return true;
  }
  
};

module.exports = Reporter;