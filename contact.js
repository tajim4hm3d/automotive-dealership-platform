(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const form=$('enquiry-form');
  const enquiryType=$('enquiry-interest'), carFields=$('sell-car-fields'), model=$('sell-model'), messageInput=$('enquiry-message'), star=$('enquiry-message-required');
  const params=new URLSearchParams(window.location.search);
  const interest=params.get('interest');
  if(interest) {
    const match=Array.from(enquiryType.options).find(o=>o.value.toLowerCase()===interest.toLowerCase());
    if(match)enquiryType.value=match.value;
  }
  const vehicle=params.get('vehicle');
  if(vehicle){
    enquiryType.value=interest==='Finding a vehicle'?'Finding a vehicle':'Vehicle enquiry';
    messageInput.value=(interest==='Finding a vehicle'?'I saw a sold vehicle and am looking for something similar: ':'I would like to enquire about the vehicle: ')+vehicle+'. Please contact me with further information.';
  }
  const selling=()=>['Sell my car','Part exchange'].includes(enquiryType.value);
  const val=id=>($(id)?.value||'').trim();
  function refresh(){
    const isSell=selling();carFields.hidden=!isSell;model.required=isSell;messageInput.required=!isSell;star.hidden=isSell;
    messageInput.placeholder=isSell?'Please include specification, MOT, modifications, damage or any other useful details...':'Tell us how we can help…';
  }
  enquiryType.addEventListener('change',refresh);refresh();
  window.NorthstarEnquiries.make(form,{
    getData:()=>({
      kind:'contact', name:val('enquiry-name'),phone:val('enquiry-phone'),email:val('enquiry-email'),type:enquiryType.value,
      registration:val('sell-registration'),model:val('sell-model'),year:val('sell-year'),mileage:val('sell-mileage'),
      condition:val('sell-condition'),history:val('sell-service-history'),price:val('sell-price'),message:val('enquiry-message')
    })
  });
})();
