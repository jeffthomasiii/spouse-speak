import { translate, profiles } from "./translator.js";

const app=document.querySelector("#app");
const state=JSON.parse(localStorage.getItem("spouse-speak-state")||"null")||{
  screen:"welcome",
  me:{name:"Me",style:"direct"},
  spouse:{name:"My Spouse",style:"romantic"},
  humor:2,
  messages:[]
};
const save=()=>localStorage.setItem("spouse-speak-state",JSON.stringify(state));

function logo(){return `<div class="brand"><div class="mark"><span>☺</span><span>☺</span><b>♥</b></div><h1>Spouse Speak</h1><p>Same words. Happier marriages.</p></div>`}

function welcome(){
  return `<section class="phone welcome">${logo()}
    <div class="hero-couple"><div>📱🙂</div><span>♥</span><div>😊📱</div></div>
    <div class="pitch">
      <p>💗 Turns long stories into clear updates <strong>(and vice versa)</strong>.</p>
      <p>💬 Keeps the meaning, changes the delivery.</p>
      <p>😄 Built for couples who love each other but occasionally require subtitles.</p>
    </div>
    <button class="primary" data-go="setup">Get Started</button>
    <small>Because love should be easy to understand.</small>
  </section>`;
}

function choices(selected,prefix){
 return Object.entries(profiles).map(([k,v])=>`<button class="choice ${selected===k?"selected":""}" data-style="${prefix}:${k}"><span>${v.emoji}</span><b>${v.label}</b><i>${selected===k?"✓":""}</i></button>`).join("");
}

function setup(){
 return `<section class="phone setup"><button class="back" data-go="welcome">‹</button>${logo()}
 <h2>How do you each like to communicate?</h2><p class="sub">We'll tailor the translation to your styles.</p>
 <div class="profile blue"><h3>🧔 Your Style</h3>${choices(state.me.style,"me")}</div>
 <div class="profile pink"><h3>👩 Your Spouse's Style</h3>${choices(state.spouse.style,"spouse")}</div>
 <label class="humor">Parody dial <span id="humorLabel">${["Gentle","Playful","Extra","Unnecessarily Dramatic"][state.humor]}</span><input id="humor" type="range" min="0" max="3" value="${state.humor}"></label>
 <button class="primary" data-go="chat">Save & Start Chatting</button></section>`;
}

function message(m){
 return `<article class="message ${m.sender==="me"?"mine":"theirs"}">
 <div class="original"><small>${m.sender==="me"?"You":"Your spouse"} actually said</small><p>${escapeHtml(m.original)}</p></div>
 <div class="translated"><small>✨ Translated for ${m.sender==="me"?"your spouse":"you"} ✨</small><p>${escapeHtml(m.translated)}</p></div>
 </article>`;
}

function chat(){
 const msgs=state.messages.length?state.messages.map(message).join(""):`<div class="empty"><div>💬♥💬</div><h3>Ready for translation duty.</h3><p>Try the tea story demo, or write your own message.</p><button class="secondary" id="demo">Load the tea incident</button></div>`;
 return `<section class="phone chat"><header><button class="back" data-go="setup">‹</button><div><b>Spouse Speak</b><small>● Translation services online</small></div><button class="icon" id="swap" title="Swap viewpoint">⇄</button></header>
 <div class="messages" id="messages">${msgs}</div>
 <form id="composer"><textarea id="input" rows="1" placeholder="Type what you actually mean…"></textarea><button aria-label="Translate and send">➤</button></form>
 <p class="disclaimer">Spouse Speak changes style, not facts. For actual mind-reading, please consult your spouse.</p></section>`;
}

function translating(text,sender){
 app.innerHTML=`<section class="phone translating"><button class="close" id="cancel">×</button><h2>Translating…</h2><p>Turning “${escapeHtml(text.slice(0,48))}${text.length>48?"…":""}” into something they'll love.</p><div class="magic">💬 <span>♥</span> 💬</div><ul><li>Preserving important facts…</li><li>Adjusting emotional bandwidth…</li><li>Checking sarcasm levels…</li><li>Adding marriage-grade context…</li></ul><div class="progress"><i></i></div></section>`;
 setTimeout(()=>{
   const target=sender==="me"?state.spouse.style:state.me.style;
   state.messages.push({sender,original:text,translated:translate(text,target,state.humor),at:Date.now()});
   save(); state.screen="chat"; render();
   setTimeout(()=>document.querySelector(".messages")?.scrollTo(0,99999),0);
 },900);
}

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){save(); app.innerHTML=state.screen==="welcome"?welcome():state.screen==="setup"?setup():chat(); bind();}

function bind(){
 document.querySelectorAll("[data-go]").forEach(el=>el.onclick=()=>{state.screen=el.dataset.go;render()});
 document.querySelectorAll("[data-style]").forEach(el=>el.onclick=()=>{const [who,style]=el.dataset.style.split(":");state[who].style=style;render()});
 const slider=document.querySelector("#humor"); if(slider) slider.oninput=e=>{state.humor=+e.target.value;save();document.querySelector("#humorLabel").textContent=["Gentle","Playful","Extra","Unnecessarily Dramatic"][state.humor]};
 const form=document.querySelector("#composer"); if(form) form.onsubmit=e=>{e.preventDefault();const input=document.querySelector("#input");if(input.value.trim()) translating(input.value.trim(),"me")};
 const demo=document.querySelector("#demo"); if(demo) demo.onclick=()=>translating("Hey! I know I said I'd be 20 minutes, but I'm going to be like an hour. Trader Joe's had hibiscus tea mixed with turmeric, which I'm allergic to, so I walked to Whole Foods. I found the tea, met a really nice lady in line, talked about yoga, and basically made a new friend. Perfect day for tea.","spouse");
 const swap=document.querySelector("#swap"); if(swap) swap.onclick=()=>{state.messages=state.messages.map(m=>({...m,sender:m.sender==="me"?"spouse":"me"}));save();render()};
}
render();
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
