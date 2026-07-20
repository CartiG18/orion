import { RotationAxis, Body } from 'astronomy-engine';

const date = new Date();
const axis = RotationAxis(Body.Earth, date);
console.log('Spin:', axis.spin);
console.log('North EQJ:', axis.north);
