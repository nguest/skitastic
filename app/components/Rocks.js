import * as THREE from 'three';
import * as WHS from 'whs';

const Rocks = (app) => {
  const s = 5;
  const rock = new WHS.Importer({
    loader: new THREE.JSONLoader(),
    url: './assets/rockyOutcrop.json',  
    position: [-450,-530,-1500],
    rotation: [-Math.PI/9, Math.PI/2,0],
    scale: [s,s,s]
  }).addTo(app);

  
  return rock;
};
  

export default Rocks;