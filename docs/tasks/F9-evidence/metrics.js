// F9 外觀度量腳本（改前／改後共用，⛔ 不得為改後另寫一份）
// 用法：在瀏覽器 console 或自動化工具對每頁執行，把回傳 JSON 存成 <page>.json
// next/image 最終仍渲染成 <img>，同一段查詢改後照樣可跑；currentSrc 走最佳化時會變 /_next/image?url=…（預期差異）
await new Promise(r=>setTimeout(r,1500));
const out=[...document.querySelectorAll('img')].map((im,i)=>{
  const r=im.getBoundingClientRect(); const cs=getComputedStyle(im);
  return {i,src:im.getAttribute('src'),currentSrc:im.currentSrc,alt:im.alt,complete:im.complete,
    naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,
    rect:{x:Math.round(r.left+scrollX),y:Math.round(r.top+scrollY),w:Math.round(r.width*100)/100,h:Math.round(r.height*100)/100},
    objectFit:cs.objectFit,opacity:cs.opacity,filter:cs.filter,borderRadius:cs.borderRadius,padding:cs.padding,
    loading:im.loading,decoding:im.decoding,className:im.className};
});
JSON.stringify({page:location.pathname,viewport:[innerWidth,innerHeight],docHeight:document.documentElement.scrollHeight,imgs:out});
