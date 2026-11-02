// Shared safe form transport. No API keys or private information are stored in the browser.
window.NorthstarEnquiries = (function () {
  let configPromise, turnstileScriptPromise;
  function getConfig() {
    if (!configPromise) configPromise = fetch('/api/enquiry-config',{cache:'no-store'})
      .then(r=> {if(!r.ok)throw Error('Configuration unavailable');return r.json();});
    return configPromise;
  }
  function loadTurnstile() {
    // Explicit widgets can be rendered as soon as this asynchronous script's
    // load event fires. Do not call turnstile.ready() on an async script.
    if(window.turnstile && typeof window.turnstile.render === 'function') {
      return Promise.resolve(window.turnstile);
    }
    if(!turnstileScriptPromise) {
      turnstileScriptPromise=new Promise((resolve,reject)=>{
        const script=document.createElement('script');
        script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async=true;
        script.onload=()=>{
          if(window.turnstile && typeof window.turnstile.render === 'function') resolve(window.turnstile);
          else reject(new Error('Turnstile loaded without its render function'));
        };
        script.onerror=()=>reject(new Error('Security check script could not load'));
        document.head.appendChild(script);
      }).catch(error=>{
        turnstileScriptPromise=null;
        throw error;
      });
    }
    return turnstileScriptPromise;
  }
  function make(form,{getData,onSuccess}) {
    const button=form.querySelector('button[type="submit"]');
    if (window.NORTHSTAR_PORTFOLIO_DEMO === true) {
      button.disabled = true;
      const notice = form.querySelector('[data-enquiry-status]');
      if (notice) notice.textContent = 'Portfolio demo — sending enquiries is disabled. No messages or personal information are collected.';
      form.addEventListener('submit', e => e.preventDefault());
      return;
    }
    const originalLabel=button.innerHTML;
    const status=form.querySelector('[data-enquiry-status]');
    const mount=form.querySelector('[data-turnstile-container]');
    let widgetId=null, token='', ready=false, busy=false, submitted=false, submissionId='';
    const notice=(msg,success=false)=>{status.textContent=msg;status.classList.toggle('is-success',success);};
    const resetChallenge=()=> {token='';ready=false;button.disabled=true;if(widgetId!==null && window.turnstile)window.turnstile.reset(widgetId);};
    button.disabled=true;
    notice('Checking that online enquiries are available…');
    getConfig().then(async cfg=>{
      if(!cfg.ready || !cfg.siteKey){
        notice('Online enquiries are being set up. Please call (demo number not supplied) meanwhile.');
        return;
      }
      const turnstile=await loadTurnstile();
      // The previous version called turnstile.ready() here after async loading.
      // That can throw before rendering, leaving the button permanently disabled.
      widgetId=turnstile.render(mount,{
        sitekey:cfg.siteKey,theme:'dark',size:'flexible',
        callback:challengeToken=>{
          if(submitted)return;
          token=challengeToken||'';
          ready=Boolean(token);
          button.disabled=!ready;
          if(ready)notice('');
        },
        'expired-callback':()=>{
          if(submitted)return;
          token='';ready=false;button.disabled=true;
          notice('Security check expired. Please complete it again.');
        },
        'error-callback':errorCode=>{
          if(submitted)return true;
          token='';ready=false;button.disabled=true;
          const code=errorCode ? ` (code ${String(errorCode).slice(0,20)})` : '';
          notice(`Security check could not complete${code}. Please refresh this page.`);
          console.warn('Northstar Motors Turnstile error',errorCode);
          return true;
        }
      });
      if(widgetId===null || widgetId===undefined)throw new Error('Turnstile did not render');
    }).catch(error=>{
      console.error('Northstar Motors enquiry startup:',error);
      notice('Security check could not load. Please refresh this page or call (demo number not supplied).');
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(busy || submitted || !ready)return;
      if(!form.reportValidity())return;
      if(!token){notice('Please complete the security check.');return;}
      if(!submissionId){
        const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
        submissionId=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
      }
      busy=true;button.disabled=true;button.textContent='Sending enquiry…';notice('Sending securely…');
      try {
        const result=await fetch('/api/enquiry',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({...getData(),turnstileToken:token,submissionId})
        });
        const data=await result.json();
        if(!result.ok || !data.ok)throw Error(data.error || 'Unable to send your enquiry.');
        notice('Thank you — your enquiry has been accepted for sending to Northstar Motors.'+(data.reference?' Reference: '+data.reference:''),true);
        button.textContent='Enquiry submitted ✓';
        submissionId='';
        submitted=true;ready=false;token='';button.disabled=true;
        if(onSuccess)onSuccess();
      } catch(error) {
        notice(error.message || 'We could not send your enquiry. Please call (demo number not supplied).');
        button.innerHTML=originalLabel;
        resetChallenge();
      } finally {busy=false; if(!status.classList.contains('is-success'))button.disabled=true;}
    });
  }
  return {make};
})();
