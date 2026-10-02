// Swing switch. Racquet sports are played left-handed, golf right-handed.
// p: swing path, -1 (steep high to low) to 1 (low to high).
// back/wrist/fin: 1 (smallest, firmest) to 5. hn: contact height, 0 (ground) to 5.
// fa: face, -2 (very open) to 2 (closed).
const RACQUET_WARM = "Before the warm-up: 10 slow shadow swings (5 forehand, 5 backhand) saying cue 1 out loud. Exaggerate the change; it'll feel wrong, which is the point.";
const S = {
  squash: {n: "Squash", hand: "Left", p: -0.7, path: "High to low", back: 3, backT: "Racquet up early, compact", h: "Shin to knee", hn: 1.5, spot: "Beside front foot", wrist: 3, wristT: "Cocked, forearm-driven", face: "Open", fa: -1, fin: 2, finT: "Short, checked", grip: "Continental", cue: "Racquet up early, swing down through, stop short."},
  tennis: {n: "Lawn tennis", hand: "Left", p: 0.8, path: "Low to high", back: 5, backT: "Full loop", h: "Waist", hn: 3, spot: "Well out in front", wrist: 3, wristT: "Laid back, natural release", face: "Closing, brushing up", fa: 1, fin: 5, finT: "Over the shoulder", grip: "Eastern or semi-western", cue: "Drop the head below the ball, brush up, finish high."},
  real: {n: "Real tennis", hand: "Left", p: -0.9, path: "High to low, heavy cut", back: 4, backT: "High and long", h: "Knee", hn: 1.5, spot: "Beside to slightly behind front foot", wrist: 1, wristT: "Firm, locked", face: "Very open", fa: -2, fin: 3, finT: "Low and forward", grip: "Continental", cue: "Chop down, open face, finish low."},
  rackets: {n: "Rackets", hand: "Left", p: 0, path: "Flat and low", back: 2, backT: "Short", h: "Low, near the knee", hn: 1.5, spot: "Out in front", wrist: 5, wristT: "Fast whip", face: "Flat", fa: 0, fin: 3, finT: "Through and across", grip: "Continental", cue: "Short, flat, low, fast."},
  pickle: {n: "Pickleball", hand: "Left", p: 0.3, path: "Gentle low to high", back: 1, backT: "Minimal", h: "Below waist (dinks) to waist", hn: 2.5, spot: "Out in front", wrist: 1, wristT: "Firm", face: "Flat to slightly open", fa: 0, fin: 2, finT: "Toward the target", grip: "Continental", cue: "Swing from the shoulder, no wrist."},
  padel: {n: "Padel", hand: "Left", p: -0.3, path: "Flat to slight high to low", back: 2, backT: "Compact, head up", h: "Hip", hn: 3, spot: "Beside to slightly in front", wrist: 2, wristT: "Firm", face: "Slightly open", fa: -1, fin: 2, finT: "Short, toward target", grip: "Continental", cue: "Head up, contact at the hip, slice it."},
  tt: {n: "Table tennis", hand: "Left", p: 0.8, path: "Low to high, brushing", back: 1, backT: "Tiny", h: "Table height", hn: 3, spot: "In front of the body", wrist: 4, wristT: "Active forearm and wrist", face: "Closed", fa: 2, fin: 1, finT: "Near the forehead", grip: "Shakehand", cue: "Elbow and forearm, brush up, keep it small."},
  golf: {n: "Golf", hand: "Right", p: -0.3, path: "Down into the ball, then around", back: 5, backT: "Full shoulder turn, wrists hinged", h: "On the ground", hn: 0, spot: "Centre of stance (irons), inside left heel (driver)", wrist: 4, wristT: "Hinge back, hold it, release through", face: "Square", fa: 0, fin: 5, finT: "Full, chest to target, on the left foot", grip: "Overlap or interlock, left hand on top", cue: "Turn, hold the hinge, hit down on the back of the ball, finish facing the target.",
    warm: "Before the first tee: 10 slow practice swings saying cue 1 out loud, 5 to waist height holding the wrist hinge and 5 full to a held finish. Then a few 7-irons before the driver."}
};
const keys = Object.keys(S);

