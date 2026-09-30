const directOpeners = ["Got it.", "Copy that.", "Update received.", "Mission status:"];
const warmOpeners = ["Okay, love.", "I hear you.", "Thank you for telling me.", "I am emotionally invested in this update."];

export const profiles = {
  direct: { label: "Short & Direct", emoji: "🎯" },
  details: { label: "Full Details", emoji: "💬" },
  romantic: { label: "Romantic & Poetic", emoji: "💗" },
  funny: { label: "Add a Little Humor", emoji: "😄" }
};

function facts(text) {
  const t=text.trim();
  const lower=t.toLowerCase();
  const out=[];
  if (/tea|hibiscus/.test(lower)) out.push("Tea acquired. 🍵");
  if (/hour|late|minutes/.test(lower)) out.push("Running later than planned.");
  if (/whole foods/.test(lower)) out.push("Whole Foods was involved.");
  if (/trader joe/.test(lower)) out.push("Trader Joe's did not have the right tea.");
  if (/allerg/.test(lower)) out.push("Avoided an allergy problem.");
  return out.length ? out : [t.length > 90 ? t.split(/[.!?]/)[0] + "." : t];
}

export function translate(text, style="direct", humor=2) {
  const clean=text.trim();
  if (!clean) return "";
  const lower=clean.toLowerCase();

  if (style==="direct") {
    const f=facts(clean);
    return f.slice(0, humor >= 3 ? 3 : 2).join(" ");
  }

  if (style==="romantic") {
    if (/^(cool|ok|okay|k|got it|sounds good)[.!]*$/i.test(clean)) {
      return "I love that. It makes me think we should find a little adventure to do together, because ordinary things are better when I get to share them with you. ❤️";
    }
    if (/tea|hibiscus/.test(lower)) {
      return "Hibiscus, a flower. 🌺 Somehow that makes me think we should wander through a flower festival together, take our time, hold hands, and turn an ordinary day into one of those little memories that belongs only to us. ❤️";
    }
    return warmOpeners[humor % warmOpeners.length] + " " + clean + " And, for the record, I am very glad I get to do life with you. ❤️";
  }

  if (style==="details") {
    return clean + (humor >= 2 ? " Also, please assume I would happily listen to the director's commentary version of this story." : "");
  }

  return directOpeners[humor % directOpeners.length] + " " + clean + (humor >= 3 ? " Marriage translation services remain operational. 😄" : "");
}
