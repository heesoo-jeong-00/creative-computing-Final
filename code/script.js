const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

let engine = Engine.create();
let { world } = engine;
let render = Render.create({
    element: document.body,
    engine: engine,
    canvas: document.getElementById("matter-canvas"),
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'white'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 10, {
    isStatic: true,
    render: {
        visible: false
    }
});
World.add(world, ground);

const colors = ['red', 'blue', 'yellow'];
let timerId = setInterval(() => {
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * window.innerWidth;
        const size = Math.random() * 6 + 5;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const shape = Bodies.circle(x, 0, size, {
            render: {
                fillStyle: randomColor,
                lineWidth: 0
            },
            restitution: 0.5
        });
        World.add(world, shape);
    }
}, 5);


setTimeout(() => {
    clearInterval(timerId);
}, 2600);

let magnetActive = false;
setTimeout(() => {
    magnetActive = true;
}, 3500);

let video;
let poseNet;
let poses = [];

function setup() {
    video = createCapture(VIDEO);
    video.id('video');
    video.size(window.innerWidth, window.innerHeight);

    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', function (results) {
        poses = results;
    });
}

function modelLoaded() {
    console.log('PoseNet Model Loaded');
}




const armKeyPoints = ['leftElbow', 'rightElbow', 'leftWrist', 'rightWrist'];
const bodyKeyPoints = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'];


let armPoints = [];
let bodyPoints = [];

Events.on(engine, 'afterUpdate', function () {
    if (!magnetActive || poses.length === 0) {
        return;
    }

    if (poses.length > 0) {

        armPoints = poses[0].pose.keypoints.filter(keypoint => armKeyPoints.includes(keypoint.part))
            .map(keypoint => {
                return { x: window.innerWidth - keypoint.position.x, y: keypoint.position.y };
            });


        bodyPoints = poses[0].pose.keypoints.filter(keypoint => bodyKeyPoints.includes(keypoint.part))
            .map(keypoint => {
                return { x: window.innerWidth - keypoint.position.x, y: keypoint.position.y };
            });
    }

    if (!magnetActive) {
        return;
    }


    const armBoundaryX = (armPoints[0].x + armPoints[1].x) / 2;


    if (bodyPoints.length > 0) {

        const shoulderCenterX = (bodyPoints[0].x + bodyPoints[1].x) / 2;
        const shoulderCenterY = (bodyPoints[0].y + bodyPoints[1].y) / 2;


        const shoulderDistance = Math.abs(bodyPoints[0].x - bodyPoints[1].x);

        const allBodies = Composite.allBodies(world);
        allBodies.forEach(function (body) {
            if (!body.isStatic) {
                const dx = shoulderCenterX - body.position.x;
                const dy = shoulderCenterY - body.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < shoulderDistance * 0.8) { 
                    const forceMagnitude = 5e-4;
                    const force = {
                        x: dx / distance * forceMagnitude,
                        y: dy / distance * forceMagnitude
                    };
                    Body.applyForce(body, body.position, force);
                }
            }
        });
    }


if (armPoints.length > 0) {
    const allBodies = Composite.allBodies(world);
    allBodies.forEach(function (body) {
        if (!body.isStatic) {
            armPoints.forEach(armPoint => {
                const dx = armPoint.x - body.position.x;
                const dy = armPoint.y - body.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) { 
                    const forceMagnitude = 6e-4; 
                    const force = {
                        x: dx / distance * forceMagnitude,
                        y: dy / distance * forceMagnitude
                    };
                    Body.applyForce(body, body.position, force);
                }
            });
        }
    });
}


});

window.addEventListener('resize', () => {
    Render.setPixelRatio(render, window.devicePixelRatio);
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
});