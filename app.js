const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const nano = new NanoEffect(canvas);

const TEXT_DELAY = 500;
const TEXT_COUNT = 250;

let explodeTime = null;
let letterMode = false;
let textIndex = 0;

const WORDS = ["LOVE YOU", "MISS YOU"];

const letterContent = `
Ờ thì chả biết viết gì nhiều đâu 

Valungtung đ có ny nên ở nhà
`;

function drawTextParticle(ctx, x, y, scale, index){
    const size = Math.max(4, scale * 10);
    const alpha = Math.min(1, Math.max(0.2, scale));

    ctx.save();
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255,80,200,${alpha})`;
    ctx.shadowColor = "rgba(255,80,200,0.8)";
    ctx.shadowBlur = 10 * scale;
    ctx.fillText(WORDS[index % WORDS.length], x, y);
    ctx.restore();
}

const originalToggle = nano.toggle.bind(nano);

nano.toggle = () => {

    if(letterMode) return;

    originalToggle();

    if(nano.state === "explode"){
        explodeTime = performance.now();

        setTimeout(()=>{
            showLetter();
        },400);
    }
};

function showLetter(){
    letterMode = true;
    const section = document.getElementById("letterSection");

    section.style.display = "flex";

    requestAnimationFrame(()=>{
        section.classList.add("active");
    });
}

function hideLetter(){
    const section = document.getElementById("letterSection");

    section.classList.remove("active");

    setTimeout(()=>{
        section.style.display = "none";
        letterMode = false;
    },2000);
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const cx = canvas.width/2;
    const cy = canvas.height/2;
    const now = performance.now();

    textIndex = 0;

    for(let p of nano.particles){

        p.update(nano.state);

        const depth = 900;
        const scale = depth/(depth+p.z);
        if(scale<=0) continue;

        const x2d = cx + p.x*scale;
        const y2d = cy + p.y*scale;

        const canShowText =
            nano.state==="explode" &&
            explodeTime &&
            now-explodeTime>TEXT_DELAY &&
            textIndex<TEXT_COUNT;

        if(canShowText){
            drawTextParticle(ctx,x2d,y2d,scale,textIndex);
            textIndex++;
        }else{
            p.draw(ctx,cx,cy);
        }
    }

    requestAnimationFrame(animate);
}

animate();

document.addEventListener("DOMContentLoaded",()=>{

    const envelope = document.getElementById("envelope");
    const btn = document.getElementById("toggleBtn");
    const textDiv = document.getElementById("text");
    const orbit = document.getElementById("orbit");
    const section = document.getElementById("letterSection");

    let isOpen = false;
    let typingTimeout = null;

    function typeWriter(text,i=0){
        if(!isOpen) return;

        if(i<text.length){
            textDiv.innerHTML += text.charAt(i);
            typingTimeout = setTimeout(()=>{
                typeWriter(text,i+1);
            },20);
        }
    }

    function resetTyping(){
        clearTimeout(typingTimeout);
        textDiv.innerHTML="";
    }

    btn.addEventListener("click",()=>{

        if(!letterMode) return;

        if(!isOpen){
            isOpen=true;
            envelope.classList.add("open");
            btn.textContent="Close";
            orbit.style.animation="none";
            resetTyping();

            setTimeout(()=>{
                typeWriter(letterContent);
            },300);

        }else{
            isOpen=false;
            envelope.classList.remove("open");
            btn.textContent="Open";
            orbit.style.animation="spin3D 8s linear infinite";
            resetTyping();

            setTimeout(()=>{
                section.classList.remove("active");
            },200);

            setTimeout(()=>{
                section.style.display="none";
                letterMode=false;
            },2000);
        }
    });

});
