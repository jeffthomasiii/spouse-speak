// Backend boundary for Phase 2.
// Local mode makes the pairing UX testable on GitHub Pages. A production adapter can
// implement the same methods without changing the screens.
const KEY="spouse-speak-pairings";

function db(){return JSON.parse(localStorage.getItem(KEY)||"{}")}
function put(data){localStorage.setItem(KEY,JSON.stringify(data))}
function code(){return Array.from({length:6},()=>Math.floor(Math.random()*10)).join("")}

export const backend={
  mode:"local-demo",
  async createPair(owner){
    const data=db(); let invite=code(); while(data[invite]) invite=code();
    data[invite]={id:crypto.randomUUID?.()||String(Date.now()),invite,status:"waiting",members:[owner],messages:[]};
    put(data); return data[invite];
  },
  async joinPair(invite,member){
    const data=db(), pair=data[invite];
    if(!pair) throw new Error("That pairing code was not found.");
    if(pair.members.length>1) throw new Error("That couple is already paired.");
    pair.members.push(member); pair.status="paired"; put(data); return pair;
  },
  async getPair(invite){return db()[invite]||null},
  async send(invite,message){
    const data=db(),pair=data[invite]; if(!pair) throw new Error("Pairing unavailable.");
    pair.messages.push(message); put(data); return message;
  }
};
