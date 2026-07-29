import fs from 'fs';
import https from 'https';

const URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

https.get(URL, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const geojson = JSON.parse(data);
    const lines = [];

    // Extract all polygons and multipolygons
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

    // lines is an array of arrays of [lon, lat]
    // Write out a TypeScript file
    let tsCode = `// Extracted from world geojson\n`;
    tsCode += `export type Coordinate = [number, number]; // [longitude, latitude]\n`;
    tsCode += `export const continentOutlines: Coordinate[][] = [\n`;
    
    // We can simplify/round to 2 decimals to save space
    for (const ring of lines) {
      if (ring.length < 5) continue; // skip tiny islands
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
    console.log('Saved to src/data/continentOutlines.ts');
  });
}).on('error', err => {
  console.error(err);
});
