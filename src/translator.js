export const profiles={
  direct:{label:"Executive Summary",emoji:"🎯",traits:{brevity:3,detail:0,warmth:1,romance:0,drama:0}},
  details:{label:"Director's Cut",emoji:"🎬",traits:{brevity:0,detail:3,warmth:2,romance:0,drama:1}},
  romantic:{label:"Rom-Com",emoji:"💗",traits:{brevity:0,detail:2,warmth:3,romance:3,drama:2}},
  funny:{label:"Emotional Subtitles",emoji:"😄",traits:{brevity:1,detail:1,warmth:2,romance:1,drama:3}}
};

const timeRe=/\b(?:at\s+)?(?:\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)|\d+\s?(?:minutes?|mins?|hours?|hrs?))\b/gi;
const moneyRe=/\$\s?\d+(?:\.\d{2})?/g;
const questionRe=/[^.!?]*\?/g;
const requestRe=/\b(?:can you|could you|would you|please|need you to|don't forget|remember to|pick up|bring|call|text)\b[^.!?]*/gi;
const placeRe=/\b(?:Trader Joe's|Whole Foods|Costco|Target|Walmart|church|work|home|school|airport|campground)\b/gi;

export function extractFacts(text){
 const facts=[];
 const add=(type,value)=>{if(value&&!facts.some(f=>f.value.toLowerCase()===value.toLowerCase()))facts.push({type,value:value.trim()})};
 [...text.matchAll(timeRe)].forEach(m=>add("time",m[0]));
 [...text.matchAll(moneyRe)].forEach(m=>add("money",m[0]));
 [...text.matchAll(questionRe)].forEach(m=>add("question",m[0]));
 [...text.matchAll(requestRe)].forEach(m=>add("request",m[0]));
 [...text.matchAll(placeRe)].forEach(m=>add("place",m[0]));
 if(/allerg|medication|doctor|hospital|emergency|urgent/i.test(text))add("important",text.match(/[^.!?]*(?:allerg|medication|doctor|hospital|emergency|urgent)[^.!?]*/i)?.[0]);
 return facts;
}
function keyEvent(text){
 const lower=text.toLowerCase();
 if(/tea|hibiscus/.test(lower))return "I got the tea. 🍵";
 if(/grocer|trader joe|whole foods|costco|target|walmart/.test(lower))return "The store run is handled.";
 if(/on my way|heading home|coming home/.test(lower))return "I'm on my way.";
 if(/running late|be late|going to be.*hour|going to be.*minute/.test(lower))return "I'm running later than planned.";
 if(/dinner|food|eat/.test(lower))return "Food is part of the plan.";
 const first=text.split(/[.!?]/).map(x=>x.trim()).find(Boolean)||text;
 return first.length>100?first.slice(0,97)+"…":first;
}
function essentials(text){
 const event=keyEvent(text),facts=extractFacts(text);
 const critical=facts.filter(f=>["time","money","question","request","important"].includes(f.type)).map(f=>f.value);
 return [event,...critical].filter((v,i,a)=>a.findIndex(x=>x.toLowerCase()===v.toLowerCase())===i);
}
function romanticize(text,humor){
 const lower=text.toLowerCase();
 if(/^(cool|ok|okay|k|got it|sounds good|nice)[.!]*$/i.test(text))return humor>=2?"I love that. Your update has been received with enthusiasm, affection, and a completely reasonable desire to spend more time with you. ❤️":"I love that. Thanks for telling me, love. ❤️";
 if(/tea|hibiscus/.test(lower))return "Hibiscus is a flower, which obviously means I am now imagining us wandering through a flower festival together, holding hands and turning an ordinary afternoon into a date. I'm glad you found your tea. 🌺❤️";
 return "I hear you, love. "+text+(humor>=2?" Also, please understand that my emotional support for this message is significantly longer than my original reply would suggest. ❤️":" ❤️");
}
function detailize(text,humor){
 if(text.length>140)return text;
 const extras=["For context, I am providing the extended edition because apparently details are how we show love around here.","The important part is that this is the full story, not merely the headline.","Please consider this the version with commentary enabled."];
 return text+" "+extras[Math.min(humor,2)];
}
function funny(text,humor){
 const core=essentials(text).join(" ");
 const tags=["Translation complete.","Emotional subtitles enabled.","Spousal communications department has reviewed this message.","This concludes today's relationship briefing."];
 return core+" "+tags[Math.min(humor,3)];
}
export function translate(text,style="direct",humor=2){
 const clean=text.trim();if(!clean)return "";
 if(style==="direct")return essentials(clean).slice(0,humor>=3?4:3).join(" ");
 if(style==="romantic")return romanticize(clean,humor);
 if(style==="details")return detailize(clean,humor);
 return funny(clean,humor);
}
