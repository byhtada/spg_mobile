var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import parseDate from './parseDate';
import Integer, { isInteger } from './types/Integer';
import URL, { isURL } from './types/URL';
import Email, { isEmail } from './types/Email';

var DEFAULT_OPTIONS = {
  isColumnOriented: false

  /**
   * Convert 2D array to nested objects.
   * If row oriented data, row 0 is dotted key names.
   * Column oriented data is transposed.
   * @param {string[][]} data - An array of rows, each row being an array of cells.
   * @param {object} schema
   * @return {object[]}
   */
};export default function (data, schema, options) {
  if (options) {
    options = _extends({}, DEFAULT_OPTIONS, options);
  } else {
    options = DEFAULT_OPTIONS;
  }

  var _options = options,
      isColumnOriented = _options.isColumnOriented,
      rowMap = _options.rowMap;


  validateSchema(schema);

  if (isColumnOriented) {
    data = transpose(data);
  }

  var columns = data[0];

  var results = [];
  var errors = [];

  for (var i = 1; i < data.length; i++) {
    var result = read(schema, data[i], i - 1, columns, errors, options);
    if (result) {
      results.push(result);
    }
  }

  // Correct error rows.
  if (rowMap) {
    for (var _iterator = errors, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var error = _ref;

      // Convert the `row` index in `data` to the
      // actual `row` index in the spreadsheet.
      // The `1` compensates for the header row.
      error.row = rowMap[error.row] + 1;
    }
  }

  return {
    rows: results,
    errors: errors
  };
}

function read(schema, row, rowIndex, columns, errors, options) {
  var object = {};

  var _loop = function _loop() {
    if (_isArray2) {
      if (_i2 >= _iterator2.length) return 'break';
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) return 'break';
      _ref2 = _i2.value;
    }

    var key = _ref2;

    var schemaEntry = schema[key];
    var isNestedSchema = _typeof(schemaEntry.type) === 'object' && !Array.isArray(schemaEntry.type);
    var rawValue = row[columns.indexOf(key)];
    if (rawValue === undefined) {
      rawValue = null;
    }
    var value = void 0;
    var error = void 0;
    if (isNestedSchema) {
      value = read(schemaEntry.type, row, rowIndex, columns, errors, options);
    } else {
      if (rawValue === null) {
        value = null;
      } else if (Array.isArray(schemaEntry.type)) {
        var notEmpty = false;
        var array = parseArray(rawValue).map(function (_value) {
          var result = parseValue(_value, schemaEntry, options);
          if (result.error) {
            value = _value;
            error = result.error;
          }
          if (result.value !== null) {
            notEmpty = true;
          }
          return result.value;
        });
        if (!error) {
          value = notEmpty ? array : null;
        }
      } else {
        var result = parseValue(rawValue, schemaEntry, options);
        error = result.error;
        value = error ? rawValue : result.value;
      }
    }
    if (!error && value === null && schemaEntry.required) {
      error = 'required';
    }
    if (error) {
      error = {
        error: error,
        row: rowIndex + 1,
        column: key,
        value: value
      };
      if (schemaEntry.type) {
        error.type = schemaEntry.type;
      }
      errors.push(error);
    } else if (value !== null) {
      object[schemaEntry.prop] = value;
    }
  };

  for (var _iterator2 = Object.keys(schema), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    var _ret = _loop();

    if (_ret === 'break') break;
  }
  if (Object.keys(object).length > 0) {
    return object;
  }
  return null;
}

/**
 * Converts textual value to a javascript typed value.
 * @param  {string} value
 * @param  {object} schemaEntry
 * @return {{ value: any, error: string }}
 */
