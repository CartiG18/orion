import fs from 'fs';
import https from 'https';

const URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';

https.get(URL, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const geojson = JSON.parse(data);
    const lines = [];

    for (const feature of geojson.features) {
      if (feature.geometry) {
        if (feature.geometry.type === 'Polygon') {
          for (const ring of feature.geometry.coordinates) {
            lines.push(ring);
          }
        } else if (feature.geometry.type === 'MultiPolygon') {
          for (const polygon of feature.geometry.coordinates) {
            for (const ring of polygon) {
              lines.push(ring);
            }
          }
        }
      }
    }

    let tsCode = `// Extracted from Natural Earth 110m land geojson\n`;
    tsCode += `export type Coordinate = [number, number]; // [longitude, latitude]\n`;
    tsCode += `export const continentOutlines: Coordinate[][] = [\n`;
    
    for (const ring of lines) {
      if (ring.length < 4) continue; 
      tsCode += `  [\n`;
      let currentLine = `    `;
      for (const [lon, lat] of ring) {
        const str = `[${lon.toFixed(2)}, ${lat.toFixed(2)}], `;
        if (currentLine.length + str.length > 100) {
          tsCode += currentLine + `\n`;
          currentLine = `    `;
        }
        currentLine += str;
      }
      tsCode += currentLine + `\n`;
      tsCode += `  ],\n`;
    }
    tsCode += `];\n`;

    fs.writeFileSync('src/data/continentOutlines.ts', tsCode);
    console.log('Saved land outlines to src/data/continentOutlines.ts');
  });
}).on('error', err => {
  console.error(err);
});
