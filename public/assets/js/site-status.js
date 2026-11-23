/* GTA6HeistGuide shared status hydrator. Reads data/site-status.json (timestamp/build) and derives counts from
   map-pins.json + properties.json so no page hardcodes a different number. Static HTML keeps correct fallbacks. */
(function(){
  'use strict';
  function get(u){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null});}
  function setAll(sel,fn){document.querySelectorAll(sel).forEach(fn);}
  Promise.all([get('/data/site-status.json'),get('/data/map-pins.json'),get('/data/properties.json')]).then(function(r){
    var s=r[0],m=r[1],p=r[2];
    if(s){
      setAll('[data-launch-day-num],[data-site-last-verified]',function(e){e.textContent=e.hasAttribute('data-site-last-verified-short')||e.hasAttribute('data-launch-day-num')?('VERIFIED '+s.lastVerifiedShort.toUpperCase()):s.lastVerifiedLabel;});
      setAll('[data-site-last-verified-long]',function(e){e.textContent=s.lastVerifiedLabel;});
    }
    if(m&&Array.isArray(m.pins)){
      var n=m.pins.length;
      setAll('[data-pin-count]',function(e){e.textContent=n;});
      setAll('[data-pin-count-plus]',function(e){e.textContent=n+'+';});
    }
    if(p&&Array.isArray(p.items)){
      setAll('[data-property-record-count]',function(e){e.textContent=p.items.length;});
    }
  });
})();
