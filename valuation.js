(() => {
  'use strict';
  const $=id=>document.getElementById(id), form=$('valuation-form');
  if(!form)return;
  const val=id=>($(id)?.value||'').trim();
  window.NorthstarEnquiries.make(form,{
    getData:()=>({
      kind:'valuation',type:val('valuation-type'),registration:val('valuation-registration'),
      mileage:val('valuation-mileage'),model:val('valuation-spec'),history:val('valuation-history'),price:val('valuation-price'),
      condition:val('valuation-condition'),name:val('valuation-name'),phone:val('valuation-phone'),
      email:val('valuation-email'),target:val('valuation-target')
    })
  });
})();
