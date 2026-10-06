// Swing switch. Racquet sports are played left-handed, golf right-handed.
// p: swing path, -1 (steep high to low) to 1 (low to high).
// back/wrist/fin: 1 (smallest, firmest) to 5. hn: contact height, 0 (ground) to 5.
// fa: face, -2 (very open) to 2 (closed).
const RACQUET_WARM = "Before the warm-up: 10 slow shadow swings (5 forehand, 5 backhand) saying cue 1 out loud. Exaggerate the change; it'll feel wrong, which is the point.";
const S = {
  squash: {n: "Squash", hand: "Left", p: -0.7, path: "High to low", back: 3, backT: "Racquet up early, compact", h: "Shin to knee", hn: 1.5, spot: "Beside front foot", wrist: 3, wristT: "Cocked, forearm-driven", face: "Open", fa: -1, fin: 2, finT: "Short, checked", grip: "Continental", cue: "Racquet up early, swing down through, stop short."},
  tennis: {n: "Lawn tennis", hand: "Left", p: 0.8, path: "Low to high", back: 5, backT: "Full loop", h: "Waist", hn: 3, spot: "Well out in front", wrist: 3, wristT: "Laid back, natural release", face: "Closing, brushing up", fa: 1, fin: 5, finT: "Over the shoulder", grip: "Eastern or semi-western", cue: "Drop the head below the ball, brush up, finish high."},
  real: {n: "Real tennis", hand: "Left", p: -0.9, path: "High to low, heavy cut", back: 4, backT: "High and long", h: "Knee", hn: 1.5, spot: "Beside to slightly behind front foot", wrist: 1, wristT: "Firm, locked", face: "Very open", fa: -2, fin: 3, finT: "Low and forward", grip: "Continental", cue: "Chop down, open face, finish low."},
  rackets: {n: "Rackets", hand: "Left", p: -0.6, path: "High to low, short", back: 2, backT: "Short, compact", h: "Low, near the knee", hn: 1.5, spot: "Out in front", wrist: 2, wristT: "Firm: no flick, the ball is too fast and hard", face: "Slightly open", fa: -1, fin: 2, finT: "Short, stops after contact", grip: "Continental", cue: "High to low, short, firm wrist, and stop it."},
  pickle: {n: "Pickleball", hand: "Left", p: 0.3, path: "Gentle low to high", back: 1, backT: "Minimal", h: "Below waist (dinks) to waist", hn: 2.5, spot: "Out in front", wrist: 1, wristT: "Firm", face: "Flat to slightly open", fa: 0, fin: 2, finT: "Toward the target", grip: "Continental", cue: "Swing from the shoulder, no wrist."},
  padel: {n: "Padel", hand: "Left", p: -0.3, path: "Flat to slight high to low", back: 2, backT: "Compact, head up", h: "Hip", hn: 3, spot: "Beside to slightly in front", wrist: 2, wristT: "Firm", face: "Slightly open", fa: -1, fin: 2, finT: "Short, toward target", grip: "Continental", cue: "Head up, contact at the hip, slice it."},
  tt: {n: "Table tennis", hand: "Left", p: 0.8, path: "Low to high, brushing", back: 1, backT: "Tiny", h: "Table height", hn: 3, spot: "In front of the body", wrist: 4, wristT: "Active forearm and wrist", face: "Closed", fa: 2, fin: 1, finT: "Near the forehead", grip: "Shakehand", cue: "Elbow and forearm, brush up, keep it small."},
  golf: {n: "Golf", hand: "Right", p: -0.3, path: "Down into the ball, then around", back: 5, backT: "Full shoulder turn, wrists hinged", h: "On the ground", hn: 0, spot: "Centre of stance (irons), inside left heel (driver)", wrist: 4, wristT: "Hinge back, hold it, release through", face: "Square", fa: 0, fin: 5, finT: "Full, chest to target, on the left foot", grip: "Overlap or interlock, left hand on top", cue: "Turn, hold the hinge, hit down on the back of the ball, finish facing the target.",
    warm: "Before the first tee: 10 slow practice swings saying cue 1 out loud, 5 to waist height holding the wrist hinge and 5 full to a held finish. Then a few 7-irons before the driver."}
};
const GROUPS = [
  ["Cut: high to low, open face", ["squash", "real", "rackets", "padel"]],
  ["Drive: low to high, out in front", ["tennis", "tt"]],
  ["Compact and firm", ["pickle"]],
  ["Club: right-handed", ["golf"]]
];
const keys = GROUPS.flatMap(g => g[1]);

