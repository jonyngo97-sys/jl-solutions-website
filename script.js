document.getElementById('year').textContent=new Date().getFullYear();
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
toggle?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const revealTargets=document.querySelectorAll('.cards article,.restaurant>div,.why>div,.steps article,.contact>div');
revealTargets.forEach(el=>el.classList.add('reveal'));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
revealTargets.forEach(el=>observer.observe(el));