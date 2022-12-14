'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = readXlsx;
exports.dropEmptyRows = dropEmptyRows;
exports.dropEmptyColumns = dropEmptyColumns;

var _parseDate = require('./parseDate');

var _parseDate2 = _interopRequireDefault(_parseDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var namespaces = {
  a: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  // This one seems to be for `r:id` attributes on `<sheet>`s.
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  // This one seems to be for `<Relationships/>` file.
  rr: 'http://schemas.openxmlformats.org/package/2006/relationships'

  // Maps "A1"-like coordinates to `{ row, column }` numeric coordinates.
};var letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

/**
 * Reads an (unzipped) XLSX file structure into a 2D array of cells.
 * @param  {object} contents - A list of XML files inside XLSX file (which is a zipped directory).
 * @param  {number?} options.sheet - Workbook sheet id (`1` by default).
 * @param  {string?} options.dateFormat - Date format, e.g. "MM/DD/YY". Values having this format template set will be parsed as dates.
 * @param  {object} contents - A list of XML files inside XLSX file (which is a zipped directory).
 * @return {object} An object of shape `{ data, cells, properties }`. `data: string[][]` is an array of rows, each row being an array of cell values. `cells: string[][]` is an array of rows, each row being an array of cells. `properties: object` is the spreadsheet properties (e.g. whether date epoch is 1904 instead of 1900).
 */
function readXlsx(contents, xml) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!options.sheet) {
    options = _extends({
      sheet: 1
    }, options);
  }

  // Some Excel editors don't want to use standard naming scheme for sheet files.
  // https://github.com/tidyverse/readxl/issues/104
  var fileNames = parseFileNames(contents['xl/_rels/workbook.xml.rels'], xml);
  // Default file path for "shared strings": "xl/sharedStrings.xml".
  var values = parseValues(contents['xl/' + fileNames.sharedStrings], xml);
  // Default file path for "styles": "xl/styles.xml".
  var styles = parseStyles(contents['xl/' + fileNames.styles], xml);
  var properties = parseProperties(contents['xl/workbook.xml'], xml);

  // A feature for getting the list of sheets in an Excel file.
  // https://github.com/catamphetamine/read-excel-file/issues/14
  if (options.getSheets) {
    return properties.sheets.map(function (_ref) {
      var name = _ref.name;
      return {
        name: name
      };
    });
  }

  // Find the sheet by name, or take the first one.
  var sheetRelationId = void 0;
  if (typeof options.sheet === 'number') {
    var _sheet = properties.sheets[options.sheet - 1];
    sheetRelationId = _sheet && _sheet.relationId;
  } else {
    for (var _iterator = properties.sheets, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var _sheet2 = _ref2;

      if (_sheet2.name === options.sheet) {
        sheetRelationId = _sheet2.relationId;
        break;
      }
    }
  }

  // If the sheet wasn't found then throw an error.
  // Example: "xl/worksheets/sheet1.xml".
  if (!sheetRelationId || !fileNames.sheets[sheetRelationId]) {
    throw createSheetNotFoundError(options.sheet, properties.sheets);
  }

  // Parse sheet data.
  var sheet = parseSheet(contents['xl/' + fileNames.sheets[sheetRelationId]], xml, values, styles, properties, options);

  // If the sheet is empty.
  if (sheet.cells.length === 0) {
    if (options.properties) {
      return {
        data: [],
        properties: properties
      };
    }
    return [];
  }

  var _sheet$dimensions = _slicedToArray(sheet.dimensions, 2),
      leftTop = _sheet$dimensions[0],
      rightBottom = _sheet$dimensions[1];

  var colsCount = rightBottom.column - leftTop.column + 1;
  var rowsCount = rightBottom.row - leftTop.row + 1;

  // `sheet.cells` seem to not necessarily be sorted by row and column.
  var data = new Array(rowsCount);
  var i = 0;
  while (i < rowsCount) {
    data[i] = new Array(colsCount);
    var j = 0;
    while (j < colsCount) {
      data[i][j] = null;
      j++;
    }
    i++;
  }
  for (var _iterator2 = sheet.cells, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref3 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref3 = _i2.value;
    }

    var cell = _ref3;

    var row = cell.row - leftTop.row;
    var column = cell.column - leftTop.column;
    data[row][column] = cell.value;
  }

  // Fill in the row map.
  var _options = options,
      rowMap = _options.rowMap;

  if (rowMap) {
    var _i3 = 0;
    while (_i3 < data.length) {
      rowMap[_i3] = _i3;
      _i3++;
    }
  }

  data = dropEmptyRows(dropEmptyColumns(data, { onlyTrimAtTheEnd: true }), { onlyTrimAtTheEnd: true, rowMap: rowMap });

  if (options.transformData) {
    data = options.transformData(data);
    // data = options.transformData(data, {
    //   dropEmptyRowsAndColumns(data) {
    //     return dropEmptyRows(dropEmptyColumns(data), { rowMap })
    //   }
    // })
  }

  if (options.properties) {
    return {
      data: data,
      properties: properties
    };
  }

  return data;
}

