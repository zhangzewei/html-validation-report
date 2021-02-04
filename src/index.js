(() => {
  const validator = require('html-validator');
  const { readFileSync, writeFile, readdirSync } = require('fs');
  const htmlBodyContent = (title, body) => `
  <!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      .info-card {
        margin-bottom: 20px;
        background-color: #fff;
        border: 1px solid transparent;
        border-radius: 4px;
        -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.05);
        box-shadow: 0 1px 1px rgba(0,0,0,.05);
      }

      .Warning {
        color: #d4b106;
      }

      .Error {
        color: #a8071a;
      }
    </style>
  </head>
  <body>${body}</body>
  `

  function getFiles() {
    const files = readdirSync('./target').filter(filename => {
      const nameSlice = filename.split('.');
      if (nameSlice[nameSlice.length - 1] === 'html') {
        return true;
      }
      return false;
    });

    return files;
  }

  function genReportLine(type, info, position) {
    const content = info.split(type)[1];
    if (content) {
      return `
      <div class="info-card">
        <div class="info">
          <h3 class="${type}">${type}: </h3>
          <div>${content}</div>
        </div>
        <div class="position">${position}</div>
      </div>
      `
    }
    return '';
  }

  async function writeReport(filename) {
    const options = {
      url: 'http://url-to-validate.com',
      format: 'text',
      data: readFileSync(`./target/${filename}`, 'utf8')
    }

    try {
      const result = await validator(options)
      const resultArr = result.split('\n');
      let reportLines = `
        <h2>${filename}-report</h2>
      `;
      for (let i = 0; i < resultArr.length; i += 2) {
        const resultInfo = resultArr[i];
        const resultPosition = resultArr[i + 1];
        const isWarning = resultInfo.match('Warning:');
        if (isWarning) {
          reportLines += genReportLine("Warning", resultInfo, resultPosition);
        } else {
          reportLines += genReportLine("Error", resultInfo, resultPosition);
        }
      }

      const html = htmlBodyContent(filename + '-report', reportLines)
      writeFile(`${__dirname}/../reports/${filename}-report.html`, html, function (err) {
        if (err) throw err;
      });

      console.log(`Report ${filename} done!`);
    } catch (error) {
      console.error(error);
    }
  }

  const fileList = getFiles();
  console.log('Report strat!');
  fileList.forEach(writeReport);
})()