// Golf is the other hand, so switching into or out of it gets its own cues.
const TO_GOLF_HAND = "Switch sides: you golf right-handed, so your left arm leads. Borrow your backhand, not your forehand: left hand at the top of the grip, back of the left hand facing the target at impact.";
const FROM_GOLF_HAND = "Back to the left hand, and the ball moves: split-step, prepare early, and recover to ready instead of holding the finish.";
const TO_GOLF = {
  squash: "Squash is all cut. Square the face and swing from the inside, or the ball slices.",
  tennis: "No topspin roll-over. Turn your chest through and keep the hands quiet, or it hooks.",
  real: "A real tennis chop is a slice with a club. Square face, shallower path from the inside.",
  rackets: "Rackets is a short, firm chop. Make a full turn and square the face, or the ball slices.",
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
    ["Balls flying long", "rackets, padel", "The short, cutting rackets stroke or an open padel face is taking topspin off.", "More brush, slightly closed face, aim higher over the net and let spin bring it down.", "Rally to the service line only, with obvious net clearance."],
    ["Late, jammed contact", "squash, real", "You're letting the ball reach your body like in the court sports.", "Turn early and meet the ball well out in front.", "Ball machine or feed: call 'turn' at the bounce, 'hit' in front."]],
  real: [
    ["Ball kicks up, no cut", "tennis, tt", "Topspin habits from tennis and table tennis are closing the face.", "Open the face, swing down, finish low and forward.", "Feed 20 forehands and check each one skids rather than kicks."],
    ["Ball into the net or dropping short", "squash", "Squash's short checked finish is cutting the stroke off.", "Longer, flatter path through contact; let the follow-through travel.", "Rally to length, aiming for the ball to die near the back wall."]],
  rackets: [
    ["Ball too high off the front wall", "tennis, tt, pickle", "Low-to-high habits from tennis, table tennis or pickleball are lifting it.", "Start the racket above the ball and swing down through it, firm wrist, short stop.", "10 drives at a target just above the board, freezing the short finish each time."],
    ["Mishits at pace", "tennis, squash, golf", "A big tennis, squash or golf backswing is too slow for rackets pace.", "Shorter preparation, like real tennis: racket up early, firm wrist, short stop.", "Volley to yourself against the wall at short range, racquet barely going back."]],
  pickle: [
    ["Dinks popping up", "squash, tt", "Wrist action from the wristy sports is flicking the paddle face open.", "Lock the wrist, lift from the shoulder, set the paddle face early.", "50 crosscourt dinks, freezing the paddle after each."],
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
    ["Slice: the ball curves away to the right", "squash, real, rackets, padel", "The cut sports have trained an open face and an out-to-in path across the ball. With a club, that's a slice.", "Square the face and swing from the inside: feel the club come from behind you and exit to the right of the target, forearms rotating through.", "Headcover a few inches outside and behind the ball; 20 half swings with a 7-iron without touching it."],
    ["Push or block: straight right", "pickle, padel", "Firm-wrist sports, plus a strong left arm that wants to pull, keep the face from closing.", "Let the right hand and forearm release through impact; the right palm faces the ground just after the ball.", "Split-hand half swings (hands a couple of inches apart on the grip), feeling the right hand pass the left. 20 balls."],
    ["Hook or pull-hook", "tennis, tt", "Topspin roll-over is shutting the face through impact.", "Keep turning your chest through and let the body square the face, not the hands.", "20 three-quarter swings, freezing at waist height in the follow-through with the toe of the club pointing up."],
    ["Thin or topped", "tennis, pickle, tt", "Low-to-high habits have you swinging up at a ball that's sitting on the ground.", "Weight on the left foot at impact; hit down on the back of the ball and let the loft get it airborne.", "Ball on a line (or in front of a towel) on the ground; 20 swings where the divot starts on the target side of it."],
    ["Fat shots and flippy hands", "squash, tt", "The wristy sports release the hinge early, so the clubhead passes your hands before the ball.", "Hands ahead of the ball at impact, left wrist flat. Hold the angle longer than feels right.", "Hip-to-hip half swings, pausing at impact with the hands over your left thigh; 20 balls."],
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
// Pass grouped=true to split rows under the swing-family headings.
function contactChart(list, sel, interactive, grouped) {
  const W = 340, L = 96, R = 10, T = 22, RH = 26, GH = 22;
  const x = v => L + (W - L - R) * v / HMAX;
  const sections = grouped ? GROUPS.map(([label, ks]) => [label, ks.filter(k => list.includes(k))]).filter(g => g[1].length) : [["", list]];
  let y = T, rows = "";
  for (const [label, ks] of sections) {
    if (label) { rows += `<text x="0" y="${y + 15}" fill="var(--sky)" font-size="11"># ${label.split(":")[0].toLowerCase()}</text>`; y += GH; }
    for (const k of ks) {
      const c = C[k], on = k === sel, w = Math.max(x(c.hi) - x(c.lo), 8);
      rows += `<g class="crow${on ? " on" : ""}" data-k="${k}"${interactive ? ` role="button" tabindex="0" aria-pressed="${on}"` : ""} aria-label="${S[k].n}: ${heightName(c.lo)} to ${heightName(c.hi)}"><title>${S[k].n}: ${heightName(c.lo)} to ${heightName(c.hi)}, ideal near the ${heightName(c.sweet)}</title>
      <rect x="0" y="${y}" width="${W}" height="${RH}" fill="transparent"/>
      <text x="8" y="${y + 17}" fill="${on ? "var(--fg)" : "var(--fg-dim)"}" font-size="12"${on ? ' font-weight="700"' : ""}>${S[k].n}</text>
      <rect x="${x(c.lo)}" y="${y + 7}" width="${w}" height="12" rx="4" fill="var(--accent)" fill-opacity="${on ? 0.85 : 0.4}"/>
      <circle cx="${Math.max(x(c.sweet), L + 5)}" cy="${y + 13}" r="5" fill="var(--ball)" stroke="var(--bg-1)" stroke-width="2"/></g>`;
      y += RH;
    }
  }
  const H = y + 4;
  const grid = HEIGHTS.map(([n, v]) => `<line x1="${x(v)}" x2="${x(v)}" y1="${T - 4}" y2="${H - 4}" stroke="var(--line)" stroke-dasharray="2 3"/><text x="${x(v)}" y="12" text-anchor="${v === 0 ? "start" : v > 9 ? "end" : "middle"}" fill="var(--muted)" font-size="11">${n}</text>`).join("");
  return `<svg class="cchart" viewBox="0 0 ${W} ${H}" width="100%" role="${interactive ? "group" : "img"}" aria-label="Contact height by sport">${grid}${rows}</svg>`;
}

let csel = "squash";
function renderContact() {
  $("#cmap").innerHTML = contactChart(keys, csel, true, true);
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
const sportOptions = v => GROUPS.map(([label, ks]) => `<optgroup label="${label}">${ks.map(k => `<option value="${k}"${k === v ? " selected" : ""}>${S[k].n}</option>`).join("")}</optgroup>`).join("");
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

const pathDir = p => p >= 0.3 ? "up" : p <= -0.3 ? "down" : "flat";
function pathCue(A, B) {
  const face = `${/^[aeiou]/i.test(B.face) ? "an" : "a"} ${lc(B.face)}`, from = pathDir(A.p), to = pathDir(B.p);
  if (to === "up") return from === "up" ? `More lift: start lower under the ball and finish higher than ${A.n}.`
    : `Change the path: start the head below the ball and swing up. ${A.n} ${from === "down" ? "goes down" : "stays flat"}; ${B.n} swings up.`;
  if (to === "down") return from === "down" ? (B.p < A.p ? `Steeper: chop down more than ${A.n}, with ${face} face.` : `Shallower: still high to low, but less chop than ${A.n}.`)
    : `${from === "up" ? "Stop brushing up. " : ""}Start high and swing down through the ball, with ${face} face.`;
  return `Flatten the path: swing level through the ball, no ${from === "up" ? "brushing up" : "chopping down"}.`;
}

function cuesFor(f, t) {
  const A = S[f], B = S[t];
  if (f === t) return [`Same sport: your cue is "${B.cue}"`, "Pick one detail from the table below to hold all session.", `Film a ${t === "golf" ? "swing" : "rally"} and check it against the path: ${lc(B.path)}.`];
  const out = [`Today's swing: ${B.cue}`];
  if (t === "golf") return [...out, TO_GOLF_HAND, TO_GOLF[f]];
  if (f === "golf") out.push(FROM_GOLF_HAND);
  const dp = B.p - A.p;
  // Wording depends on which way both swings actually go, not just the difference.
  if (Math.abs(dp) >= 0.6) out.push(pathCue(A, B));
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
  $("#misses").querySelectorAll("button").forEach(b => b.onclick = () => { miss = +b.dataset.i; renderDiag(); $(`#misses button[data-i="${miss}"]`).focus(); });
  if (miss === null || !M[s][miss]) { $("#fix").innerHTML = `<p class="small">Pick the miss you see most often.</p>`; return; }
  const m = M[s][miss];
  $("#fix").innerHTML = `<div class="card"><h2>${m[0]}</h2><p>Likely leaking in from: ${m[1].split(", ").map(k => `<span class="tag">${S[k].n}</span>`).join("")}</p>
    <h3>Why</h3><p>${m[2]}</p><h3>Fix</h3><p>${m[3]}</p><h3>Drill</h3><p>${m[4]}</p></div>`;
}

function renderAll() {
  $("#tbl").innerHTML = `<tr><th>Sport</th><th>Hand</th><th>Path</th><th>Backswing</th><th>Contact</th><th>Wrist</th><th>Face</th><th>Finish</th></tr>` +
    GROUPS.map(([label, ks]) => `<tr class="grp"><th colspan="8"># ${label}</th></tr>` + ks.map(k => { const s = S[k]; return `<tr><td>${s.n}</td><td class="hand">${s.hand}</td><td>${glyph(s.p)}${s.path}</td><td>${bar(s.back)}</td><td>${s.h}; ${lc(s.spot)}</td><td>${bar(s.wrist)}</td><td>${s.face}</td><td>${bar(s.fin)}</td></tr>`; }).join("")).join("");
}

// Solo practice. Each session is [minutes, block, how, target]; drill ~10, short ~20, long ~30.
const LENS = {drill: 10, short: 20, long: 30};
const P = {
  squash: {kit: "Racquet, a ball you've warmed up, eyewear.",
    drill: [[3, "Forehand rails", "Straight drives from behind the short line, hugging the side wall. Racquet up early, short finish.", "Land past the short line, 10 in a row"],
      [3, "Backhand rails", "Same on the backhand. Contact beside your front (left) foot, shoulders to the side wall.", "10 in a row, none off the side wall early"],
      [4, "Figure-8 volleys", "Just in front of the T, volley crosscourt high into the front corners so it comes back to the other side. Forehand, backhand, repeat.", "20 volleys without a bounce"]],
    short: [[2, "Ghost", "Six corners, no ball: split-step on the T, lunge, recover. Racquet up every time.", "Back to the T after every lunge"],
      [4, "Forehand drives", "Deep straight drives, front wall a racquet-head above the service line.", "Past the short line, tight"],
      [4, "Backhand drives", "Same on the backhand. Stop the finish short.", "Past the short line, tight"],
      [4, "Straight volleys", "Behind the short line, volley straight to yourself, both sides. Punch, don't swing.", "15 in a row each side"],
      [3, "Figure-8 volleys", "Crosscourt into the front corners, alternating sides.", "20 without a bounce"],
      [3, "Drops", "Feed short to yourself, then drop straight. Open face, soft hands, hold the finish.", "Second bounce before the service line"]],
    long: [[3, "Warm the ball + ghost", "Easy rallies until the ball's warm, then a minute of six-corner ghosting.", "Racquet up every lunge"],
      [5, "Forehand drives", "Deep straight drives. Racquet up early, swing down through, stop short.", "10 in a row past the short line"],
      [5, "Backhand drives", "Same on the backhand, contact beside the front (left) foot.", "10 in a row past the short line"],
      [4, "Straight volleys", "Behind the short line, both sides. Punch it, short finish.", "15 in a row each side"],
      [4, "Figure-8 volleys", "Crosscourt into the front corners from just in front of the T.", "30 without a bounce"],
      [4, "Boast-drive", "Boast from the back, run to the front, drive straight off the boast. Repeat both sides.", "Drive lands deep and tight"],
      [3, "Drops", "Self-fed straight drops, both sides.", "Second bounce before the service line"],
      [2, "Serves", "Lob serves from both boxes onto the side wall high, dropping into the back corner.", "Hits the side wall above the service line"]]},
  tennis: {kit: "Racquet, a basket of balls, a hitting wall or an empty court.",
    drill: [[2, "Shadow swings", "Five forehand, five backhand, slow. Drop the head, brush up, finish high.", "Hold every finish"],
      [4, "Drop-feed forehands", "Drop the ball beside you, step in, hit crosscourt with height over the net.", "Lands past the service line"],
      [4, "Drop-feed backhands", "Same on the backhand. Contact out in front of the front (left) foot.", "Lands past the service line"]],
    short: [[3, "Wall mini-tennis", "Close to the wall, soft topspin, one bounce. Warm the timing.", "30 in a row"],
      [5, "Wall forehands", "Back up, rally forehands off one bounce. Out in front, low to high.", "15 in a row"],
      [5, "Wall backhands", "Same on the backhand side.", "15 in a row"],
      [3, "Wall volleys", "Two metres from the wall, short punches, no swing.", "20 in a row"],
      [4, "Serves", "Half a basket. Same toss every time; land them deep.", "7 of 10 in"]],
    long: [[3, "Shadow + split-step", "Shadow forehands and backhands with a split-step before each one.", "Hold every finish"],
      [6, "Wall forehands", "Rally forehands off one bounce, aiming above a line at net height.", "20 in a row"],
      [6, "Wall backhands", "Same on the backhand side.", "20 in a row"],
      [3, "Alternate", "Forehand, backhand, forehand. Turn early, meet it out in front.", "10 in a row"],
      [4, "Wall volleys", "Close to the wall, punch volleys, then step back for a few half-volleys.", "20 in a row"],
      [8, "Serves", "A basket from each side: four wide, four T, then second serves with spin.", "7 of 10 first, 9 of 10 second"]]},
  real: {kit: "A basket of balls, your racquet. Your own list, in order.",
    drill: [[4, "Cut volleys", "Close to the main wall, volley it back to yourself: open face, short chop down and through.", "20 in a row, below shoulder height"],
      [3, "Serve side forehand, main-wall low bounce feed", "Feed softly off the main wall so it stays low. Let it drop below the knee, then chop the forehand.", "Skids, doesn't kick"],
      [3, "Serve", "Every serve touches the side penthouse; aim for it to die near the grille wall.", "8 of 10 good"]],
    short: [[3, "Cut volleys", "Open face, short chop down and through, ball below shoulder height.", "20 in a row"],
      [4, "Return corner backhands", "Feed into the return corner, let it come out and drop, then cut the backhand to length.", "Ball dies near the back wall"],
      [4, "Grille corner roll forehands", "Roll it into the grille corner, wait for it to come out, get low and chop the forehand.", "Skids, doesn't kick"],
      [3, "Serve side backhand, main-wall bounce feed", "Feed off the main wall, let it bounce, cut the backhand. Contact at the knee, beside the front (left) foot.", "Low over the net"],
      [3, "Serve side forehand, main-wall low bounce feed", "Softer feed so it stays low. Let it drop, then chop down and finish low.", "Skids, doesn't kick"],
      [3, "Serve", "Railroads off the side penthouse, dropping tight near the grille wall.", "8 of 10 good"]],
    long: [[2, "Shadow cuts", "Ten slow cuts each side: chop down, open face, finish low.", "Finish low every time"],
      [5, "Cut volleys", "Close to the main wall, open face, short chop down and through.", "30 in a row"],
      [5, "Return corner backhands", "Feed into the return corner, let it come out and drop, cut the backhand to length.", "Ball dies near the back wall"],
      [5, "Grille corner roll forehands", "Roll it into the grille corner, let it come out, get down to it and chop.", "Skids, doesn't kick"],
      [4, "Serve side backhand, main-wall bounce feed", "Feed off the main wall, let it bounce, cut the backhand at the knee.", "Low over the net"],
      [4, "Serve side forehand, main-wall low bounce feed", "Soft feed, low bounce. Wait for it below the knee, then chop the forehand.", "Skids, doesn't kick"],
      [5, "Serve", "A basket. Every one touches the side penthouse; mix heights and cut.", "8 of 10 die near the grille wall"]]},
  rackets: {kit: "Racket, a few balls, eye guards. The ball is hard; keep the volleys short-range.",
    drill: [[4, "Short-range volleys", "A few metres off the front wall, volley to yourself. Racket up early, barely any backswing.", "20 in a row"],
      [3, "Forehand drives", "High to low, short, firm wrist, and stop it. Aim just above the board.", "8 of 10 low and clean"],
      [3, "Backhand drives", "Same on the backhand, contact out in front of the front (left) foot.", "8 of 10 low and clean"]],
    short: [[2, "Shadow", "Short, firm, high-to-low swings both sides. Stop each one after contact.", "No flick"],
      [4, "Short-range volleys", "Volley to yourself off the front wall, compact punch.", "20 in a row"],
      [4, "Forehand drives", "Drives just above the board, to length.", "8 of 10 low and clean"],
      [4, "Backhand drives", "Same on the backhand.", "8 of 10 low and clean"],
      [2, "Low pickups", "Feed short and low, get your body down to it, half-volley it to length.", "Stay down through it"],
      [4, "Serves", "From each box to the opposite back quarter.", "8 of 10 in"]],
    long: [[3, "Shadow", "Short, firm, high-to-low swings both sides; stop after contact.", "No flick"],
      [5, "Short-range volleys", "Volley to yourself off the front wall, racket barely going back.", "30 in a row"],
      [5, "Forehand drives", "Drives just above the board. Meet it out in front.", "10 low and clean"],
      [5, "Backhand drives", "Same on the backhand.", "10 low and clean"],
      [4, "Low pickups", "Short, low feeds. Get down, half-volley to length.", "Stay down through it"],
      [5, "Serves", "From each box to the opposite back quarter.", "8 of 10 in"],
      [3, "Solo rally", "Keep it going off the front wall, alternating sides.", "15 in a row"]]},
  pickle: {kit: "Paddle, a few balls, a wall, a couple of targets (towels or cones).",
    drill: [[4, "Wall dinks", "Close to the wall, soft dinks off one bounce. Lift from the shoulder, no wrist.", "30 in a row"],
      [3, "Rapid wall volleys", "Step in close, volley quickly with the paddle out in front.", "25 in a row"],
      [3, "Serves", "Deep serves to a towel in the back third, both sides.", "7 of 10 deep"]],
    short: [[4, "Wall rally", "Groundstrokes off one bounce, short swing, finish at chest height.", "20 in a row"],
      [4, "Wall dinks", "Soft and low, paddle face set early.", "30 in a row"],
      [3, "Drop-feed drives", "Drop the ball, half swing, drive deep through the middle.", "Lands before the baseline"],
      [5, "Third-shot drops", "From the baseline, soft arcing shots into the kitchen. Count the ones that land in.", "6 of 10 in the kitchen"],
      [4, "Serves", "Corners and deep middle, both sides.", "8 of 10 in, 5 deep"]],
    long: [[5, "Wall rally", "Groundstrokes off one bounce, short swing.", "25 in a row"],
      [5, "Wall dinks", "Soft and low, both sides, paddle frozen after each.", "40 in a row"],
      [4, "Rapid wall volleys", "Close to the wall, paddle out in front, firm wrist.", "30 in a row"],
      [4, "Drop-feed drives", "Half swing, finish at chest height, aim deep.", "Lands before the baseline"],
      [7, "Third-shot drops", "From the baseline into the kitchen, then from mid-court (resets).", "6 of 10 in the kitchen"],
      [5, "Serves", "Targets in the corners and deep middle.", "8 of 10 in, 5 deep"]]},
  padel: {kit: "Racket, a few balls, the court to yourself.",
    drill: [[5, "Back-glass rally", "Three or four metres off the back glass, hit into it and keep it going: forehand, backhand.", "20 in a row"],
      [5, "Off-the-glass feeds", "Toss it into the back glass, let it come out and drop to your hip, then slice it crosscourt.", "8 of 10 low over the net"]],
    short: [[2, "Racket taps", "Bounce the ball on the face, then the other face, then alternate.", "50 taps"],
      [5, "Back-glass rally", "Forehand, backhand, keep it going off the back glass.", "20 in a row"],
      [5, "Off-the-glass feeds", "Let it come out, take it at the hip, slice it low.", "8 of 10 low over the net"],
      [4, "Wall volleys", "Volley against the side glass or front wall: compact, slight slice.", "20 in a row"],
      [4, "Serves", "Underhand off a bounce, below the waist, deep into the service box.", "8 of 10 deep"]],
    long: [[3, "Racket taps", "Both faces, then alternate, then a few on the edge.", "50 taps"],
      [6, "Back-glass rally", "Forehand, backhand, off the back glass.", "30 in a row"],
      [5, "Corner rebound chase", "From a back corner, hit at an angle so it comes off two walls; chase it and send it back.", "10 in a row"],
      [5, "Off-the-glass feeds", "Step away from the glass, let it come out, take it at the hip.", "8 of 10 low over the net"],
      [4, "Wall volleys", "Compact punch volleys against the glass.", "25 in a row"],
      [4, "Bandeja", "Self-feed a lob, side-on, contact above and slightly in front of the head, slice it, don't smash it.", "Lands deep and low"],
      [3, "Serves", "Underhand off a bounce, mix the glass serve and the middle.", "8 of 10 deep"]]},
  tt: {kit: "Bat, a bucket of balls, half a table (or the table folded up for playback).",
    drill: [[6, "Short backspin serves", "Serve so the second bounce would land on the table. Heavy spin, low over the net.", "7 of 10 short"],
      [4, "Shadow footwork", "Forehand, backhand, forehand from the wide side (Falkenberg), no ball. Snap back to ready.", "Four sets of 30 seconds"]],
    short: [[2, "Bat bounces", "Bounce the ball on the forehand face, then backhand, then alternate.", "50 in a row"],
      [6, "Short serves", "Backspin and no-spin, same motion, low over the net.", "7 of 10 short"],
      [4, "Long serves", "Fast and deep to the corners, landing near the end line.", "7 of 10 deep"],
      [4, "Playback rally", "Fold up half the table, rally forehand then backhand. Brush up, keep it small.", "20 in a row"],
      [4, "Shadow footwork", "Falkenberg or side-to-side, quick feet, small strokes.", "Four sets of 30 seconds"]],
    long: [[2, "Bat bounces", "Forehand face, backhand face, alternate.", "50 in a row"],
      [7, "Short serves", "Backspin, no-spin, sidespin from the same motion. Disguise it.", "7 of 10 short"],
      [5, "Long serves", "Fast and deep to both corners and the elbow.", "7 of 10 deep"],
      [6, "Playback rally", "Forehand to forehand, then backhand, then alternate.", "30 in a row"],
      [5, "Shadow footwork", "Falkenberg, side-to-side, in-and-out. Recover to ready every time.", "Five sets of 30 seconds"],
      [5, "Serve + third ball", "Serve, then shadow the third-ball loop straight away.", "Ready before the ball would be back"]]},
  golf: {kit: "A bucket, a wedge, a 7-iron, driver, putter, two headcovers or tees, a towel.",
    drill: [[3, "Feet together", "Short 7-irons with your feet together. Turn, hold the hinge, hit down.", "Solid contact, balanced finish"],
      [4, "Headcover gate", "Headcover a few inches outside and behind the ball. Half swings from the inside without touching it.", "10 clean, no headcover"],
      [3, "Line drill", "Ball on a line (or in front of the towel). The divot starts on the target side of it.", "8 of 10 ball-first"]],
    short: [[4, "Wedge half swings", "Hip-to-hip, hands ahead at impact, left wrist flat.", "Flight and distance repeat"],
      [6, "7-iron gate", "Headcover outside and behind the ball; swing from the inside and square the face.", "No slice, no headcover"],
      [4, "Driver fairways", "Pick two flags as a fairway. Full turn, finish facing the target.", "6 of 10 in the fairway"],
      [6, "Putting clock", "Balls at 3 feet around the hole like a clock. Hole them all in a row.", "12 of 12"]],
    long: [[5, "Wedge half swings", "Hip-to-hip, pause at impact with the hands over the left thigh.", "Flight and distance repeat"],
      [5, "Line drill", "Divot starts on the target side of the line.", "8 of 10 ball-first"],
      [5, "7-iron gate", "Swing from the inside past the headcover, forearms rotating through.", "No slice, no headcover"],
      [5, "Play the hole", "Driver then the iron you'd hit next, with a full routine each time.", "6 of 10 fairways"],
      [4, "Chip ladder", "Chip to towels at three distances; land it on the towel and let it run.", "Within a club length"],
      [3, "Putting clock", "Twelve 3-footers around the hole.", "12 of 12"],
      [3, "Lag ladder", "Tees at 10, 20, 30 and 40 feet. Stop each one by the tee.", "All inside 3 feet"]]}
};
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// One session at a time; the timer survives sport and length changes only until you change them.
let psport = "squash", plen = "long", pi = 0, pleft = 0, pend = 0, ptick = null, lock = null;
const blocks = () => P[psport][plen];
function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = 880; g.gain.setValueAtTime(0.2, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.5);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.5); o.onended = () => a.close();
  } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}