function calculateDimensions(cells) {
  var comparator = function comparator(a, b) {
    return a - b;
  };
  var allRows = cells.map(function (cell) {
    return cell.row;
  }).sort(comparator);
  var allCols = cells.map(function (cell) {
    return cell.column;
  }).sort(comparator);
  var minRow = allRows[0];
  var maxRow = allRows[allRows.length - 1];
  var minCol = allCols[0];
  var maxCol = allCols[allCols.length - 1];

  return [{ row: minRow, column: minCol }, { row: maxRow, column: maxCol }];
}

function colToInt(col) {
  // `for ... of ...` would require Babel polyfill for iterating a string.
  var n = 0;
  var i = 0;
  while (i < col.length) {
    n *= 26;
    n += letters.indexOf(col[i]);
    i++;
  }
  return n;
}

function CellCoords(coords) {
  // Examples: "AA2091", "R988", "B1"
  coords = coords.split(/(\d+)/);
  return [
  // Row.
  parseInt(coords[1]),
  // Column.
  colToInt(coords[0].trim())];
}

function Cell(cellNode, sheet, xml, values, styles, properties, options) {
  var coords = CellCoords(cellNode.getAttribute('r'));

  var value = xml.select(sheet, cellNode, 'a:v', namespaces)[0];
  // For `xpath` `value` can be `undefined` while for native `DOMParser` it's `null`.
  // So using `value && ...` instead of `if (value !== undefined) { ... }` here.
  value = value && value.textContent;

  // http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/ST_CellType.html
  switch (cellNode.getAttribute('t')) {
    // If the cell contains formula string.
    case 'str':
      value = value.trim();
      if (value === '') {
        value = undefined;
      }
      break;

    // If the cell contains a "shared" string.
    case 's':
      // If a cell has no value then there's no `<c/>` element for it.
      // If a `<c/>` element exists then it's not empty.
      // The `<v/>`alue is a key in the "shared strings" dictionary of the
      // XLSX file, so look it up in the `values` dictionary by the numeric key.
      value = values[parseInt(value)].trim();
      if (value === '') {
        value = undefined;
      }
      break;

    case 'b':
      value = value === '1' ? true : false;
      break;

    case 'n':
    // Default type is "n".
    // http://www.datypic.com/sc/ooxml/t-ssml_CT_Cell.html
    default:
      if (value === undefined) {
        break;
      }
      value = parseFloat(value);
      // XLSX has no specific format for dates.
      // Sometimes a date can be heuristically detected.
      // https://github.com/catamphetamine/read-excel-file/issues/3#issuecomment-395770777
      var style = styles[parseInt(cellNode.getAttribute('s') || 0)];
      if (style.numberFormat.id >= 14 && style.numberFormat.id <= 22 || style.numberFormat.id >= 45 && style.numberFormat.id <= 47 || options.dateFormat && style.numberFormat.template === options.dateFormat || options.smartDateParser !== false && style.numberFormat.template && isDateTemplate(style.numberFormat.template)) {
        value = (0, _parseDate2.default)(value, properties);
      }
      break;
  }

  // Convert empty values to `null`.
  if (value === undefined) {
    value = null;
  }

  return {
    row: coords[0],
    column: coords[1],
    value: value
  };
}

function dropEmptyRows(data) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      rowMap = _ref4.rowMap,
      _ref4$accessor = _ref4.accessor,
      accessor = _ref4$accessor === undefined ? function (_) {
    return _;
  } : _ref4$accessor,
      onlyTrimAtTheEnd = _ref4.onlyTrimAtTheEnd;

  // Drop empty rows.
  var i = data.length - 1;
  while (i >= 0) {
    // Check if the row is empty.
    var empty = true;
    for (var _iterator3 = data[i], _isArray3 = Array.isArray(_iterator3), _i4 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray3) {
        if (_i4 >= _iterator3.length) break;
        _ref5 = _iterator3[_i4++];
      } else {
        _i4 = _iterator3.next();
        if (_i4.done) break;
        _ref5 = _i4.value;
      }

      var cell = _ref5;

      if (accessor(cell) !== null) {
        empty = false;
        break;
      }
    }
    // Remove the empty row.
    if (empty) {
      data.splice(i, 1);
      if (rowMap) {
        rowMap.splice(i, 1);
      }
    } else if (onlyTrimAtTheEnd) {
      break;
    }
    i--;
  }
  return data;
}