// Golf is the other hand, so switching into or out of it gets its own cues.
const TO_GOLF_HAND = "Switch sides: you golf right-handed, so your left arm leads. Borrow your backhand, not your forehand: left hand at the top of the grip, back of the left hand facing the target at impact.";
const FROM_GOLF_HAND = "Back to the left hand, and the ball moves: split-step, prepare early, and recover to ready instead of holding the finish.";
const TO_GOLF = {
  squash: "Squash is all cut. Square the face and swing from the inside, or the ball slices.",
  tennis: "No topspin roll-over. Turn your chest through and keep the hands quiet, or it hooks.",
  real: "A real tennis chop is a slice with a club. Square face, shallower path from the inside.",
  rackets: "The rackets wrist whip flips the club. Hold the hinge and keep your hands ahead of the ball.",
  pickle: "Pickleball is arms and no turn. Turn your shoulders fully; this swing is far bigger.",
  padel: "Padel slice opens the face. Square it and swing from the inside.",
  tt: "The table tennis brush tops it or hooks it here. Hit down and let the loft lift the ball."
};

// [miss, likely sources, why, fix, drill]
const M = {
  squash: [
    ["Ball sits up off the back wall", "tennis, tt", "Your low-to-high topspin finish is lifting the ball.", "Keep the swing descending and finish with the racquet pointing at the front wall at chest height.", "Solo length drives: 10 in a row landing past the short line, freezing a short finish each time."],
    ["Lots of tins", "real", "A real tennis chop is too steep for squash.", "Shallower descent, and meet the ball off the front foot rather than beside the back foot.", "Solo drives aimed at an imaginary line a racquet-head above the tin; count clean ones out of 20."],
    ["Ball comes off the side wall early", "tennis", "Tennis contact point, too far out in front, sprays the ball crosscourt.", "Contact beside the front foot with shoulders turned to the side wall a beat longer.", "Rail drives along the side wall, aiming to hug it all the way to the back."],
    ["Late on the volley, swing too big", "tennis, golf", "A full tennis loop or a golf turn takes too long at squash pace.", "Racquet up before the ball reaches the front wall; compact punch, short finish.", "Volley drives against the front wall from the short line, 20 without dropping the racquet head."]],
  tennis: [
    ["Lots of balls into the net", "squash, real", "The downward squash and real tennis path is driving the ball down.", "Start the racquet head below the ball and finish over your right shoulder on the forehand.", "20 drop-fed forehands, holding the finish for two seconds each time."],
    ["Balls flying long", "rackets, padel", "Flat rackets whip or an open padel face is taking spin off.", "More brush, slightly closed face, aim higher over the net and let spin bring it down.", "Rally to the service line only, with obvious net clearance."],
    ["Late, jammed contact", "squash, real", "You're letting the ball reach your body like in the court sports.", "Turn early and meet the ball well out in front.", "Ball machine or feed: call 'turn' at the bounce, 'hit' in front."]],
  real: [
    ["Ball kicks up, no cut", "tennis, tt", "Topspin habits from tennis and table tennis are closing the face.", "Open the face, swing down, finish low and forward.", "Feed 20 forehands and check each one skids rather than kicks."],
    ["Ball into the net or dropping short", "squash", "Squash's short checked finish is cutting the stroke off.", "Longer, flatter path through contact; let the follow-through travel.", "Rally to length, aiming for the ball to die near the back wall."]],
  rackets: [
    ["Ball too high off the front wall", "padel, pickle", "The soft, open padel and pickleball face is lifting it.", "Flat face, lower contact, accelerate through.", "10 drives at a target just above the board."],
    ["Mishits at pace", "tennis, squash, golf", "A big tennis, squash or golf backswing is too slow for rackets pace.", "Shorter preparation; let the wrist supply the speed.", "Volley to yourself against the wall at short range, racquet barely going back."]],
  pickle: [
    ["Dinks popping up", "squash, rackets, tt", "Wrist action from the wristy sports is flicking the paddle face open.", "Lock the wrist, lift from the shoulder, set the paddle face early.", "50 crosscourt dinks, freezing the paddle after each."],
    ["Drives flying long", "tennis", "A full tennis swing is too big for a pickleball court.", "Half the swing, finish at chest height.", "Drive to the kitchen line from the baseline, 20 balls."],
    ["Dinks into the net", "padel, real, golf", "A slicing, downward path (or golf's 'hit down') is carrying into the net.", "Swing gently low to high with a slightly open face.", "Dink rally aiming for a clear arc over the net."]],
  padel: [
    ["Balls come hard off the back glass and get smashed", "tennis", "Full tennis topspin swings carry the ball too deep and fast.", "Compact slice to the feet, low through the middle.", "20 slice balls aimed at the service line."],
    ["Mistiming balls off the glass", "squash", "Squash habits make you hit the ball too close to the wall.", "Step away from the glass, let the ball come out, take it at the hip.", "Partner feeds off the back glass: let it come out, then strike."]],
  tt: [
    ["Ball goes long off the end", "tennis, padel, real", "A big swing or an open face from other sports is adding too much distance.", "Shorten the stroke, close the face, brush rather than hit.", "Forehand-to-forehand rally, counting balls that land before the end line."],
    ["Into the net", "squash, real", "The downward path from the cut sports drives the ball into the net.", "Brush up and forward from below the ball.", "Multi-ball topspin against backspin, 30 balls."],
    ["Slow recovery between shots", "tennis, golf", "Big tennis finishes, and golf's held finish, take too long to recover from.", "Finish near the forehead and snap back to ready.", "Footwork drill: alternate forehand and backhand, focusing on the reset."]],
  golf: [
    ["Slice: the ball curves away to the right", "squash, real, padel", "The cut sports have trained an open face and an out-to-in path across the ball. With a club, that's a slice.", "Square the face and swing from the inside: feel the club come from behind you and exit to the right of the target, forearms rotating through.", "Headcover a few inches outside and behind the ball; 20 half swings with a 7-iron without touching it."],
    ["Push or block: straight right", "pickle, padel", "Firm-wrist sports, plus a strong left arm that wants to pull, keep the face from closing.", "Let the right hand and forearm release through impact; the right palm faces the ground just after the ball.", "Split-hand half swings (hands a couple of inches apart on the grip), feeling the right hand pass the left. 20 balls."],
    ["Hook or pull-hook", "tennis, tt", "Topspin roll-over is shutting the face through impact.", "Keep turning your chest through and let the body square the face, not the hands.", "20 three-quarter swings, freezing at waist height in the follow-through with the toe of the club pointing up."],
    ["Thin or topped", "tennis, pickle, tt", "Low-to-high habits have you swinging up at a ball that's sitting on the ground.", "Weight on the left foot at impact; hit down on the back of the ball and let the loft get it airborne.", "Ball on a line (or in front of a towel) on the ground; 20 swings where the divot starts on the target side of it."],
    ["Fat shots and flippy hands", "rackets, squash, tt", "The wristy sports release the hinge early, so the clubhead passes your hands before the ball.", "Hands ahead of the ball at impact, left wrist flat. Hold the angle longer than feels right.", "Hip-to-hip half swings, pausing at impact with the hands over your left thigh; 20 balls."],
    ["Head and chest come up early", "tennis, squash, padel", "Moving-ball sports train you to look at the target and get ready for the next shot.", "Nothing is coming back. Stay over the ball until it's gone.", "10 balls where you keep looking at the spot the ball sat on for a slow count of one."]]
};

