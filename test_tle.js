const fs = require('fs');
fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle')
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split(/\r?\n/);
    console.log(`Fetched ${lines.length} lines`);
    console.log("First 6 lines:", lines.slice(0, 6));
    
    let count = 0;
    for (let i = 0; i < lines.length; i += 3) {
      const name = lines[i]?.trim();
      const line1 = lines[i + 1]?.trim();
      const line2 = lines[i + 2]?.trim();
      
      if (name && line1?.startsWith('1 ') && line2?.startsWith('2 ')) {
        count++;
      } else {
        console.log("Failed at index", i, {name, line1, line2});
      }
    }
    console.log(`Parsed ${count} valid satellites`);
  })
  .catch(console.error);