function dropEmptyColumns(data) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$accessor = _ref6.accessor,
      accessor = _ref6$accessor === undefined ? function (_) {
    return _;
  } : _ref6$accessor,
      onlyTrimAtTheEnd = _ref6.onlyTrimAtTheEnd;

  var i = data[0].length - 1;
  while (i >= 0) {
    var empty = true;
    for (var _iterator4 = data, _isArray4 = Array.isArray(_iterator4), _i5 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref7;

      if (_isArray4) {
        if (_i5 >= _iterator4.length) break;
        _ref7 = _iterator4[_i5++];
      } else {
        _i5 = _iterator4.next();
        if (_i5.done) break;
        _ref7 = _i5.value;
      }

      var row = _ref7;

      if (accessor(row[i]) !== null) {
        empty = false;
        break;
      }
    }
    if (empty) {
      var j = 0;
      while (j < data.length) {
        data[j].splice(i, 1);
        j++;
      }
    } else if (onlyTrimAtTheEnd) {
      break;
    }
    i--;
  }
  return data;
}

function parseSheet(content, xml, values, styles, properties, options) {
  var sheet = xml.createDocument(content);

  var cells = xml.select(sheet, null, '/a:worksheet/a:sheetData/a:row/a:c', namespaces).map(function (node) {
    return Cell(node, sheet, xml, values, styles, properties, options);
  });

  if (cells.length === 0) {
    return { cells: cells };
  }

  // "//a:dimension/@ref" causes "RangeError: Maximum call stack size exceeded" error.
  // That selector was in the legacy code I copy-pasted and no one knows why it was there.
  // let dimensions = xml.select(sheet, null, '//a:dimension/@ref', namespaces)[0]
  var dimensions = xml.select(sheet, null, '/a:worksheet/a:dimension/@ref', namespaces)[0];

  if (dimensions) {
    dimensions = dimensions.textContent.split(':').map(CellCoords).map(function (_ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
          row = _ref9[0],
          column = _ref9[1];

      return {
        row: row,
        column: column
      };
    });
    // When there's only a single cell on a sheet
    // there can sometimes be just "A1" for the dimensions string.
    if (dimensions.length === 1) {
      dimensions = [dimensions[0], dimensions[0]];
    }
  } else {
    dimensions = calculateDimensions(cells);
  }

  return { cells: cells, dimensions: dimensions };
}

function parseValues(content, xml) {
  if (!content) {
    return [];
  }
  var strings = xml.createDocument(content);
  return xml.select(strings, null, '//a:si', namespaces).map(function (string) {
    return xml.select(strings, string, './/a:t[not(ancestor::a:rPh)]', namespaces).map(function (_) {
      return _.textContent;
    }).join('');
  });
}

// http://officeopenxml.com/SSstyles.php
function parseStyles(content, xml) {
  if (!content) {
    return {};
  }
  // https://social.msdn.microsoft.com/Forums/sqlserver/en-US/708978af-b598-45c4-a598-d3518a5a09f0/howwhen-is-cellstylexfs-vs-cellxfs-applied-to-a-cell?forum=os_binaryfile
  // https://www.office-forums.com/threads/cellxfs-cellstylexfs.2163519/
  var doc = xml.createDocument(content);
  var baseStyles = xml.select(doc, null, '//a:styleSheet/a:cellStyleXfs/a:xf', namespaces).map(parseCellStyle);
  var numFmts = xml.select(doc, null, '//a:styleSheet/a:numFmts/a:numFmt', namespaces).map(parseNumberFormatStyle).reduce(function (formats, format) {
    formats[format.id] = format;
    return formats;
  }, []);

  return xml.select(doc, null, '//a:styleSheet/a:cellXfs/a:xf', namespaces).map(function (xf) {
    if (xf.hasAttribute('xfId')) {
      return _extends({}, baseStyles[xf.xfId], parseCellStyle(xf, numFmts));
    }
    return parseCellStyle(xf, numFmts);
  });
}

function parseNumberFormatStyle(numFmt) {
  return {
    id: numFmt.getAttribute('numFmtId'),
    template: numFmt.getAttribute('formatCode')
  };
}

// http://www.datypic.com/sc/ooxml/e-ssml_xf-2.html
function parseCellStyle(xf, numFmts) {
  var style = {};
  if (xf.hasAttribute('numFmtId')) {
    var numberFormatId = xf.getAttribute('numFmtId');
    if (numFmts[numberFormatId]) {
      style.numberFormat = numFmts[numberFormatId];
    } else {
      style.numberFormat = { id: numberFormatId };
    }
  }
  return style;
}

