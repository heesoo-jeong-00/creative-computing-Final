// 씬, 카메라, 렌더러 생성
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 스피어 생성
const geometry = new THREE.SphereBufferGeometry(5, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // 노란색 스피어
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 털 생성
const hairGeometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];
const sphereVertices = geometry.attributes.position.array;
const vertices = []; // 스피어의 정점 좌표를 저장할 배열 추가

for (let i = 0; i < sphereVertices.length; i += 3) {
    vertices.push(new THREE.Vector3(sphereVertices[i], sphereVertices[i + 1], sphereVertices[i + 2]));
}

for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];

    for (let j = 0; j < 200; j++) { // 각 정점에 대해 여러 개의 털을 생성
        // 털의 시작점을 스피어의 정점에 붙이도록 수정
        const startX = vertex.x;
        const startY = vertex.y;
        const startZ = vertex.z;

        const endX = startX + (Math.random() - 0.5) * 1.9; // 털의 길이를 늘리기 위해 값을 증가시킴
        const endY = startY + (Math.random() - 0.5) * 1.9;
        const endZ = startZ + (Math.random() - 0.5) * 1.9;

        positions.push(startX, startY, startZ);
        positions.push(endX, endY, endZ);

        // 핑크와 주황 사이의 무작위 색상 선택
        const pink = new THREE.Color(1.0, 0.4, 0.7);
        const orange = new THREE.Color(1.0, 0.6, 0.2);
        const purple = new THREE.Color(0.6, 0.2, 0.8); // 보라색
        const mixColor = new THREE.Color().lerpColors(pink, orange, Math.random()); // 핑크와 주황 사이의 색상
        const finalColor = new THREE.Color().lerpColors(mixColor, purple, Math.random()); // 보라색과 랜덤 색상 사이의 색상
        colors.push(finalColor.r, finalColor.g, finalColor.b, finalColor.r, finalColor.g, finalColor.b); // 시작점과 끝점의 색상을 동일하게 설정
    }
}

hairGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
hairGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
const hairMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
const hairMesh = new THREE.LineSegments(hairGeometry, hairMaterial);
sphere.add(hairMesh);

// 카메라 설정
camera.position.z = 15;

// 조명 설정
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

// 물리적으로 정확한 조명 활성화
renderer.physicallyCorrectLights = true;

let mouseX = 0;
let mouseY = 0;
let spherePrevPosition = new THREE.Vector3(); // 이전 프레임의 스피어 위치를 저장할 변수 추가
let mouseMoved = false; // 마우스 움직임 여부를 나타내는 변수 추가

// 마우스 이벤트 리스너 추가
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseMoved = true; // 마우스 움직임 감지
});

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    // 마우스 움직임이 감지된 경우에만 카메라 이동
    if (mouseMoved) {
        const targetRotationX = mouseX * Math.PI;
        const targetRotationY = mouseY * Math.PI;
        camera.position.x += (targetRotationX - camera.position.x) * 0.05;
        camera.position.y += (targetRotationY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        mouseMoved = false; // 마우스 움직임 상태 초기화
    }

    // 털이 스피어와 함께 움직이도록 조정
    const sphereCurrentPosition = sphere.position.clone();
    const sphereDirection = sphereCurrentPosition.clone().sub(spherePrevPosition); // 스피어의 이동 방향 벡터 계산
    hairMesh.position.add(sphereDirection); // 털 메시 위치를 스피어의 이동 방향에 따라 조정

    // 털의 움직임을 시뮬레이션하기 위해 털을 무작위로 변형합니다.
    hairMesh.rotation.x += 0.01;
    hairMesh.rotation.y += 0.01;

    spherePrevPosition.copy(sphereCurrentPosition); // 현재 스피어 위치를 저장하여 다음 프레임에 사용

    renderer.render(scene, camera);
}
animate();
