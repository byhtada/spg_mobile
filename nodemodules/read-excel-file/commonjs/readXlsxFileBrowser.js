'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = readXlsxFile;

var _unpackXlsxFileBrowser = require('./unpackXlsxFileBrowser');

var _unpackXlsxFileBrowser2 = _interopRequireDefault(_unpackXlsxFileBrowser);

var _xmlNode = require('./xmlNode');

var _xmlNode2 = _interopRequireDefault(_xmlNode);

var _readXlsxFileContents = require('./readXlsxFileContents');

var _readXlsxFileContents2 = _interopRequireDefault(_readXlsxFileContents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reads XLSX file into a 2D array of cells in a browser.
 * @param  {file} file - A file being uploaded in the browser.
 * @param  {object?} options
 * @param  {(number|string)?} options.sheet - Excel document sheet to read. Defaults to `1`. Will only read this sheet and skip others.
 * @return {Promise} Resolves to a 2D array of cells: an array of rows, each row being an array of cells.
 */

// Turns out IE11 doesn't support XPath, so not using the native `DOMParser` here.
// https://github.com/catamphetamine/read-excel-file/issues/26
// The bundle size with `./xmlBrowser` is 190 kilobytes,
// the bundle size with `./xmlNode` is 290 kilobytes,
// so `./xmlBrowser` polyfill is about 100 kilobytes in size.
// Still, IE11 is a wide-spread browser and it's unlikely that
// anyone would ignore it for now.
// import xml from './xmlBrowser'
function readXlsxFile(file) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return (0, _unpackXlsxFileBrowser2.default)(file).then(function (entries) {
    return (0, _readXlsxFileContents2.default)(entries, _xmlNode2.default, options);
  });
}
//# sourceMappingURL=readXlsxFileBrowser.js.map