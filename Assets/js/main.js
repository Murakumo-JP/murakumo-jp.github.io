// /* Preloader */
// document.body.onload = function () {
// 	setTimeout(function () {
// 		var preloader = document.getElementById("page-preloader");
// 		if (!preloader.classList.contains("done")) {
// 			preloader.classList.add("done");
// 			$('body').css('overflow', 'visible');
// 		}
// 	}, 500);
// };
// // Back to Top
// function backToTop() {
// 	let button = $(".nome_app_top");

// 	$(window).on("scroll", () => {
// 		if ($(this).scrollTop() >= 200) {
// 			button.fadeIn();
// 		} else {
// 			button.fadeOut();
// 		}
// 	});

// 	button.on("click", (e) => {
// 		e.preventDefault();
// 		$("html").animate({ scrollTop: 0 }, 1000);
// 	});
// }
// //backToTop()

// MurakumoJP mini site — all page scripts

// 1. Mark the page as JS-enabled as early as possible (prevents a flash before reveal animations)
document.documentElement.classList.add('js')

document.addEventListener('DOMContentLoaded',function(){

// 2. Scroll reveal, preview lightbox, header parallax, back-to-top
(function(){
  var items=document.querySelectorAll('.item');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
    items.forEach(function(i){io.observe(i)});
  }else{items.forEach(function(i){i.classList.add('in')})}

  var lb=document.getElementById('lb'),lbImg=lb.querySelector('img');
  function open(el){
    var m=/url\(["']?(.*?)["']?\)/.exec(el.style.backgroundImage);
    if(m){lbImg.src=m[1];lb.showModal()}
  }
  document.querySelectorAll('.img').forEach(function(el){
    el.addEventListener('click',function(){open(el)});
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(el)}});
  });
  lb.addEventListener('click',function(){lb.close()});

  var hero=document.querySelector('.hero img'),top=document.querySelector('.totop'),tick=false;
  var calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function onScroll(){
    var y=window.scrollY;
    if(!calm)hero.style.transform='translateY('+(-Math.min(y*.12,40))+'px)';
    top.classList.toggle('show',y>500);
    tick=false;
  }
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
  top.addEventListener('click',function(){window.scrollTo({top:0})});
})();

