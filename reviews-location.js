// Customer reviews and dealership location; uses verified information only.
(() => {
  'use strict';
  const config = window.NORTHSTAR_SITE || {};
  const $ = id => document.getElementById(id);
  const address = String(config.showroomAddress || '').trim();
  const reviewLink = String(config.googleBusinessProfileUrl || '').trim();
  function safeGoogleLink(value) {
    if (!value) return null;
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && (u.hostname === 'google.com' || u.hostname === 'www.google.com' || u.hostname === 'maps.google.com' || u.hostname.endsWith('.google.co.uk') || u.hostname === 'share.google' || u.hostname === 'maps.app.goo.gl') ? u.href : null;
    } catch { return null; }
  }
  const approvedReviewLink = safeGoogleLink(reviewLink);
  const reviewsLink = $('google-reviews-link');
  if (approvedReviewLink) {
    if (reviewsLink) { reviewsLink.href = approvedReviewLink; reviewsLink.hidden = false; }
    const listingLink = $('visit-google-listing');
    if (listingLink) { listingLink.href = approvedReviewLink; listingLink.hidden = false; }
  }
  if (address && $('dealership-address') && $('dealership-map')) {
    $('dealership-address').textContent = address;
    $('visit-map-placeholder').hidden = true;
    const map = $('dealership-map');
    map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(address) + '&output=embed';
    map.hidden = false;
    const directions = $('dealership-directions');
    directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address);
    directions.hidden = false;
    // Keep the appointment booking link visible beside the map.
  }
  function externalLink(uri) {
    if (!uri) return null;
    try {const u=new URL(uri);return u.protocol==='https:' && (u.hostname==='www.google.com' || u.hostname==='google.com' || u.hostname==='maps.google.com') ? u.href : null;}catch{return null;}
  }
  function el(tag,css,text) {const node=document.createElement(tag); if(css)node.className=css; if(text!==undefined)node.textContent=String(text);return node;}
  async function loadReviews() {
    if (!$('google-review-grid')) return;
    try {
      const response = await fetch('/api/google-reviews',{headers:{'Accept':'application/json'},cache:'no-store'});
      if (!response.ok) return;
      const data = await response.json();
      if (!data || !Array.isArray(data.reviews) || !data.reviews.length) return;
      const grid = $('google-review-grid');
      const fragment=document.createDocumentFragment();
      data.reviews.forEach(review => {
        const card = el('article','google-review-card');
        const stars = el('div','google-review-stars','★'.repeat(Math.max(0,Math.min(5,Math.round(Number(review.rating)||0)))));
        stars.setAttribute('aria-label',`${review.rating} out of 5 stars`);
        const quote=el('p','google-review-text',review.text || '');
        const byline=el('div','google-review-person');
        if (review.authorPhoto && /^https:\/\//.test(review.authorPhoto)) {
          const avatar=el('img','google-review-avatar');avatar.src=review.authorPhoto;avatar.alt='';avatar.loading='lazy';avatar.referrerPolicy='no-referrer';byline.appendChild(avatar);
        }
        const details=el('div','google-review-person-details');
        const author = el('strong',null,review.author || 'Google reviewer');
        if (externalLink(review.authorUrl)) { const link=el('a',null);link.href=externalLink(review.authorUrl);link.target='_blank';link.rel='noopener noreferrer';link.appendChild(author);details.appendChild(link); }
        else details.appendChild(author);
        if(review.date)details.appendChild(el('span',null,new Date(review.date).toLocaleDateString('en-GB',{month:'short',year:'numeric'})));
        byline.appendChild(details);
        card.append(stars,quote,byline);
        if(externalLink(review.link)) {const link=el('a','google-review-source','View on Google ↗');link.href=externalLink(review.link);link.target='_blank';link.rel='noopener noreferrer';card.appendChild(link);}
        fragment.appendChild(card);
      });
      grid.replaceChildren(fragment);
      $('google-reviews-placeholder').hidden = true;
      $('google-attribution').hidden = false;
      if(data.rating != null && data.totalRatings != null){
        $('google-rating-number').textContent=Number(data.rating).toFixed(1);
        $('google-rating-count').textContent=`${Number(data.totalRatings).toLocaleString('en-GB')} Google reviews`;
        $('google-score').hidden=false;
        if ($('review-score-pending')) $('review-score-pending').hidden=true;
      }
      const verifiedLink=externalLink(data.googleMapsUrl) || approvedReviewLink;
      if(verifiedLink){reviewsLink.href=verifiedLink;reviewsLink.hidden=false;}
    }catch(e) { console.debug('Google reviews not configured:',e?.message); }
  }
  loadReviews();
})();
