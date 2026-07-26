const fs = require('fs');
fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0'
  }
})
  .then(res => res.text())
  .then(text => {
    console.log("Response text length:", text.length);
    console.log("First 100 chars:", text.substring(0, 100));
  })
  .catch(console.error);