// 3. Installation guide popup (loads README.md from GitHub and renders it)
(function(){
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function attr(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}
function safeUrl(u,base){
  u=u.replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();
  if(u.charAt(0)==='#')return null;
  if(u.charAt(0)==='/'&&u.charAt(1)!=='/')base='https://github.com';
  try{var x=new URL(u,base);return /^(https?:|mailto:)$/.test(x.protocol)?x.href:null}catch(e){return null}
}
function inline(s,base){
  var codes=[];
  s=s.replace(/<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi,'![]($1)')
     .replace(/<br\s*\/?>/gi,'\n')
     .replace(/<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,'[$2]($1)')
     .replace(/<\/?(?:p|div|center|details|summary|picture|source|kbd|sub|sup|span|b|i|strong|em|h[1-6]|hr|a)\b[^>]*>/gi,'');
  s=s.replace(/`([^`]+)`/g,function(_,c){codes.push(c);return '\u0001'+(codes.length-1)+'\u0001'});
  s=esc(s);
  s=s.replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+&quot;[^)]*?&quot;)?\s*\)/g,function(m,a,u){
    var h=safeUrl(u,base);return h?'<img loading="lazy" alt="'+a+'" src="'+attr(h)+'">':a});
  s=s.replace(/\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+&quot;[^)]*?&quot;)?\s*\)/g,function(m,t,u){
    var h=safeUrl(u,base);return h?'<a href="'+attr(h)+'" target="_blank" rel="noopener">'+t+'</a>':t});
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<em>$2</em>');
  s=s.replace(/\n/g,'<br>');
  return s.replace(/\u0001(\d+)\u0001/g,function(_,i){return '<code>'+esc(codes[i])+'</code>'});
}
function codeBlock(t){
  t=t.replace(/@\\import/g,'@import');
  return '<div class="code"><button type="button" class="copy">Copy</button><pre><code>'+esc(t)+'</code></pre></div>';
}
function rl(items,s,base){
  var b=items[s.p].ind,tag=items[s.p].ord?'ol':'ul',h='<'+tag+'>';
  while(s.p<items.length&&items[s.p].ind>=b){
    var it=items[s.p];
    if(it.ind>b){h+='<li>'+rl(items,s,base)+'</li>';continue}
    s.p++;
    var t=it.text,cb='',tm=/^\[( |x|X)\]\s+/.exec(t);
    if(tm){cb='<span class="cb'+(tm[1]===' '?'':' on')+'"></span>';t=t.slice(tm[0].length)}
    h+='<li'+(tm?' class="task"':'')+'>'+cb+inline(t,base)+it.extra;
    if(s.p<items.length&&items[s.p].ind>b)h+=rl(items,s,base);
    h+='</li>';
  }
  return h+'</'+tag+'>';
}
function md(src,base){
  src=src.replace(/\r\n?/g,'\n').replace(/<!--[\s\S]*?-->/g,'');
  var L=src.split('\n'),i=0,out=[],m;
  var LI=/^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
  var HR=/^\s*([-*_])(\s*\1){2,}\s*$/;
  var FENCE=/^\s*(```|~~~)/;
  var TBL=/^\s*\|.*\|\s*$/,SEP=/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
  function starts(l){return !l.trim()||/^#{1,6}\s/.test(l)||FENCE.test(l)||HR.test(l)||/^\s*>/.test(l)||LI.test(l)}
  function cells(r){return r.trim().replace(/^\||\|$/g,'').split('|')}
  while(i<L.length){
    var l=L[i];
    if(!l.trim()){i++;continue}
    if((m=FENCE.exec(l))){
      var f=m[1],buf=[];i++;
      while(i<L.length&&L[i].trim().indexOf(f)!==0){buf.push(L[i]);i++}
      i++;out.push(codeBlock(buf.join('\n')));continue;
    }
    if((m=/^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l))){
      out.push('<h'+m[1].length+'>'+inline(m[2],base)+'</h'+m[1].length+'>');i++;continue;
    }
    if(HR.test(l)){out.push('<hr>');i++;continue}
    if(/^\s*>/.test(l)){
      var q=[];while(i<L.length&&/^\s*>/.test(L[i])){q.push(L[i].replace(/^\s*>\s?/,''));i++}
      out.push('<blockquote>'+md(q.join('\n'),base)+'</blockquote>');continue;
    }
    if(TBL.test(l)&&i+1<L.length&&SEP.test(L[i+1])&&L[i+1].indexOf('-')>-1){
      var hd=cells(l),rows=[];i+=2;
      while(i<L.length&&TBL.test(L[i])){rows.push(cells(L[i]));i++}
      out.push('<div class="tw"><table><thead><tr>'+hd.map(function(c){return '<th>'+inline(c.trim(),base)+'</th>'}).join('')+'</tr></thead><tbody>'+
        rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+inline(c.trim(),base)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>');
      continue;
    }
    if(LI.test(l)){
      var items=[];
      while(i<L.length){
        var x=L[i],mm=LI.exec(x);
        if(mm&&!HR.test(x)){items.push({ind:mm[1].replace(/\t/g,'    ').length,ord:/\d/.test(mm[2]),text:mm[3],extra:''});i++;continue}
        if(items.length&&FENCE.test(x)){
          var fb=[],ff=FENCE.exec(x)[1];i++;
          while(i<L.length&&L[i].trim().indexOf(ff)!==0){fb.push(L[i].replace(/^\s{0,8}/,''));i++}
          i++;items[items.length-1].extra+=codeBlock(fb.join('\n'));continue;
        }
        if(items.length&&/^\s{2,}\S/.test(x)&&!starts(x)){items[items.length-1].text+=' '+x.trim();i++;continue}
        if(!x.trim()&&i+1<L.length&&(LI.test(L[i+1])||/^\s+(```|~~~)/.test(L[i+1]))){i++;continue}
        break;
      }
      var s={p:0};while(s.p<items.length)out.push(rl(items,s,base));
      continue;
    }
    var p=[l.trim()];i++;
    while(i<L.length&&!starts(L[i])&&!(TBL.test(L[i])&&i+1<L.length&&SEP.test(L[i+1]))){p.push(L[i].trim());i++}
    out.push('<p>'+inline(p.join(' '),base)+'</p>');
  }
  return out.join('\n');
}

if(typeof document==='undefined')return;
var GH='https://github.com/Murakumo-JP/MyAnimeList-CSS/';
var RAW='https://raw.githubusercontent.com/Murakumo-JP/MyAnimeList-CSS/master/';
var dlg=document.getElementById('guide'),body=dlg.querySelector('.gbody'),gh=dlg.querySelector('.ggh'),cache={},cur='';
function openGuide(folder,key){
  var url=RAW+folder+'/README.md';cur=folder;
  gh.href=GH+'blob/master/'+folder+'/README.md';
  body.innerHTML='<p class="gstat">Loading…</p>';body.scrollTop=0;
  if(!dlg.open)dlg.showModal();
  try{history.replaceState(null,'','#'+key)}catch(e){}
  var p=cache[folder]||(cache[folder]=fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}));
  p.then(function(t){if(cur===folder)body.innerHTML=md(t,url)})
   .catch(function(){delete cache[folder];if(cur===folder)body.innerHTML='<p class="gstat">Could not load the guide. <a href="'+gh.href+'" target="_blank" rel="noopener">Open it on GitHub</a>.</p>'});
}
var links=document.querySelectorAll('[data-guide]');
links.forEach(function(a){
  a.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    e.preventDefault();openGuide(a.dataset.guide,a.dataset.key);
  });
});
dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
dlg.querySelector('.gclose').addEventListener('click',function(){dlg.close()});
dlg.addEventListener('close',function(){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}});
body.addEventListener('click',function(e){
  var b=e.target.closest('.copy');if(!b)return;
  var t=b.parentNode.querySelector('code').textContent;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){
    var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy')}catch(_){}ta.remove();
  }).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)});
});
var k=location.hash.slice(1);
if(k)links.forEach(function(a){if(a.dataset.key===k)openGuide(a.dataset.guide,k)});
})();

});
