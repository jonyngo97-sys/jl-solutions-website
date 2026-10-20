document.getElementById('year').textContent=new Date().getFullYear();
const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
const menuLabels=({de:['Menü öffnen','Menü schließen'],en:['Open menu','Close menu'],vi:['Mở menu','Đóng menu']})[document.documentElement.lang]||['Open menu','Close menu'];
const setMenu=open=>{nav?.classList.toggle('open',open);toggle?.setAttribute('aria-expanded',String(open));toggle?.setAttribute('aria-label',menuLabels[open?1:0])};
setMenu(false);
toggle?.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
window.addEventListener('resize',()=>{if(window.innerWidth>1000)setMenu(false)});
// Native contact links remain usable if the chat has not loaded.
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-enquiry]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(!document.getElementById('jl-contact-chat'))return;
  event.preventDefault();
  document.dispatchEvent(new CustomEvent('jl:enquiry',{detail:{service:link.dataset.enquiry}}));
});
const revealTargets=document.querySelectorAll('.cards article,.restaurant>div,.why>div,.steps article,.contact>div');
revealTargets.forEach(el=>el.classList.add('reveal'));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
revealTargets.forEach(el=>observer.observe(el));

(()=>{const slider=document.querySelector("[data-material-slider]");if(!slider)return;const slides=[...slider.querySelectorAll(".material-slide")],dots=[...slider.querySelectorAll("[data-slide-to]")];let current=0,timer;const show=i=>{current=(i+slides.length)%slides.length;slides.forEach((slide,n)=>{const active=n===current;slide.classList.toggle("active",active);slide.setAttribute("aria-hidden",String(!active))});dots.forEach((dot,n)=>{const active=n===current;dot.classList.toggle("active",active);dot.setAttribute("aria-selected",String(active))})};const start=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5500)};slider.querySelector(".slider-prev").addEventListener("click",()=>{show(current-1);start()});slider.querySelector(".slider-next").addEventListener("click",()=>{show(current+1);start()});dots.forEach(dot=>dot.addEventListener("click",()=>{show(Number(dot.dataset.slideTo));start()}));slider.addEventListener("mouseenter",()=>clearInterval(timer));slider.addEventListener("mouseleave",start);slider.addEventListener("focusin",()=>clearInterval(timer));slider.addEventListener("focusout",start);show(0);start()})();
