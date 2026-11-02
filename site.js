// Shared navigation on all public pages; dealership management stays under /portal/.
(() => {
  'use strict';
  const menu=document.getElementById('menu-button');
  const nav=document.getElementById('navigation');
  if(menu && nav){
    menu.addEventListener('click',()=>{const expanded=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(expanded));menu.setAttribute('aria-label',expanded?'Close navigation':'Open navigation');});
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}));
  }
  const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
  const path=window.location.pathname;
  for(const link of document.querySelectorAll('[data-nav]')){
    const u=new URL(link.getAttribute('href'),window.location.origin==='null'?'https://example.com':window.location.origin);
    const active=(path==='/' && u.pathname==='/' && !u.hash) || (path!=='/' && u.pathname===path && !u.hash);
    if(active){link.classList.add('active');link.setAttribute('aria-current','page');}
  }
})();
