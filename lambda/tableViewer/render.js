/*
The contents of this file are derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
*/
const stylesheet = require('./stylesheet');

module.exports = function(props) {
  const title = props.title;

  let items = props.items || [];


  const headers = collectHeaders()

  return `
  <!DOCTYPE html>
  <html>
  <head>
    ${ title ? `<title>${title}</title>` : '' }
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="10">
    <style>${stylesheet}</style>
  </head>
  <body>
    <div class="nice-table">
        ${ title ? `<div class="header">${title}</div>` : '' }
        <table cellspacing="0">
          <tr>${ renderHeaderRow() }</th>
          ${ items.map(item => renderItemRow(item)).join('\n') }
        </table>
    </div>
  </body>
  </html>
  `;

  function renderHeaderRow() {
    return `
    <tr>
      ${ headers.map(header => `<th>${header}</th>`).join('\n') }
    </tr>
    `;
  }

  function renderItemRow(item) {
    return `
    <tr>
      ${ headers.map(header => `<td>${renderAttribute(item, header)}</td>`).join('\n') }
    </tr>
    `
  }

  function renderAttribute(item, attribute) {
    return getAttribute(item, attribute).toString();
  }

  function getAttribute(item, attribute) {
    if (!(attribute in item)) {
      return '';
    }

    const type = Object.keys(item[attribute]);
    return item[attribute][type];
  }

  // iterate over all items and create a union of all keys for table headers
  function collectHeaders() {
    const headerSet = new Set();
    for (const item of items) {
      for (const key of Object.keys(item)) {
        headerSet.add(key);
      }
    }

    return Array.from(headerSet).sort();
  }

  function isNumber(v) {
    return (parseInt(v).toString() === v.toString());
  }
}
