import * as THREE from "three";
import { getNormalRandom } from "./getNormalRandom";

const material = new THREE.MeshBasicMaterial();
const geometry = new THREE.SphereGeometry(0.2, 16, 16);

export const generateSpheres = (count, texture) => {
  return Array.from({
    length: count,
  }).reduce(
    (acc) => {
      const sphere = new THREE.Mesh(geometry, material.clone());
      sphere.material.map = texture;
      acc.spheres.push(sphere);

      const sphereOffset = [
        getNormalRandom(),
        getNormalRandom(),
        getNormalRandom(),
      ];
      acc.offsets.push(sphereOffset);
      return acc;
    },
    { spheres: [], offsets: [] }
  );
};