// Where to hit it. lo/hi/sweet on the HEIGHTS scale below (0 = ground).
// You're left-handed with a racquet: forehand front foot = right, backhand front foot = left.
const HEIGHTS = [["ground", 0], ["knee", 2.7], ["hip", 4.8], ["chest", 7], ["head", 9.3]];
const HMAX = 9.6;
const LANDMARKS = [["ground", 0], ["ankle", 0.6], ["shin", 1.5], ["knee", 2.7], ["thigh", 3.8], ["hip", 4.8], ["waist", 5.6], ["chest", 7], ["shoulder", 8.1], ["head", 9.3]];
const C = {
  squash: {lo: 1.3, hi: 3.1, sweet: 2.3, height: "Low: shin to knee. Let the ball drop past the top of its bounce; drives taken below the knee stay tight and low.",
    front: "Forehand level with or just ahead of your front (right) foot; backhand a little further in front of your front (left) foot.",
    away: "Arm plus racquet away, further than it feels. Crowding the ball is the classic squash fault.",
    bounce: "Falling, after the peak.",
    shots: [["Volley", "Out in front, around shoulder height. Punch it, short finish."], ["Boast", "Let it get a bit deeper, beside the back foot, to angle it into the side wall."]]},
  tennis: {lo: 3.6, hi: 8.1, sweet: 5.6, height: "Waist high. The strike zone runs from just below the hip to the shoulder; use your feet (back up or step in) so the ball arrives at your waist instead of reaching for it.",
    front: "Well out in front: forehand ahead of your left hip in an open stance (ahead of the right foot in a neutral one); one-handed backhand furthest in front, ahead of your left foot; two-hander a little closer.",
    away: "About an arm and a half, elbow comfortably bent on the forehand.",
    bounce: "At or just after the peak. Take it on the rise only when you're attacking.",
    shots: [["Volley", "In front of the body, at about eye level, short punch."], ["Serve", "Full reach up, slightly inside the baseline and out toward your left (hitting) side."]]},
  real: {lo: 0.9, hi: 3.1, sweet: 2.1, height: "Low: knee height or below. Let it drop; the low contact is what lets the cut make the ball skid and die.",
    front: "Beside to slightly behind your front foot: later than lawn tennis, so the downward swing can cut under it.",
    away: "Comfortably away, side-on to the net.",
    bounce: "Falling, well after the peak.",
    shots: [["Off the wall", "Wait for it to come off the side or back wall and drop before you hit."]]},
  rackets: {lo: 1.4, hi: 3.2, sweet: 2.5, height: "Low, around the knee. Get your body down to the ball; it won't sit up for you.",
    front: "Out in front of the front foot. Meet it early; it's coming at you very fast.",
    away: "Arm plus racket away, side-on.",
    bounce: "Falling, low, and early in the fall: there's no time to wait.",
    shots: [["Volley", "Take it out of the air whenever you can, short and in front."]]},
  pickle: {lo: 2.3, hi: 7, sweet: 4.2, height: "Dinks below the knee to mid-thigh; drives and volleys waist to chest.",
    front: "Always out in front of your body. Never let the ball get beside or behind you.",
    away: "Close: elbow bent, paddle face in front of you.",
    bounce: "Dinks after the bounce as the ball falls, or out of the air. Drives at the peak.",
    shots: [["Volley", "Out in front at chest height; firm block, no swing."], ["Serve", "Volley serve: contact below your waist, with an upward arc. A drop serve (let it bounce first) skips those limits."]]},
  padel: {lo: 3.6, hi: 6.2, sweet: 4.9, height: "Hip high. Let the ball come off the glass and drop to your hip before you hit it.",
    front: "Beside to slightly in front of the body. Compact.",
    away: "Closer than tennis; the racket is short.",
    bounce: "Falling, after it comes out of the glass.",
    shots: [["Volley", "In front, chest height, punched with slice."], ["Bandeja", "Above and slightly in front of the head, sliced, not smashed."], ["Serve", "Rule: underhand, after a bounce, contact at or below the waist."]]},
  tt: {lo: 3.9, hi: 6.6, sweet: 5.1, height: "Just above table height: the top of the bounce for topspin, a little lower and later when looping backspin.",
    front: "In front of the body, about a forearm's length. Forehand slightly toward your left (hitting) side, backhand in front of your middle.",
    away: "Close, elbow near your side.",
    bounce: "At the peak, or just before it for counters and blocks.",
    shots: [["Serve", "Rule: toss at least 16 cm from an open palm; strike it behind the end line and above table height."]]},
  golf: {lo: 0, hi: 0.4, sweet: 0, height: "On the ground, or on a tee. Right-handed: your lead foot is your left.",
    front: "Short irons in the centre of your stance, long irons a ball or two forward, driver just inside your left heel.",
    away: "Let your arms hang from the shoulders: about a hand's width between the butt of the grip and your thighs.",
    bounce: "It doesn't move. Irons: on the way down, ball first, then turf (the low point is just in front of the ball). Driver: on the way up off the tee.",
    shots: [["Chip", "Ball back of centre, hands ahead, weight left."], ["Bunker", "Ball forward; hit the sand a couple of inches behind it, not the ball."]]}
};
const heightName = v => LANDMARKS.reduce((a, b) => Math.abs(b[1] - v) < Math.abs(a[1] - v) ? b : a)[0];

