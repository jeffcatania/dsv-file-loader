/*  dsv-loader: a dsv loader for webpack
    built using dsv by Mike Bostock */

var loaderUtils = require("loader-utils");

module.exports = function(text) {
  
  var dsv = {},
      query = loaderUtils.parseQuery(this.query),
      delimiter = query.delimiter || ',',
      reFormat = new RegExp("[\"" + delimiter + "\n]"),
      delimiterCode = delimiter.charCodeAt(0);

  dsv.parse = function(text, f) {
    var o;
    return dsv.parseRows(text, function(row, i) {
      if (o) return o(row, i - 1);
      var a = new Function("d", "return {" + row.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "]";
      }).join(",") + "}");
      o = f ? function(row, i) { return f(a(row), i); } : a;
    });
  };

  dsv.parseRows = function(text, f) {
    var EOL = {}, // sentinel value for end-of-line
        EOF = {}, // sentinel value for end-of-file
        rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // the current line number
        t, // the current token
        eol; // is the current token followed by EOL?

    function token() {
      if (I >= N) return EOF; // special case: end of file
      if (eol) return eol = false, EOL; // special case: end of line

      // special case: quotes
      var j = I;
      if (text.charCodeAt(j) === 34) {
        var i = j;
        while (i++ < N) {
          if (text.charCodeAt(i) === 34) {
            if (text.charCodeAt(i + 1) !== 34) break;
            ++i;
          }
        }
        I = i + 2;
        var c = text.charCodeAt(i + 1);
        if (c === 13) {
          eol = true;
          if (text.charCodeAt(i + 2) === 10) ++I;
        } else if (c === 10) {
          eol = true;
        }
        return text.slice(j + 1, i).replace(/""/g, "\"");
      }

      // common case: find next delimiter or newline
      while (I < N) {
        var c = text.charCodeAt(I++), k = 1;
        if (c === 10) eol = true; // \n
        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
        else if (c !== delimiterCode) continue;
        return text.slice(j, I - k);
      }

      // special case: last token before EOF
      return text.slice(j);
    }

    while ((t = token()) !== EOF) {
      var a = [];
      while (t !== EOL && t !== EOF) {
        a.push(t);
        t = token();
      }
      if (f && (a = f(a, n++)) == null) continue;
      rows.push(a);
    }

    return rows;
  };

  dsv.format = function(rows) {
    if (Array.isArray(rows[0])) return dsv.formatRows(rows); // deprecated; use formatRows
    var fieldSet = {}, fields = [];

    // Compute unique fields in order of discovery.
    rows.forEach(function(row) {
      for (var field in row) {
        if (!(field in fieldSet)) {
          fields.push(fieldSet[field] = field);
        }
      }
    });

    return [fields.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
      return fields.map(function(field) {
        return formatValue(row[field]);
      }).join(delimiter);
    })).join("\n");
  };

  dsv.formatRows = function(rows) {
    return rows.map(formatRow).join("\n");
  };

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return reFormat.test(text) ? "\"" + text.replace(/\"/g, "\"\"") + "\"" : text;
  }

  var res = dsv.parse(text);
  return "module.exports = " + JSON.stringify(res, undefined, "\t");
}