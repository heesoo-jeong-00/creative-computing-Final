const { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint, Composite } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
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

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

let mouseInCanvas = true;
render.canvas.addEventListener('mouseleave', function() {
    mouseInCanvas = false;
});
render.canvas.addEventListener('mouseenter', function() {
    mouseInCanvas = true;
});

let magnetActive = false; 
setTimeout(() => {
    magnetActive = true; 
}, 3500);

Events.on(engine, 'afterUpdate', function() {
    if (!mouseInCanvas || !magnetActive) {
        return;
    }

    const mousePosition = mouse.position;
    const allBodies = Composite.allBodies(engine.world);
    allBodies.forEach(function(body) {
        if (!body.isStatic && mouseConstraint.mouse.button === -1) {
            const dx = mousePosition.x - body.position.x;
            const dy = mousePosition.y - body.position.y;
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