// Range chart: one row per sport, ground on the left, head on the right.
function contactChart(list, sel, interactive) {
  const W = 340, L = 96, R = 10, T = 22, RH = 26, H = T + list.length * RH + 4;
  const x = v => L + (W - L - R) * v / HMAX;
  const grid = HEIGHTS.map(([n, v]) => `<line x1="${x(v)}" x2="${x(v)}" y1="${T - 4}" y2="${H - 4}" stroke="var(--line)" stroke-dasharray="2 3"/><text x="${x(v)}" y="12" text-anchor="${v === 0 ? "start" : v > 9 ? "end" : "middle"}" fill="var(--muted)" font-size="11">${n}</text>`).join("");
  const rows = list.map((k, i) => {
    const c = C[k], y = T + i * RH, on = k === sel, w = Math.max(x(c.hi) - x(c.lo), 8);
    return `<g class="crow${on ? " on" : ""}" data-k="${k}"${interactive ? ` role="button" tabindex="0" aria-pressed="${on}"` : ""} aria-label="${S[k].n}: ${heightName(c.lo)} to ${heightName(c.hi)}"><title>${S[k].n}: ${heightName(c.lo)} to ${heightName(c.hi)}, ideal near the ${heightName(c.sweet)}</title>
      <rect x="0" y="${y}" width="${W}" height="${RH}" fill="transparent"/>
      <text x="0" y="${y + 17}" fill="${on ? "var(--fg)" : "var(--fg-dim)"}" font-size="12"${on ? ' font-weight="700"' : ""}>${S[k].n}</text>
      <rect x="${x(c.lo)}" y="${y + 7}" width="${w}" height="12" rx="4" fill="var(--accent)" fill-opacity="${on ? 0.85 : 0.4}"/>
      <circle cx="${Math.max(x(c.sweet), L + 5)}" cy="${y + 13}" r="5" fill="var(--ball)" stroke="var(--bg-1)" stroke-width="2"/></g>`;
  }).join("");
  return `<svg class="cchart" viewBox="0 0 ${W} ${H}" width="100%" role="${interactive ? "group" : "img"}" aria-label="Contact height by sport">${grid}${rows}</svg>`;
}

