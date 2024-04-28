const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereBufferGeometry(5, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); 
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const hairGeometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];
const sphereVertices = geometry.attributes.position.array;
const vertices = []; 

for (let i = 0; i < sphereVertices.length; i += 3) {
    vertices.push(new THREE.Vector3(sphereVertices[i], sphereVertices[i + 1], sphereVertices[i + 2]));
}

for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];

    for (let j = 0; j < 200; j++) { 
        const startX = vertex.x;
        const startY = vertex.y;
        const startZ = vertex.z;

        const endX = startX + (Math.random() - 0.5) * 1.9; 
        const endY = startY + (Math.random() - 0.5) * 1.9;
        const endZ = startZ + (Math.random() - 0.5) * 1.9;

        positions.push(startX, startY, startZ);
        positions.push(endX, endY, endZ);

        const pink = new THREE.Color(1.0, 0.4, 0.7);
        const orange = new THREE.Color(1.0, 0.6, 0.2);
        const purple = new THREE.Color(0.6, 0.2, 0.8);
        const mixColor = new THREE.Color().lerpColors(pink, orange, Math.random()); 
        const finalColor = new THREE.Color().lerpColors(mixColor, purple, Math.random());
        colors.push(finalColor.r, finalColor.g, finalColor.b, finalColor.r, finalColor.g, finalColor.b);
    }
}

hairGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
hairGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
const hairMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
const hairMesh = new THREE.LineSegments(hairGeometry, hairMaterial);
sphere.add(hairMesh);


camera.position.z = 15;


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);


renderer.physicallyCorrectLights = true;

let mouseX = 0;
let mouseY = 0;
let spherePrevPosition = new THREE.Vector3(); 
let mouseMoved = false; 


document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseMoved = true;
});

function animate() {
    requestAnimationFrame(animate);


    if (mouseMoved) {
        const targetRotationX = mouseX * Math.PI;
        const targetRotationY = mouseY * Math.PI;
        camera.position.x += (targetRotationX - camera.position.x) * 0.05;
        camera.position.y += (targetRotationY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        mouseMoved = false;
    }

    const sphereCurrentPosition = sphere.position.clone();
    const sphereDirection = sphereCurrentPosition.clone().sub(spherePrevPosition); 
    hairMesh.position.add(sphereDirection); 


    hairMesh.rotation.x += 0.01;
    hairMesh.rotation.y += 0.01;

    spherePrevPosition.copy(sphereCurrentPosition); 

    renderer.render(scene, camera);
}
animate();
