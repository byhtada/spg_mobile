'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unpackXlsxFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _unzipper = require('unzipper');

var _unzipper2 = _interopRequireDefault(_unzipper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reads XLSX file in Node.js.
 * @param  {(string|Stream)} input - A Node.js readable stream or a path to a file.
 * @return {Promise} Resolves to an object holding XLSX file entries.
 */
function unpackXlsxFile(input) {
  // XLSX file is a zip archive.
  // The `entries` object stores the files
  // and their contents from this XLSX zip archive.
  var entries = {};

  var stream = input instanceof _stream2.default ? input : _fs2.default.createReadStream(input);

  return new Promise(function (resolve, reject) {
    var entryPromises = [];

    stream
    // This first "error" listener is for the original stream errors.
    .on('error', reject).pipe(_unzipper2.default.Parse())
    // This second "error" listener is for the unzip stream errors.
    .on('error', reject).on('close', function () {
      return Promise.all(entryPromises).then(function () {
        return resolve(entries);
      });
    }).on('entry', function (entry) {
      var contents = '';
      // To ignore an entry: `entry.autodrain()`.
      entryPromises.push(new Promise(function (resolve) {
        entry.on('data', function (data) {
          return contents += data.toString();
        }).on('end', function () {
          return resolve(entries[entry.path] = contents);
        });
      }));
    });
  });
}
//# sourceMappingURL=unpackXlsxFileNode.js.map