const satellite = require('satellite.js');

const tleLine1 = '1 25544U 98067A   26201.79846070  .00005574  00000+0  10900-3 0  9995';
const tleLine2 = '2 25544  51.6312 133.7599 0006835 319.3995  40.6483 15.49066413576965';

const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
console.log('satrec error:', satrec.error);

const positionAndVelocity = satellite.propagate(satrec, new Date());
console.log('position:', positionAndVelocity.position);