let csel = "squash";
function renderContact() {
  $("#cmap").innerHTML = contactChart(keys, csel, true);
  $("#cmap").querySelectorAll(".crow").forEach(g => {
    const pick = () => { csel = g.dataset.k; renderContact(); save(); $(`#cmap .crow[data-k="${csel}"]`).focus(); };
    g.onclick = pick;
    g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } };
  });
  const c = C[csel];
  $("#csport").value = csel;
  $("#cdetail").innerHTML = `<h2>${S[csel].n}: where to hit it</h2>
    <dl class="facts"><dt>Height</dt><dd>${c.height}</dd><dt>In front</dt><dd>${c.front}</dd><dt>From body</dt><dd>${c.away}</dd><dt>Bounce</dt><dd>${c.bounce}</dd>
    ${c.shots.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>`;
}

const $ = s => document.querySelector(s);
const sportOptions = v => keys.map(k => `<option value="${k}"${k === v ? " selected" : ""}>${S[k].n}</option>`).join("");
const glyph = p => {
  const a = 20 + 11 * p, b = 20 - 11 * p;
  return `<svg class="glyph" width="44" height="40" viewBox="0 0 44 40" aria-hidden="true"><path d="M4 ${a} Q22 ${a > b ? a + 4 : a + 10} 40 ${b}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/><circle cx="22" cy="${(a + b) / 2 + (a > b ? 2 : 5)}" r="3.5" fill="var(--ball)" stroke="var(--bg)" stroke-width="1"/></svg>`;
};
const bar = v => `<span class="bar" style="width:${v * 10}px"></span>${v}`;
const lc = s => s.charAt(0).toLowerCase() + s.slice(1);

function contactMove(f, t) {
  const a = C[f].sweet, b = C[t].sweet, from = heightName(a), to = heightName(b);
  if (Math.abs(b - a) < 1) return `Contact stays around ${to} height.`;
  return `Contact ${b < a ? "drops" : "rises"}${from === to ? "" : ` from ${from} to ${to}`} height${b < a ? ": get down to it" : ": let it come up to you"}.`;
}