export function parseValue(value, schemaEntry, options) {
  if (value === null) {
    return { value: null };
  }
  var result = void 0;
  if (schemaEntry.parse) {
    result = parseCustomValue(value, schemaEntry.parse);
  } else if (schemaEntry.type) {
    result = parseValueOfType(value, Array.isArray(schemaEntry.type) ? schemaEntry.type[0] : schemaEntry.type, options);
  } else {
    result = { value: value
      // throw new Error('Invalid schema entry: no .type and no .parse():\n\n' + JSON.stringify(schemaEntry, null, 2))
    };
  }
  // If errored then return the error.
  if (result.error) {
    return result;
  }
  if (result.value !== null) {
    if (schemaEntry.oneOf && schemaEntry.oneOf.indexOf(result.value) < 0) {
      return { error: 'invalid' };
    }
    if (schemaEntry.validate) {
      try {
        schemaEntry.validate(result.value);
      } catch (error) {
        return { error: error.message };
      }
    }
  }
  return result;
}

/**
 * Converts textual value to a custom value using supplied `.parse()`.
 * @param  {string} value
 * @param  {function} parse
 * @return {{ value: any, error: string }}
 */
function parseCustomValue(value, parse) {
  try {
    value = parse(value);
    if (value === undefined) {
      return { value: null };
    }
    return { value: value };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Converts textual value to a javascript typed value.
 * @param  {string} value
 * @param  {} type
 * @return {{ value: (string|number|Date|boolean), error: string }}
 */
function parseValueOfType(value, type, options) {
  switch (type) {
    case String:
      return { value: value };

    case Number:
    case Integer:
      // The global isFinite() function determines
      // whether the passed value is a finite number.
      // If  needed, the parameter is first converted to a number.
      if (!isFinite(value)) {
        return { error: 'invalid' };
      }
      if (type === Integer && !isInteger(value)) {
        return { error: 'invalid' };
      }
      // Convert strings to numbers.
      // Just an additional feature.
      // Won't happen when called from `readXlsx()`.
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      return { value: value };

    case URL:
      if (!isURL(value)) {
        return { error: 'invalid' };
      }
      return { value: value };

    case Email:
      if (!isEmail(value)) {
        return { error: 'invalid' };
      }
      return { value: value };

    case Date:
      // XLSX has no specific format for dates.
      // Sometimes a date can be heuristically detected.
      // https://github.com/catamphetamine/read-excel-file/issues/3#issuecomment-395770777
      if (value instanceof Date) {
        return { value: value };
      }
      if (typeof value === 'number') {
        if (!isFinite(value)) {
          return { error: 'invalid' };
        }
        value = parseInt(value);
        var date = parseDate(value, options.properties);
        if (!date) {
          return { error: 'invalid' };
        }
        return { value: date };
      }
      return { error: 'invalid' };

    case Boolean:
      if (typeof value === 'boolean') {
        return { value: value };
      }
      return { error: 'invalid' };

    default:
      if (typeof type === 'function') {
        return parseCustomValue(value, type);
      }
      throw new Error('Unknown schema type: ' + (type && type.name || type));
  }
}

export function getBlock(string, endCharacter, startIndex) {
  var i = 0;
  var substring = '';
  var character = void 0;
  while (startIndex + i < string.length) {
    var _character = string[startIndex + i];
    if (_character === endCharacter) {
      return [substring, i];
    } else if (_character === '"') {
      var block = getBlock(string, '"', startIndex + i + 1);
      substring += block[0];
      i += '"'.length + block[1] + '"'.length;
    } else {
      substring += _character;
      i++;
    }
  }
  return [substring, i];
}

export function parseArray(string) {
  var blocks = [];
  var index = 0;
  while (index < string.length) {
    var _getBlock = getBlock(string, ',', index),
        _getBlock2 = _slicedToArray(_getBlock, 2),
        substring = _getBlock2[0],
        length = _getBlock2[1];

    index += length + ','.length;
    blocks.push(substring.trim());
  }
  return blocks;
}

// Transpose a 2D array.
// https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
var transpose = function transpose(array) {
  return array[0].map(function (_, i) {
    return array.map(function (row) {
      return row[i];
    });
  });
};

function validateSchema(schema) {
  for (var _iterator3 = Object.keys(schema), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref3 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref3 = _i3.value;
    }

    var _key = _ref3;

    var entry = schema[_key];
    if (!entry.prop) {
      throw new Error('"prop" not defined for schema entry "' + _key + '".');
    }
  }
}
//# sourceMappingURL=convertToJson.js.map