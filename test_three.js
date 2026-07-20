const THREE = require('three');
const v = new THREE.Vector3(1, 0, 0);
v.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
console.log(`x: ${Math.round(v.x)}, z: ${Math.round(v.z)}`);