function cuesFor(f, t) {
  const A = S[f], B = S[t];
  if (f === t) return [`Same sport: your cue is "${B.cue}"`, "Pick one detail from the table below to hold all session.", `Film a ${t === "golf" ? "swing" : "rally"} and check it against the path: ${lc(B.path)}.`];
  const out = [`Today's swing: ${B.cue}`];
  if (t === "golf") return [...out, TO_GOLF_HAND, TO_GOLF[f]];
  if (f === "golf") out.push(FROM_GOLF_HAND);
  const dp = B.p - A.p;
  // The direction comes from the target's own path, not just the difference.
  if (dp >= 0.6) out.push(B.p >= 0.3 ? `Change the path: start the head below the ball and swing up. ${A.n} wants you to go down; ${B.n} doesn't.`
    : B.p <= -0.3 ? `Shallower: still high to low, but less chop than ${A.n}.`
    : "Flatten the path: swing level through the ball, no chopping down.");
  else if (dp <= -0.6) out.push(B.p <= -0.3 ? `Stop brushing up. Start high and swing down through the ball, with a ${lc(B.face)} face.`
    : B.p >= 0.3 ? `Flatter: still low to high, but less brush than ${A.n}.`
    : "Flatten the path: swing level through the ball, no brushing up.");
  const db = B.back - A.back;
  if (db <= -2) out.push("Cut the backswing roughly in half. Prepare early and short.");
  else if (db >= 2) out.push(`Let the backswing grow: ${lc(B.backT)}.`);
  const dw = B.wrist - A.wrist;
  if (dw <= -2) out.push("Lock the wrist. Swing from the shoulder and keep the face steady.");
  else if (dw >= 2) out.push(`Free the wrist. Let the head whip through: ${lc(B.wristT)}.`);
  if (Math.abs(B.fa - A.fa) >= 2 && Math.abs(dp) < 0.6) out.push(B.fa < A.fa ? `Open the face: ${lc(B.face)}.` : `Close the face down: ${lc(B.face)}.`);
  if (A.spot !== B.spot || Math.abs(B.hn - A.hn) >= 1.5) out.push(`${contactMove(f, t)} ${B.spot}.`);
  const df = B.fin - A.fin;
  if (Math.abs(df) >= 2) out.push(df < 0 ? `Shorter finish: ${lc(B.finT)}.` : `Longer finish: ${lc(B.finT)}.`);
  return out.slice(0, 4);
}

function renderSwitch() {
  const f = $("#from").value, t = $("#to").value, A = S[f], B = S[t];
  $("#cues").innerHTML = cuesFor(f, t).map(c => `<li>${c}</li>`).join("");
  $("#warm").textContent = B.warm || RACQUET_WARM;
  $("#cswitch").innerHTML = (f === t ? contactChart([t], t) : contactChart([f, t], t)) + `<p class="small">${f === t ? C[t].height : `${contactMove(f, t)} ${C[t].height}`}</p>`;
  const rows = [
    ["Hand", A.hand, B.hand, A.hand !== B.hand],
    ["Path", A.path, B.path, Math.abs(B.p - A.p) >= 0.6],
    ["Backswing", A.backT, B.backT, Math.abs(B.back - A.back) >= 2],
    ["Contact height", A.h, B.h, Math.abs(B.hn - A.hn) >= 1.5],
    ["Contact spot", A.spot, B.spot, false],
    ["Wrist", A.wristT, B.wristT, Math.abs(B.wrist - A.wrist) >= 2],
    ["Face", A.face, B.face, Math.abs(B.fa - A.fa) >= 2],
    ["Finish", A.finT, B.finT, Math.abs(B.fin - A.fin) >= 2],
    ["Grip", A.grip, B.grip, false]
  ];
  $("#diff").innerHTML = `<div class="row head"><span></span><span>${glyph(A.p)}${A.n}</span><span>${glyph(B.p)}${B.n}</span></div>` +
    rows.map(r => `<div class="row${r[3] && f !== t ? " big" : ""}"><span class="k">${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join("");
  save();
}

let miss = null;
function renderDiag() {
  const s = $("#dsport").value;
  $("#misses").innerHTML = M[s].map((m, i) => `<button type="button" aria-pressed="${i === miss}" data-i="${i}">${m[0]}</button>`).join("");
  $("#misses").querySelectorAll("button").forEach(b => b.onclick = () => { miss = +b.dataset.i; renderDiag(); });
  if (miss === null || !M[s][miss]) { $("#fix").innerHTML = `<p class="small">Pick the miss you see most often.</p>`; return; }
  const m = M[s][miss];
  $("#fix").innerHTML = `<div class="card"><h2>${m[0]}</h2><p>Likely leaking in from: ${m[1].split(", ").map(k => `<span class="tag">${S[k].n}</span>`).join("")}</p>
    <h3>Why</h3><p>${m[2]}</p><h3>Fix</h3><p>${m[3]}</p><h3>Drill</h3><p>${m[4]}</p></div>`;
}

function renderAll() {
  $("#tbl").innerHTML = `<tr><th>Sport</th><th>Hand</th><th>Path</th><th>Backswing</th><th>Contact</th><th>Wrist</th><th>Face</th><th>Finish</th></tr>` +
    keys.map(k => { const s = S[k]; return `<tr><td>${s.n}</td><td class="hand">${s.hand}</td><td>${glyph(s.p)}${s.path}</td><td>${bar(s.back)}</td><td>${s.h}; ${lc(s.spot)}</td><td>${bar(s.wrist)}</td><td>${s.face}</td><td>${bar(s.fin)}</td></tr>`; }).join("");
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let week = {days: ["squash", "tennis", "", "padel", "pickle", "real", "golf"], focus: ""};
function renderWeek() {
  $("#focus").value = week.focus || "";
  $("#days").innerHTML = DAYS.map((d, i) => {
    const v = week.days[i] || "";
    let prev = "";
    for (let j = 1; j < 7; j++) { const p = week.days[(i - j + 7) % 7]; if (p) { prev = p; break; } }
    const note = v && prev && prev !== v ? `<div class="note">Coming from ${S[prev].n}. <strong>${cuesFor(prev, v)[v === "golf" ? 2 : 1] || S[v].cue}</strong></div>` : v ? `<div class="note">${S[v].cue}</div>` : "";
    return `<div class="day"><b>${d}</b><div><select data-d="${i}" aria-label="${d} sport"><option value="">Rest</option>${sportOptions(v)}</select>${note}</div></div>`;
  }).join("");
  $("#days").querySelectorAll("select").forEach(s => s.onchange = () => {
    week.days[+s.dataset.d] = s.value; save(); renderWeek();
    $(`#days select[data-d="${s.dataset.d}"]`).focus();
  });
}

