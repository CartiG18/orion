// A static snapshot of 5 well-known satellites to guarantee the UI always has 
// something to render if CelesTrak is timing out or blocking the local IP.
export const TLE_FALLBACK = [
  {
    noradId: "25544",
    name: "ISS (ZARYA)",
    tleLine1: "1 25544U 98067A   23291.42688081  .00012571  00000-0  21389-3 0  9997",
    tleLine2: "2 25544  51.6409  48.9188 0003058 100.8655  63.8568 15.50090333420959"
  },
  {
    noradId: "20580",
    name: "HST (HUBBLE)",
    tleLine1: "1 20580U 90037B   23291.49204090  .00001402  00000-0  62483-4 0  9996",
    tleLine2: "2 20580  28.4693  87.2023 0002447 169.5786 160.0381 15.08866164627063"
  },
  {
    noradId: "44713",
    name: "STARLINK-1007",
    tleLine1: "1 44713U 19074A   23292.01509312  .00001742  00000-0  12275-3 0  9991",
    tleLine2: "2 44713  53.0538 127.4206 0001416 117.8443  63.5350 15.06409893222384"
  },
  {
    noradId: "00694",
    name: "ATLAS CENTAUR 2",
    tleLine1: "1 00694U 63047A   26206.16000034  .00000899  00000+0  94540-4 0  9990",
    tleLine2: "2 00694  30.3546 147.0219 0545712 212.4176 144.1759 14.12576383151078"
  },
  {
    noradId: "00733",
    name: "THOR AGENA D R/B",
    tleLine1: "1 00733U 64002A   26206.53087013  .00000181  00000+0  81895-4 0  9992",
    tleLine2: "2 00733  99.1156 227.3310 0032201 215.6610 144.2422 14.34079686258050"
  }
];