// I guess `xl/workbook.xml` file should always be present inside the *.xlsx archive.
function parseProperties(content, xml) {
  var book = xml.createDocument(content);
  // http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/workbookPr.html
  var properties = {};
  // https://support.microsoft.com/en-gb/help/214330/differences-between-the-1900-and-the-1904-date-system-in-excel
  var workbookProperties = xml.select(book, null, '//a:workbookPr', namespaces)[0];
  if (workbookProperties && workbookProperties.getAttribute('date1904') === '1') {
    properties.epoch1904 = true;
  }
  // Get sheets info (indexes, names, if they're available).
  // Example:
  // <sheets>
  //   <sheet
  //     xmlns:ns="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  //     name="Sheet1"
  //     sheetId="1"
  //     ns:id="rId3"/>
  // </sheets>
  // http://www.datypic.com/sc/ooxml/e-ssml_sheet-1.html
  properties.sheets = [];
  var i = 0;
  for (var _iterator5 = xml.select(book, null, '//a:sheets/a:sheet', namespaces), _isArray5 = Array.isArray(_iterator5), _i6 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
    var _ref10;

    if (_isArray5) {
      if (_i6 >= _iterator5.length) break;
      _ref10 = _iterator5[_i6++];
    } else {
      _i6 = _iterator5.next();
      if (_i6.done) break;
      _ref10 = _i6.value;
    }

    var sheet = _ref10;

    if (sheet.getAttribute('name')) {
      properties.sheets.push({
        id: sheet.getAttribute('sheetId'),
        name: sheet.getAttribute('name'),
        relationId: sheet.getAttribute('r:id')
      });
    }
    i++;
  }
  return properties;
}

/**
 * Returns sheet file paths.
 * Seems that the correct place to look for the
 * `sheetId` -> `filename` mapping seems to be in the
 * `xl/_rels/workbook.xml.rels` file.
 * https://github.com/tidyverse/readxl/issues/104
 * @param  {string} content ??? `xl/_rels/workbook.xml.rels` file contents.
 * @param  {object} xml
 * @return {object}
 */
function parseFileNames(content, xml) {
  // Example:
  // <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  //   ...
  //   <Relationship
  //     Id="rId3"
  //     Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"
  //     Target="worksheets/sheet1.xml"/>
  // </Relationships>
  var document = xml.createDocument(content);
  var fileNames = {
    sheets: {},
    sharedStrings: undefined,
    styles: undefined
  };
  for (var _iterator6 = xml.select(document, null, '/rr:Relationships/rr:Relationship', namespaces), _isArray6 = Array.isArray(_iterator6), _i7 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
    var _ref11;

    if (_isArray6) {
      if (_i7 >= _iterator6.length) break;
      _ref11 = _iterator6[_i7++];
    } else {
      _i7 = _iterator6.next();
      if (_i7.done) break;
      _ref11 = _i7.value;
    }

    var relationship = _ref11;

    var filePath = relationship.getAttribute('Target');
    switch (relationship.getAttribute('Type')) {
      case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles':
        fileNames.styles = filePath;
        break;
      case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings':
        fileNames.sharedStrings = filePath;
        break;
      case 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet':
        fileNames.sheets[relationship.getAttribute('Id')] = filePath;
        break;
    }
  }
  if (!fileNames.styles) {
    throw new Error('"styles.xml" file not found in the *.xlsx file');
  }
  // Seems like "sharedStrings.xml" is not required to exist.
  // For example, when the spreadsheet doesn't contain any strings.
  // https://github.com/catamphetamine/read-excel-file/issues/85
  // if (!fileNames.sharedStrings) {
  //   throw new Error('"sharedStrings.xml" file not found in the *.xlsx file')
  // }
  return fileNames;
}

function isDateTemplate(template) {
  var tokens = template.split(/\W+/);
  for (var _iterator7 = tokens, _isArray7 = Array.isArray(_iterator7), _i8 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
    var _ref12;

    if (_isArray7) {
      if (_i8 >= _iterator7.length) break;
      _ref12 = _iterator7[_i8++];
    } else {
      _i8 = _iterator7.next();
      if (_i8.done) break;
      _ref12 = _i8.value;
    }

    var token = _ref12;

    if (['MM', 'DD', 'YY', 'YYYY'].indexOf(token) < 0) {
      return false;
    }
  }
  return true;
}

function createSheetNotFoundError(sheet, sheets) {
  var sheetsList = sheets && sheets.map(function (sheet, i) {
    return '"' + sheet.name + '" (#' + (i + 1) + ')';
  }).join(', ');
  return new Error('Sheet ' + (typeof sheet === 'number' ? '#' + sheet : '"' + sheet + '"') + ' not found in the *.xlsx file.' + (sheets ? ' Available sheets: ' + sheetsList + '.' : ''));
}
//# sourceMappingURL=readXlsx.js.map