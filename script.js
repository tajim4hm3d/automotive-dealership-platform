// NORTHSTAR MOTORS — fictional portfolio stock demonstration.
// The data in stock-seed.js is invented for this demo.
// No real dealership photos, adverts, records or live data connections are included.
let cars = [];

// WEBSITE INTERACTIONS — No coding changes required below when editing vehicle information.
const $ = id => document.getElementById(id);
const gbp = n => n == null ? 'Enquire for price' : new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const int = n => new Intl.NumberFormat('en-GB').format(n);
const html = s => String(s == null ? '' : s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const photosOf = c => (Array.isArray(c.photos) && c.photos.length ? c.photos : (c.photo ? [c.photo] : [])).map(src => typeof src === 'string' && src.startsWith('assets/') ? '/' + src : src);
const makeFilter = $('filter-make');
const grid = $('car-grid');
function refreshMakeFilter() {
  const selected=makeFilter.value;
  makeFilter.innerHTML='<option value="">Any make</option>';
  [...new Set(cars.map(c=>c.make).filter(Boolean))].sort().forEach(make => {
    const option=document.createElement('option');option.value=make;option.textContent=make;makeFilter.appendChild(option);
  });
  makeFilter.value=selected;
}
function filteredCars() {
  const price=Number($('filter-price').value||0);
  const gearbox=$('filter-gearbox').value;
  const status=$('filter-status').value;
  const make=makeFilter.value;
  const items=cars.filter(c=>c.status!=='draft'&&(!make||c.make===make)&&(!price||(c.price!=null&&c.price<=price))&&(!gearbox||c.gearbox===gearbox)&&(!status||((c.status||'available')===status)));
  const sort=$('sort').value;
  const compareNames=new Intl.Collator('en-GB',{sensitivity:'base',numeric:true});
  if(sort==='alpha-asc')items.sort((a,b)=>compareNames.compare(`${a.make||''} ${a.model||''} ${a.trim||''}`,`${b.make||''} ${b.model||''} ${b.trim||''}`));
  if(sort==='alpha-desc')items.sort((a,b)=>compareNames.compare(`${b.make||''} ${b.model||''} ${b.trim||''}`,`${a.make||''} ${a.model||''} ${a.trim||''}`));
  // Unknown prices sort last, in either price direction.
  if(sort==='price-low')items.sort((a,b)=>(a.price==null)-(b.price==null) || a.price-b.price);
  if(sort==='price-high')items.sort((a,b)=>(a.price==null)-(b.price==null) || b.price-a.price);
  if(sort==='year')items.sort((a,b)=>(b.year??0)-(a.year??0));
  if(sort==='mileage')items.sort((a,b)=>a.mileage-b.mileage);
  return items;
}
function photoPlaceholder(c, detail=false) {
  return `<div class="vehicle-placeholder${detail?' vehicle-placeholder-large':''}" role="img" aria-label="Photographs not yet added for ${html(c.make+' '+c.model)}"><div class="placeholder-symbol">${html(c.make)}</div><strong>${html(c.model)}</strong><small>${detail?'Demo vehicle — no real photographs':'PHOTOS TO BE ADDED'}</small></div>`;
}
function renderCars() {
  const items=filteredCars();
  $('vehicle-count').textContent=items.length;
  $('no-results').hidden=items.length>0;
  grid.innerHTML=items.map(c=>{
    const photos=photosOf(c);
    const visual=photos.length ? `<img class="car-photo" src="${html(photos[0])}" alt="${html(c.make+' '+c.model)}" loading="lazy">` : photoPlaceholder(c);
    const sold=(c.status==='sold');
    return `<article class="car-card ${sold?'car-card-sold':''}"><button class="car-card-activate" data-car="${c.id}" type="button" aria-haspopup="dialog" aria-label="View details for ${html(c.make+' '+c.model)}"><div class="car-photo-wrap">${visual}${sold?'<span class="car-sold-stamp" aria-label="This vehicle has been sold">SOLD</span>':''}${c.isDemo?'<span class="car-flag">EXAMPLE VEHICLE</span>':''}</div><div class="car-body"><div class="car-title-row"><h3>${html(c.make+' '+c.model)}</h3><div class="price ${c.price==null?'price-tbc':''}">${c.status==='sold'?'SOLD':gbp(c.price)}</div></div><p class="car-sub">${html(c.trim)}${c.colour?`<br><strong>${html(c.colour)}</strong>`:''}</p><div class="car-specs"><span><i></i>${c.year??'Year TBC'}</span><span><i></i>${c.mileage!=null?int(c.mileage)+' miles':'Mileage TBC'}</span><span><i></i>${html(c.gearbox)}</span></div><div class="car-actions"><span class="details-link">View details <span aria-hidden="true">↗</span></span></div></div></button></article>`;
  }).join('');
}
function reset() {$('filter-status').value='';makeFilter.value='';$('filter-price').value='';$('filter-gearbox').value='';$('sort').value='featured';renderCars();}
$('filter-form').addEventListener('submit',e=>{e.preventDefault();renderCars();$('car-grid').scrollIntoView({behavior:'smooth',block:'start'});});
$('sort').addEventListener('change',renderCars);
$('reset-filters').addEventListener('click',reset);
$('no-results-reset').addEventListener('click',reset);

const modal=$('car-modal');
let previousFocus=null;
let openedCar=null;
let currentGalleryIndex=0;
function galleryMarkup(c) {
  const photos=photosOf(c);
  if(!photos.length)return photoPlaceholder(c,true);
  return `<div class="vehicle-gallery"><div class="gallery-main"><img id="gallery-main-image" alt="${html(c.make+' '+c.model)} photograph 1 of ${photos.length}" src="${html(photos[0])}"><div class="gallery-counter" id="gallery-counter">1 / ${photos.length}</div>${photos.length>1?'<button class="gallery-arrow gallery-prev" type="button" aria-label="Previous photo" data-gallery-step="-1">‹</button><button class="gallery-arrow gallery-next" type="button" aria-label="Next photo" data-gallery-step="1">›</button>':''}</div>${photos.length>1?`<div class="gallery-thumbs" aria-label="Choose a vehicle photograph">${photos.map((src,i)=>`<button type="button" class="gallery-thumb ${i===0?'active':''}" data-gallery-index="${i}" aria-label="Show photo ${i+1}" aria-pressed="${i===0}"><img alt="" src="${html(src)}" loading="lazy"></button>`).join('')}</div>`:''}</div>`;
}
function spec(label,value){return `<div><span>${html(label)}</span><strong>${html(value)}</strong></div>`;}
function listSection(label,items){return Array.isArray(items)&&items.length?`<section class="vehicle-info-section"><h3>${html(label)}</h3><ul>${items.map(x=>`<li>${html(x)}</li>`).join('')}</ul></section>`:'';}
function openCar(id) {
  const c=cars.find(c=>c.id===id);if(!c)return;
  previousFocus=document.activeElement;openedCar=c;currentGalleryIndex=0;
  const title=c.make+' '+c.model;
  const specs=[['Year',c.year??'To confirm'],['Mileage',c.mileage!=null?int(c.mileage)+' miles':'To confirm'],['Fuel',c.fuel],['Gearbox',c.gearbox],...(c.colour?[['Colour',c.colour]]:[]),...(c.power?[['Power',c.power]]:[])];
  $('modal-content').innerHTML=`${galleryMarkup(c)}<div class="modal-body"><div class="modal-kicker">${c.isDemo?'EXAMPLE VEHICLE':'VEHICLE DETAILS'}</div><h2 id="modal-title">${html(title)}</h2><p class="modal-subtitle">${html(c.trim)}</p><div class="modal-price">${c.status==='sold'?'<span class="modal-sold-status">SOLD</span> · '+gbp(c.price):gbp(c.price)}</div><div class="modal-spec-grid">${specs.map(([label,value])=>spec(label,value)).join('')}</div>${c.description?`<section class="vehicle-info-section"><h3>Vehicle overview</h3><p>${html(c.description)}</p></section>`:''}${listSection('Vehicle history & documentation',c.history)}${listSection('Factory specification & features',c.features)}${c.sourceUrl?`<p class="source-link"><a href="${html(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">View original advert ↗</a></p>`:''}${c.isDemo?'<p class="modal-disclaimer">Example vehicle for design preview only.</p>':''}<button class="btn btn-black" type="button" id="modal-enquire">${c.status==='sold'?'Enquire about similar cars':c.isDemo?'Enquire about a similar car':'Enquire about this car'} ↗</button></div>`;
  modal.hidden=false;document.body.style.overflow='hidden';$('modal-close').focus();
  $('modal-enquire').addEventListener('click',()=>{
    const interest=c.status==='sold'||c.isDemo?'Finding a vehicle':'Vehicle enquiry';
    const vehicle=[c.year,title,c.colour||c.trim].filter(Boolean).join(' ');
    window.location.href='/contact/?interest='+encodeURIComponent(interest)+'&vehicle='+encodeURIComponent(vehicle);
  });
}
function changeGallery(index){
  if(!openedCar)return;
  const photos=photosOf(openedCar);
  if(photos.length<2)return;
  currentGalleryIndex=(index+photos.length)%photos.length;
  const image=$('gallery-main-image');
  if(image){image.src=photos[currentGalleryIndex];image.alt=`${openedCar.make} ${openedCar.model} photograph ${currentGalleryIndex+1} of ${photos.length}`;}
  const counter=$('gallery-counter');if(counter)counter.textContent=`${currentGalleryIndex+1} / ${photos.length}`;
  modal.querySelectorAll('.gallery-thumb').forEach((button,i)=>{button.classList.toggle('active',i===currentGalleryIndex);button.setAttribute('aria-pressed',String(i===currentGalleryIndex));});
}
function closeCar(){modal.hidden=true;document.body.style.overflow='';openedCar=null;if(previousFocus&&previousFocus.focus)previousFocus.focus();}
grid.addEventListener('click',e=>{const b=e.target.closest('[data-car]');if(b)openCar(Number(b.dataset.car));});
$('modal-close').addEventListener('click',closeCar);
modal.addEventListener('click',e=>{if(e.target.dataset.close)closeCar();});
$('modal-content').addEventListener('click',e=>{
  const thumb=e.target.closest('[data-gallery-index]');
  const arrow=e.target.closest('[data-gallery-step]');
  if(thumb)changeGallery(Number(thumb.dataset.galleryIndex));
  if(arrow)changeGallery(currentGalleryIndex+Number(arrow.dataset.galleryStep));
});
document.addEventListener('keydown',e=>{
  if(modal.hidden)return;
  if(e.key==='Escape')closeCar();
  if(e.key==='ArrowLeft')changeGallery(currentGalleryIndex-1);
  if(e.key==='ArrowRight')changeGallery(currentGalleryIndex+1);
  if(e.key==='Tab'){
    const focusable=modal.querySelectorAll('button:not([disabled]),a[href],input,select,textarea');
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
async function loadPublicCars() {
  try {
    cars=await window.AMStore.list();
    refreshMakeFilter();
    renderCars();
  } catch(err) {
    grid.innerHTML='<p class="loading-error">Unable to load vehicles right now. Please refresh the page.</p>';
    $('vehicle-count').textContent='—';
    console.error('Stock could not load',err);
  }
}
window.addEventListener('storage',e=>{if(e.key===window.AMStore.LOCAL_KEY)loadPublicCars();});
loadPublicCars();
