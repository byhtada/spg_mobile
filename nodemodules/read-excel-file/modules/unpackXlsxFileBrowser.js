import { loadAsync } from 'jszip';

/**
 * Reads XLSX file in a browser.
 * @param  {file} file - A file being uploaded in the browser.
 * @return {Promise} Resolves to an object holding XLSX file entries.
 */
export default function unpackXlsxFile(file) {
	var files = {};

	return loadAsync(file).then(function (zip) {
		var files = [];
		zip.forEach(function (relativePath, zipEntry) {
			if (!zipEntry.dir) {
				files.push(zipEntry.name);
			}
		});

		var entries = {};
		return Promise.all(files.map(function (file) {
			return zip.file(file).async('string').then(function (content) {
				return entries[file] = content;
			});
		})).then(function () {
			return entries;
		});
	});
}
//# sourceMappingURL=unpackXlsxFileBrowser.js.map