/* Stock layer: browser-only demo on localhost; D1 API and Access-guarded admin in production. */
(function () {
  const LOCAL_KEY = 'northstar-v5-demo-stock';
  const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  const mode = (window.NORTHSTAR_PORTFOLIO_DEMO === true || localPreview) ? 'demo' : 'cloudflare';
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const seed = () => clone(window.NORTHSTAR_SEED_CARS || []).map(car => ({ ...car, status: car.status || 'available' }));
  function localRead() {
    try {const cars = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); if (Array.isArray(cars)) return cars;} catch (error) {console.error(error);}
    return seed();
  }
  async function call(url, options = {}) {
    const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin', ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(body.error || `Website request failed (${response.status}).`);
    return body;
  }
  async function list() {
    if (mode === 'demo') return localRead();
    const url = location.pathname.startsWith('/portal/') ? '/portal/api/cars' : '/api/cars';
    return (await call(url)).cars;
  }
  async function save(car) {
    const clean = { ...car, id: Number(car.id), status: car.status || 'available' };
    if (mode === 'demo') {
      const all = localRead(), idx = all.findIndex(row => row.id === clean.id);
      if (idx === -1) all.unshift(clean); else all[idx] = clean;
      try {localStorage.setItem(LOCAL_KEY, JSON.stringify(all));}
      catch {throw Error('Browser storage is full. Use fewer photos or connect the cloud image bucket.');}
      return clean;
    }
    return (await call('/portal/api/cars', { method: 'POST', headers: { 'Content-Type':'application/json','X-Northstar-Portal':'1'}, body: JSON.stringify(clean) })).car;
  }
  async function remove(id) {
    if (mode === 'demo') {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(localRead().filter(row => row.id !== id)));return;
    }
    await call('/portal/api/car/' + encodeURIComponent(id), {method:'DELETE',headers:{'X-Northstar-Portal':'1'}});
  }
  async function user() {
    if (mode === 'demo') return { email:'local-preview' };
    try {return (await call('/portal/api/me')).user;}
    catch {return null;}
  }
  async function isAdmin() {return mode === 'demo' ? true : Boolean(await user());}
  async function signIn() {throw Error('Owners sign in through Cloudflare Access, not this form.');}
  async function logout() {if (mode !== 'demo') location.href='/cdn-cgi/access/logout';}
  async function importStarter() {
    if (mode === 'demo') throw Error('Only used when connecting the live D1 database.');
    return call('/portal/api/import', {method:'POST',headers:{'Content-Type':'application/json','X-Northstar-Portal':'1'},body:JSON.stringify({cars:seed()})});
  }
  function asDataURL(file) {return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
  async function compactImage(file) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('Use JPG, PNG or WebP photos.');
    if (file.size > 10*1024*1024) throw Error('Photo must be smaller than 10 MB.');
    const url=await asDataURL(file);
    return new Promise((resolve,reject)=>{const im=new Image();im.onerror=()=>reject(Error('Cannot read photo'));
      im.onload=()=>{const scale=Math.min(1,1200/Math.max(im.width,im.height));const canvas=document.createElement('canvas');canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.69));};im.src=url;});
  }
  async function uploadPhoto(file, carId) {
    if (mode === 'demo') return compactImage(file);
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw Error('Use JPG, PNG or WebP photos.');
    if (file.size > 10*1024*1024) throw Error('Photo must be smaller than 10 MB.');
    const form = new FormData();form.append('file',file);form.append('carId',String(carId));
    return (await call('/portal/api/upload',{method:'POST',headers:{'X-Northstar-Portal':'1'},body:form})).url;
  }
  window.AMStore={mode,LOCAL_KEY,list,save,remove,signIn,logout,user,isAdmin,importStarter,uploadPhoto,seed,resetDemo:()=>localStorage.removeItem(LOCAL_KEY)};
})();