async function wake(on) {
  try {
    if (on && !lock && navigator.wakeLock) lock = await navigator.wakeLock.request("screen");
    if (!on && lock) { lock.release(); lock = null; }
  } catch (e) {}
}
function resetTimer(i = 0) {
  clearInterval(ptick); ptick = null; wake(false);
  pi = i; pleft = (blocks()[i] || [0])[0] * 60;
}
function step() {
  pleft = Math.max(0, Math.round((pend - Date.now()) / 1000));
  if (!pleft) {
    beep();
    if (pi + 1 < blocks().length) { pi++; pleft = blocks()[pi][0] * 60; pend = Date.now() + pleft * 1000; }
    else { clearInterval(ptick); ptick = null; wake(false); pi = blocks().length; }
  }
  renderClock();
}
function skip() {
  if (pi >= blocks().length) return;
  if (ptick) { pend = Date.now(); step(); return; }
  if (pi + 1 < blocks().length) resetTimer(pi + 1); else pi = blocks().length;
  renderClock();
}
function toggleTimer() {
  if (pi >= blocks().length) resetTimer();
  if (ptick) { clearInterval(ptick); ptick = null; wake(false); }
  else { pend = Date.now() + pleft * 1000; ptick = setInterval(step, 250); wake(true); }
  renderClock();
}
function renderClock() {
  const bs = blocks(), total = bs.reduce((a, b) => a + b[0], 0) * 60, done = pi >= bs.length;
  const gone = done ? total : bs.slice(0, pi).reduce((a, b) => a + b[0], 0) * 60 + bs[pi][0] * 60 - pleft;
  const n = 20, fill = Math.round(n * gone / total);
  $("#pnow").textContent = done ? "done. log what you hit." : bs[pi][1];
  $("#ptime").textContent = done ? "0:00" : mmss(pleft);
  $("#pbar").textContent = `[${"■".repeat(fill)}${"·".repeat(n - fill)}] ${mmss(gone)} / ${mmss(total)}`;
  $("#pgo").textContent = ptick ? "❚❚ pause" : done ? "↺ again" : gone ? "▶ resume" : "▶ start";
  $("#plist").querySelectorAll("li").forEach((li, i) => { li.className = i < pi ? "done" : i === pi ? "now" : ""; li.setAttribute("aria-current", i === pi ? "step" : "false"); });
}
function renderPractice() {
  const p = P[psport], bs = blocks();
  $("#psport").value = psport;
  document.querySelectorAll("#plen button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === plen));
  $("#ptitle").textContent = `${S[psport].n} · ${plen} · ${bs.reduce((a, b) => a + b[0], 0)} min`;
  $("#pkit").textContent = `Bring: ${lc(p.kit)}`;
  $("#pcue").textContent = `Hold one cue all session: ${S[psport].cue}`;
  $("#plist").innerHTML = bs.map(([m, n, how, goal], i) => `<li><button type="button" data-i="${i}" aria-label="Jump to ${n}"><span class="pm">${m}′</span><span><strong>${n}</strong><span class="how">${how}</span><span class="goal">${goal}</span></span></button></li>`).join("");
  $("#plist").querySelectorAll("button").forEach(b => b.onclick = () => { const run = !!ptick; resetTimer(+b.dataset.i); if (run) toggleTimer(); else renderClock(); });
  renderClock();
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let week = {days: ["squash", "tennis", "", "padel", "pickle", "real", "golf"]};
function renderWeek() {
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
  try { localStorage.setItem("swingswitch", JSON.stringify({week, from: $("#from").value, to: $("#to").value, contact: csel, practice: psport, len: plen, tab: currentTab()})); } catch (e) {}
}

let st = {};
try { st = JSON.parse(localStorage.getItem("swingswitch") || "{}") || {}; } catch (e) {}
const valid = k => keys.includes(k);
if (st.week && Array.isArray(st.week.days)) {
  week.days = DAYS.map((_, i) => valid(st.week.days[i]) ? st.week.days[i] : "");
}
$("#from").innerHTML = sportOptions(valid(st.from) ? st.from : "tennis");
$("#to").innerHTML = sportOptions(valid(st.to) ? st.to : "squash");
$("#dsport").innerHTML = sportOptions("squash");
$("#csport").innerHTML = sportOptions(csel = valid(st.contact) ? st.contact : "squash");
$("#csport").onchange = () => { csel = $("#csport").value; renderContact(); save(); };
$("#from").onchange = $("#to").onchange = renderSwitch;
$("#dsport").onchange = () => { miss = null; renderDiag(); };
psport = valid(st.practice) ? st.practice : $("#to").value;
plen = st.len in LENS ? st.len : "long";
$("#psport").innerHTML = sportOptions(psport);
$("#psport").onchange = () => { psport = $("#psport").value; resetTimer(); renderPractice(); save(); };
$("#plen").innerHTML = Object.entries(LENS).map(([k, m]) => `<button type="button" data-l="${k}">${k} <span>${m}′</span></button>`).join("");
$("#plen").querySelectorAll("button").forEach(b => b.onclick = () => { plen = b.dataset.l; resetTimer(); renderPractice(); save(); });
$("#pgo").onclick = toggleTimer;
$("#pnext").onclick = skip;
$("#preset").onclick = () => { resetTimer(); renderClock(); };
document.addEventListener("visibilitychange", () => { if (ptick && document.visibilityState === "visible") { lock = null; wake(true); } });
resetTimer();
renderSwitch(); renderDiag(); renderAll(); renderWeek(); renderContact(); renderPractice();
const startTab = tabs.find(x => x.getAttribute("aria-controls") === st.tab);
if (startTab) selectTab(startTab);
ready = true;