const tabs = [...document.querySelectorAll("[role=tab]")];
function selectTab(tab, focus) {
  tabs.forEach(x => {
    const on = x === tab;
    x.setAttribute("aria-selected", on);
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) tab.focus();
  save();
}
tabs.forEach((b, i) => {
  b.onclick = () => selectTab(b);
  b.onkeydown = e => {
    const n = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1}[e.key];
    if (n === undefined) return;
    e.preventDefault();
    selectTab(tabs[(n + tabs.length) % tabs.length], true);
  };
});
const currentTab = () => (tabs.find(x => x.getAttribute("aria-selected") === "true") || tabs[0]).getAttribute("aria-controls");

let ready = false;
function save() {
  if (!ready) return;
  try { localStorage.setItem("swingswitch", JSON.stringify({week, from: $("#from").value, to: $("#to").value, contact: csel, tab: currentTab()})); } catch (e) {}
}

let st = {};
try { st = JSON.parse(localStorage.getItem("swingswitch") || "{}") || {}; } catch (e) {}
const valid = k => keys.includes(k);
if (st.week && Array.isArray(st.week.days)) {
  week.days = DAYS.map((_, i) => valid(st.week.days[i]) ? st.week.days[i] : "");
  week.focus = typeof st.week.focus === "string" ? st.week.focus : "";
}
$("#from").innerHTML = sportOptions(valid(st.from) ? st.from : "tennis");
$("#to").innerHTML = sportOptions(valid(st.to) ? st.to : "squash");
$("#dsport").innerHTML = sportOptions("squash");
$("#csport").innerHTML = sportOptions(csel = valid(st.contact) ? st.contact : "squash");
$("#csport").onchange = () => { csel = $("#csport").value; renderContact(); save(); };
$("#from").onchange = $("#to").onchange = renderSwitch;
$("#dsport").onchange = () => { miss = null; renderDiag(); };
$("#focus").oninput = e => { week.focus = e.target.value; save(); };
renderSwitch(); renderDiag(); renderAll(); renderWeek(); renderContact();
const startTab = tabs.find(x => x.getAttribute("aria-controls") === st.tab);
if (startTab) selectTab(startTab);
ready = true;
