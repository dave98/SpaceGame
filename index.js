const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;  
canvas.height = window.innerHeight;

const xMid = canvas.width/2;
const yMid = canvas.height/2;
const friction = 0.985;
const score = document.querySelector('#score')
const startGameBtn = document.querySelector('#startGameBtn')
const modalUi = document.querySelector('#modalUi')
const bigScore = document.querySelector('#bigScore')

let animationId;
let tScore = 0;
let nTry = 0;

class Player {
    constructor(x, y, radius, color){ // Called each time player is setted.
        this.xCoord = x;    
        this.yCoord = y;
        this.radius = radius;
        this.color = color; 
    }

    draw(){
        ctx.beginPath()
        ctx.arc(    this.xCoord,
                    this.yCoord,
                    this.radius, 
                    0, 
                    Math.PI * 2,
                    false );
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity){
        this.xCoord = x;
        this.yCoord = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(    this.xCoord,
                    this.yCoord,
                    this.radius, 
                    0, 
                    Math.PI * 2,
                    false );
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    // Actual and what we expect in next screen.
    update(){   
        this.draw();
        this.xCoord += this.velocity.x;
        this.yCoord += this.velocity.y
    }

}

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.xCoord = x;
        this.yCoord = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(    this.xCoord,
                    this.yCoord,
                    this.radius, 
                    0, 
                    Math.PI * 2,
                    false );
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    // Actual and what we expect in next screen.
    update(){   
        this.draw();
        this.xCoord += this.velocity.x;
        this.yCoord += this.velocity.y
    }

}

class Particle {
    constructor(x, y, radius, color, velocity){
        this.xCoord = x;
        this.yCoord = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha;
        ctx.beginPath()
        ctx.arc(    this.xCoord,
                    this.yCoord,
                    this.radius, 
                    0, 
                    Math.PI * 2,
                    false );
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    // Actual and what we expect in next screen.
    update(){   
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.xCoord += this.velocity.x;
        this.yCoord += this.velocity.y;
        this.alpha -= 0.01;
    }

}

function reset(projectiles, enemies, particles){
    projectiles.length = 0;
    enemies.length = 0;
    particles.length = 0;
    tScore = 0;
    score.innerHTML = tScore;
}

function animate(player, projectiles, enemies, particles){
    
    animationId = window.requestAnimationFrame(() => {animate(player, projectiles, enemies, particles)})
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    player.draw();
    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Removing projectiles out of screen
        if( projectile.xCoord + projectile.radius < 0 || 
            projectile.xCoord - projectile.radius > canvas.width ||
            projectile.yCoord + projectile.radius < 0 ||
            projectile.yCoord - projectile.radius > canvas.height){ 
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    }) 

    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        
        const distToPlayer = Math.hypot( player.xCoord - enemy.xCoord, 
                                         player.yCoord - enemy.yCoord ) // Hypot: Distance between two points.
        if(distToPlayer - enemy.radius - player.radius <= 0){
            window.cancelAnimationFrame(animationId);
            bigScore.innerHTML = tScore;
            nTry += 1;
            modalUi.style.display = 'flex';
        }

        // Testing collitions between enemies and projectiles
        projectiles.forEach((projectile, pIndex) => {
            const dist = Math.hypot( projectile.xCoord - enemy.xCoord, 
                                     projectile.yCoord - enemy.yCoord ) // Hypot: Distance between two points.
            if( dist - enemy.radius - projectile.radius <= 0){

                // Defining explosions
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.xCoord, projectile.yCoord, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * Math.random() *6, 
                                                                                                                        y: (Math.random() - 0.5) * Math.random() *6 }))
                }

                if(enemy.radius - 10 > 5){ // Defining a minimun size.
                    // Increasing score
                    tScore += 100;
                    score.innerHTML = tScore;
                    //enemy.radius -= 10
                    gsap.to(enemy, {
                        radius: enemy.radius - 5
                    })
                    setTimeout(() => {
                        projectiles.splice(pIndex, 1);
                    }, 0)
                }else{
                    // Increasing score
                    tScore += 250;
                    score.innerHTML = tScore;
                    
                    setTimeout(() => {
                        enemies.splice(eIndex, 1)
                        projectiles.splice(pIndex, 1);
                    }, 0)
                }

            }
        });
    })

    particles.forEach((particle, pIndex) => {
        if(particle.alpha <= 0){
            particles.splice(pIndex, 1)
        }else{
            particle.update();
        }
    })

}

function spawnEnemies(enemies){
    setInterval(() => {
        const radius = Math.random() * (30 - 10) + 10;
        let xPos;
        let yPos;
        if(Math.random() < 0.5){
            xPos = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            yPos = Math.random() * canvas.height;
        }else{
            xPos = Math.random() * canvas.width;
            yPos = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(yMid - yPos, xMid - xPos);
        const localVelocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        enemies.push(new Enemy(xPos, yPos, radius, color, localVelocity))
 
    }, 1000)
}


/// Functional code start here < ------
let player = new Player(xMid, yMid, 20, 'white')
let projectiles = [];
let enemies = [];
let particles = []
animate(player, projectiles, enemies, particles);

/// Event listeners (always awake) < -------
startGameBtn.addEventListener('click', () => {
    if(nTry > 0){ // RestartCondition
        reset(projectiles, enemies, particles)
        animate(player, projectiles, enemies, particles);    
    }
    spawnEnemies(enemies);    
    modalUi.style.display = 'none';
})

window.addEventListener('click', (event) => {   
    const angle = Math.atan2(event.clientY - yMid, event.clientX - xMid);
    const localVelocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6,
    }
    projectiles.push( new Projectile(xMid, yMid, 5, 'white', {x: localVelocity.x, y:localVelocity.y}) )
})

