'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = readXlsxFile;

var _unpackXlsxFileNode = require('./unpackXlsxFileNode');

var _unpackXlsxFileNode2 = _interopRequireDefault(_unpackXlsxFileNode);

var _xmlNode = require('./xmlNode');

var _xmlNode2 = _interopRequireDefault(_xmlNode);

var _readXlsxFileContents = require('./readXlsxFileContents');

var _readXlsxFileContents2 = _interopRequireDefault(_readXlsxFileContents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reads XLSX file into a 2D array of cells in a browser.
 * @param  {(string|Stream|Buffer)} input - A Node.js readable stream or a `Buffer` or a path to a file.
 * @param  {object?} options
 * @param  {(number|string)?} options.sheet - Excel document sheet to read. Defaults to `1`. Will only read this sheet and skip others.
 * @return {Promise} Resolves to a 2D array of cells: an array of rows, each row being an array of cells.
 */
function readXlsxFile(input) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return (0, _unpackXlsxFileNode2.default)(input).then(function (entries) {
    return (0, _readXlsxFileContents2.default)(entries, _xmlNode2.default, options);
  });
}
//# sourceMappingURL=readXlsxFileNode.js.map