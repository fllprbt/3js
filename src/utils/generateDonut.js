import * as THREE from "three";

export const generateDonut = () => {
  return new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4),
    new THREE.MeshNormalMaterial()
  );
};
