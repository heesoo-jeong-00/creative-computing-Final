const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint, Composite } = Matter;

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
    poseNet.on('pose', function(results) {
        poses = results;
    });
}

function modelLoaded() {
    console.log('PoseNet Model Loaded');
}

Events.on(engine, 'afterUpdate', function() {
    if (!magnetActive || poses.length === 0) {
        return;
    }

    let bodyPosition = poses[0].pose.keypoints.reduce((bodyPosition, keypoint) => {
        if (keypoint.score > 0.2) {  // Consider keypoints with a minimum confidence
            bodyPosition.x += (window.innerWidth - keypoint.position.x); // 좌우 반전 좌표 계산
            bodyPosition.y += keypoint.position.y;
            bodyPosition.count++;
        }
        return bodyPosition;
    }, {x: 0, y: 0, count: 0});

    if (bodyPosition.count === 0) return;

    bodyPosition.x /= bodyPosition.count;
    bodyPosition.y /= bodyPosition.count;

    const allBodies = Composite.allBodies(world);
    allBodies.forEach(function(body) {
        if (!body.isStatic) {
            const dx = bodyPosition.x - body.position.x;
            const dy = bodyPosition.y - body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceMagnitude = 3e-4; 
            const force = {
                x: dx / distance * forceMagnitude,
                y: dy / distance * forceMagnitude
            };
            Body.applyForce(body, body.position, force);
        }
    });
});

window.addEventListener('resize', () => {
    Render.setPixelRatio(render, window.devicePixelRatio);
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
});
