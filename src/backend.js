const LOCAL_KEY="spouse-speak-pairings";
let client=null, channel=null;

async function config(){
  try{return (await import("../config.js")).CONFIG}catch{return {supabaseUrl:"",supabaseKey:"",translateEndpoint:""}}
}
function localDb(){return JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")}
function localPut(d){localStorage.setItem(LOCAL_KEY,JSON.stringify(d))}
function invite(){return Array.from({length:6},()=>Math.floor(Math.random()*10)).join("")}
async function supabase(){
  if(client)return client;
  const c=await config(); if(!c.supabaseUrl||!c.supabaseKey)return null;
  const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2");
  client=createClient(c.supabaseUrl,c.supabaseKey); return client;
}
export const backend={
  async mode(){return (await supabase())?"realtime":"local-demo"},
  async signIn(email){const s=await supabase();if(!s)return {local:true};return s.auth.signInWithOtp({email,options:{emailRedirectTo:location.href.split("?")[0]}})},
  async user(){const s=await supabase();if(!s)return null;return (await s.auth.getUser()).data.user},
  async createPair(owner){
    const s=await supabase();
    if(!s){const d=localDb();let code=invite();while(d[code])code=invite();d[code]={id:crypto.randomUUID(),invite:code,status:"waiting",members:[owner],messages:[]};localPut(d);return d[code]}
    const code=invite();const {data,error}=await s.rpc("create_couple",{invite_code:code,display_name:owner.name,communication_style:owner.style});if(error)throw error;return {id:data.couple_id,invite:code,status:"waiting"};
  },
  async joinPair(code,member){
    const s=await supabase();
    if(!s){const d=localDb(),p=d[code];if(!p)throw Error("That pairing code was not found.");p.members.push(member);p.status="paired";localPut(d);return p}
    const {data,error}=await s.rpc("join_couple",{invite_code:code,display_name:member.name,communication_style:member.style});if(error)throw error;return {id:data.couple_id,invite:code,status:"paired"};
  },
  async messages(coupleId){const s=await supabase();if(!s)return[];const {data,error}=await s.from("messages").select("*").eq("couple_id",coupleId).order("created_at");if(error)throw error;return data},
  async send(coupleId,message){
    const s=await supabase();if(!s)return message;
    const u=await this.user();const row={id:message.id,couple_id:coupleId,sender_id:u.id,original_text:message.original,translated_text:message.translated,created_at:new Date(message.at).toISOString()};
    const {error}=await s.from("messages").insert(row);if(error)throw error;return row;
  },
  async subscribe(coupleId,onMessage){
    const s=await supabase();if(!s)return()=>{};
    if(channel)await s.removeChannel(channel);
    channel=s.channel("couple-"+coupleId).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"couple_id=eq."+coupleId},p=>onMessage(p.new)).subscribe();
    return()=>s.removeChannel(channel);
  },
  async translate(text,style,humor){
    const c=await config();if(!c.translateEndpoint)return null;
    const s=await supabase();const token=s?(await s.auth.getSession()).data.session?.access_token:null;
    const res=await fetch(c.translateEndpoint,{method:"POST",headers:{"content-type":"application/json",...(token?{authorization:"Bearer "+token}:{})},body:JSON.stringify({text,style,humor})});
    if(!res.ok)throw Error("Translation service unavailable.");return (await res.json()).translation;
  }
};
