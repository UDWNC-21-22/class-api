const XLSX = require('xlsx');

const readXlsxFile = (fileName) => {
    const workBook = XLSX.readFile(`./xlsxFolder/${fileName}`);
    const sheet = workBook.SheetNames;

    const dataList = [];

    sheet.forEach((e) => {
        const workSheet = workBook.Sheets[e];
        const headers = {};
        const data = [];
        for (z in workSheet) {
            if (z[0] === "!") continue;
            //parse out the column, row, and value
            var col = z.substring(0, 1);
            // console.log(col);
        
            var row = parseInt(z.substring(1));
            // console.log(row);
        
            var value = workSheet[z].v;
            // console.log(value);
        
            //store header names
            if (row == 1) {
              headers[col] = value;
              // storing the header names
              continue;
            }
        
            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
          }
          //drop those first two rows which are empty
          data.shift();
          data.shift();
          dataList.push(...data);
    })
    

    return dataList;
}

const writeXlsxFile = (fileName, data) => {

    const workSheet = XLSX.utils.json_to_sheet(data)
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, `${fileName}.xlsx`)

    //XLSX.write(workBook, {bookType: 'xlsx', type: 'binary'})
  
    XLSX.writeFile(workBook, `./xlsxFolder/${fileName}.xlsx`);
}

module.exports = {
    readXlsxFile,
    writeXlsxFile,
}