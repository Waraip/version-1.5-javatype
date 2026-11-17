'use strict';
const L = (...lines) => lines.join('\n');
const DIFFS = {
  BEGINNER: { name: 'Beginner', time: 60, mult: 1.0, npc: 35, topics: 'variables, if-else, loops, methods' },
  INTERMEDIATE: { name: 'Intermediate', time: 90, mult: 1.5, npc: 65, topics: 'arrays, classes, overloading' },
  ADVANCED: { name: 'Advanced', time: 120, mult: 2.0, npc: 90, topics: 'OOP, exceptions, generics' }
};
const SNIPPETS = {
  BEGINNER: [
    ['Variables', L('int age = 20;', 'double price = 19.99;', "char grade = 'A';", 'boolean passed = true;', 'String name = "Alex";')],
    ['Add Method', L('public int add(int a, int b) {', '    return a + b;', '}')],
    ['If-Else', L('int score = 85;', 'if (score >= 75) {', '    System.out.println("Passed");', '} else {', '    System.out.println("Failed");', '}')],
    ['For Loop', L('for (int i = 1; i <= 5; i++) {', '    System.out.println("Count: " + i);', '}')],
    ['Arithmetic', L('int a = 17;', 'int b = 5;', 'int sum = a + b;', 'int remainder = a % b;', 'double average = (a + b) / 2.0;')],
    ['Is Even', L('public boolean isEven(int number) {', '    return number % 2 == 0;', '}')],
    ['While Loop', L('int total = 0;', 'int n = 1;', 'while (n <= 10) {', '    total += n;', '    n++;', '}')]
  ],
  INTERMEDIATE: [
    ['Array Sum', L('int[] numbers = {4, 8, 15, 16, 23, 42};', 'int sum = 0;', 'for (int number : numbers) {', '    sum += number;', '}')],
    ['Nested Loops', L('for (int row = 1; row <= 3; row++) {', '    for (int col = 1; col <= 3; col++) {', '        System.out.print(row * col + " ");', '    }', '    System.out.println();', '}')],
    ['Method Overloading', L('public int multiply(int a, int b) {', '    return a * b;', '}', '', 'public double multiply(double a, double b) {', '    return a * b;', '}')],
    ['Student Class', L('public class Student {', '    private String name;', '', '    public Student(String name) {', '        this.name = name;', '    }', '', '    public String getName() {', '        return name;', '    }', '', '    public void setName(String name) {', '        this.name = name;', '    }', '}')],
    ['Reverse String', L('public String reverse(String text) {', '    String result = "";', '    for (int i = text.length() - 1; i >= 0; i--) {', '        result += text.charAt(i);', '    }', '    return result;', '}')],
    ['Find Maximum', L('public int findMax(int[] values) {', '    int max = values[0];', '    for (int i = 1; i < values.length; i++) {', '        if (values[i] > max) {', '            max = values[i];', '        }', '    }', '    return max;', '}')]
  ],
  ADVANCED: [
    ['Abstract Class', L('public abstract class Animal {', '    protected String name;', '', '    public Animal(String name) {', '        this.name = name;', '    }', '', '    public abstract String makeSound();', '}')],
    ['Interface', L('public interface Drawable {', '    void draw();', '}', '', 'public class Circle implements Drawable {', '    @Override', '    public void draw() {', '        System.out.println("Drawing a circle");', '    }', '}')],
    ['Method Overriding', L('public class Dog extends Animal {', '    public Dog(String name) {', '        super(name);', '    }', '', '    @Override', '    public String makeSound() {', '        return name + " says Woof!";', '    }', '}')],
    ['Polymorphism', L('List<Animal> animals = new ArrayList<>();', 'animals.add(new Dog("Rex"));', 'animals.add(new Cat("Mimi"));', 'for (Animal animal : animals) {', '    System.out.println(animal.makeSound());', '}')],
    ['Exception Handling', L('public int divide(int a, int b) {', '    try {', '        return a / b;', '    } catch (ArithmeticException e) {', '        System.out.println("Cannot divide by zero");', '        return 0;', '    } finally {', '        System.out.println("Division finished");', '    }', '}')],
    ['Map and Generics', L('Map<String, Integer> scores = new HashMap<>();', 'scores.put("Alex", 95);', 'scores.put("Mia", 88);', 'for (Map.Entry<String, Integer> e : scores.entrySet()) {', '    System.out.println(e.getKey() + ": " + e.getValue());', '}')],
    ['Encapsulation', L('public class BankAccount {', '    private double balance;', '', '    public void deposit(double amount) {', '        if (amount > 0) {', '            balance += amount;', '        }', '    }', '', '    public double getBalance() {', '        return balance;', '    }', '}')]
  ]
};
const INSTRUCTIONS = `Goal: type the Java code shown on screen as fast and as accurately as you can before the countdown reaches zero.

How a round works:
 1. Pick a difficulty. Time limits: Beginner 60 s, Intermediate 90 s, Advanced 120 s.
 2. Just start typing. Letters turn bright when correct and red when wrong.
    The countdown starts at your first keystroke.
 3. The round ends on an exact match, when you press Submit, or at 0 seconds.
 4. Back leaves the round without scoring it.

Rules:
 - Every character counts: spaces, indentation, capitals, braces, quotes.
 - Indent with spaces (4 per level). Tab types 4 spaces for you.
 - Press Enter where you see the faint return arrow.
 - Backspace fixes mistakes, but every wrong letter you typed still counts as an error.

Formulas:
 Errors   = edit distance to the target + wrong letters you deleted
 Accuracy = (1 - errors / longer text length) x 100
 WPM      = (characters typed / 5) / minutes used
 Score    = min(WPM,300) x (accuracy/100)^2 x 10, +100 for a perfect round,
            then x difficulty (1.0 / 1.5 / 2.0)

Battle Mode (vs NPC):
 You and the NPC get the same snippet. After a 3-2-1 countdown, whoever types it
 EXACTLY first hits the other for 20 of 100 HP. There is no timer. First to 0 HP loses.
 The difficulty sets the snippets and the NPC speed (about 35 / 65 / 90 WPM).
 Scores are saved in your browser (localStorage).`;

// ---------- helpers ----------
const $ = id => document.getElementById(id);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n, d = 2) => Number(n).toFixed(d);
const clock = ms => { const t = Math.floor(Math.max(0, ms) / 100); return String(Math.floor(t / 600)).padStart(2, '0') + ':' + String(Math.floor(t / 10) % 60).padStart(2, '0') + '.' + (t % 10); };
const decks = {};
function nextSnippet(d) {
  if (!decks[d] || !decks[d].length) {
    decks[d] = SNIPPETS[d].map((_, i) => i).sort(() => Math.random() - 0.5);
  }
  return SNIPPETS[d][decks[d].pop()];
}
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== id));
  if (id === 'board') renderBoard(boardFilter);
  if (id === 'info') $('infoText').textContent = INSTRUCTIONS;
  if (id === 'setup') $('setupMsg').textContent = '';
}
function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}
const calcWpm = (chars, sec) => (chars <= 0 || sec <= 0) ? 0 : (chars / 5) / (sec / 60);
const calcAcc = (err, tl, ty) => { const m = Math.max(tl, ty); return m <= 0 ? 0 : Math.max(0, Math.min(100, (1 - err / m) * 100)); };
const calcScore = (wpm, acc, perfect, mult) => Math.max(0, Math.round((Math.min(wpm, 300) * (acc / 100) ** 2 * 10 + (perfect ? 100 : 0)) * mult));

// ---------- typing surface ----------
class Typer {
  constructor(el, onChange) { this.el = el; this.onChange = onChange; this.target = ''; this.typed = ''; this.corrected = 0; this.active = false; }
  setTarget(t) { this.target = t; this.typed = ''; this.corrected = 0; this.render(); }
  key(e) {
    if (!this.active || e.ctrlKey || e.metaKey || e.altKey) return;
    let add = '';
    if (e.key === 'Backspace') {
      if (this.typed.length) {
        const i = this.typed.length - 1;
        if (this.typed[i] !== this.target[i]) this.corrected++;
        this.typed = this.typed.slice(0, -1);
        e.preventDefault(); this.render(); this.onChange(); return;
      }
      return;
    }
    if (e.key === 'Enter') add = '\n';
    else if (e.key === 'Tab') add = '    ';
    else if (e.key.length === 1) add = e.key;
    else return;
    e.preventDefault();
    for (const c of add) if (this.typed.length < this.target.length) this.typed += c;
    this.render(); this.onChange();
  }
  render() {
    let h = '';
    for (let i = 0; i < this.target.length; i++) {
      const ch = this.target[i];
      let cls = i < this.typed.length ? (this.typed[i] === ch ? 'ok' : 'bad') : '';
      if (i === this.typed.length) cls += ' cur';
      h += ch === '\n' ? `<span class="nl ${cls}">↵</span>\n` : `<span class="${cls}">${esc(ch)}</span>`;
    }
    this.el.innerHTML = h;
  }
}
let activeTyper = null;
document.addEventListener('keydown', e => { if (activeTyper) activeTyper.key(e); });

// ---------- leaderboard (localStorage) ----------
const loadBoard = () => { try { return JSON.parse(localStorage.getItem('jt_board')) || []; } catch (e) { return []; } };
function recordBoard(name, diff, pts, wpm) {
  const rows = loadBoard();
  const r = rows.find(x => x.diff === diff && x.name.toLowerCase() === name.toLowerCase());
  if (r) { r.score += pts; r.rounds++; r.best = Math.max(r.best, wpm); } else rows.push({ name, diff, score: pts, rounds: 1, best: wpm });
  try { localStorage.setItem('jt_board', JSON.stringify(rows)); } catch (e) { /* storage unavailable */ }
}
let boardFilter = null;
function renderBoard(filter) {
  boardFilter = filter;
  $('tabs').innerHTML = '';
  [[null, 'Overall'], ...Object.entries(DIFFS).map(([k, v]) => [k, v.name])].forEach(([k, label]) => {
    const b = document.createElement('button');
    b.className = 'btn' + (k === filter ? ' primary' : '');
    b.textContent = label;
    b.onclick = () => renderBoard(k);
    $('tabs').appendChild(b);
  });
  const merged = {};
  loadBoard().filter(r => !filter || r.diff === filter).forEach(r => {
    const key = r.name.toLowerCase(), m = merged[key];
    if (!m) merged[key] = { ...r }; else { m.score += r.score; m.rounds += r.rounds; m.best = Math.max(m.best, r.best); }
  });
  const list = Object.values(merged).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  $('table').innerHTML = list.length
    ? '<tr><th>Rank</th><th>Player</th><th>Total score</th><th>Rounds</th><th>Best WPM</th></tr>' +
      list.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${r.score}</td><td>${r.rounds}</td><td>${fmt(r.best)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="muted">No scores yet. Press Start Game to be the first!</td></tr>';
}

// ---------- navigation + setup ----------
let mode = 'solo', diff = 'BEGINNER', playerName = 'Player';
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.mode) mode = b.dataset.mode;
  stopAll();
  show(b.dataset.go);
}));
Object.entries(DIFFS).forEach(([k, d]) => {
  const b = document.createElement('button');
  b.className = 'btn level';
  b.innerHTML = `<b>${d.name}</b><span>x${d.mult.toFixed(1)} · ${d.time}s</span><small>${d.topics}</small>`;
  b.onclick = () => {
    const n = $('name').value.trim();
    if (!n) { $('setupMsg').textContent = 'Name cannot be blank. Please try again.'; return; }
    playerName = n.replace(/[<>]/g, '').slice(0, 20) || 'Player';
    diff = k;
    mode === 'battle' ? startBattle() : startRound();
  };
  $('levels').appendChild(b);
});
function stopAll() {
  clearInterval(gTimer); clearInterval(bTimer); clearTimeout(bNext);
  gActive = false; gTyper.active = false; bTyper.active = false; activeTyper = null; bPhase = 'idle';
}

// ---------- solo game ----------
let gTimer, gActive = false, gStart = 0, gRound = 0, gSnippet, gTotal = 0, gRounds = 0;
const gTyper = new Typer($('typer'), onTyped);
function startRound() {
  gRound++;
  const [title, code] = nextSnippet(diff);
  gSnippet = { title, code };
  const d = DIFFS[diff];
  $('gHead').textContent = `Round ${gRound}   Player: ${playerName}   Difficulty: ${d.name}`;
  $('gInfo').textContent = title;
  gTyper.setTarget(code); gTyper.active = true; activeTyper = gTyper;
  gStart = 0; gActive = true; clearInterval(gTimer);
  $('clock').textContent = clock(d.time * 1000); $('wpm').textContent = 'WPM 0';
  $('gStatus').textContent = `Just start typing. The ${d.time}s countdown starts on your first keystroke.`;
  show('game');
}
function onTyped() {
  if (!gActive) return;
  if (!gStart) { gStart = performance.now(); gTimer = setInterval(tick, 100); $('gStatus').textContent = 'Countdown running. An exact match or Submit ends the round early.'; }
  tick();
  if (gActive && gTyper.typed === gSnippet.code) finishRound(performance.now());
}
function tick() {
  if (!gActive) return;
  const limit = DIFFS[diff].time * 1000, el = gStart ? performance.now() - gStart : 0;
  if (el >= limit) { finishRound(gStart + limit); return; }
  $('clock').textContent = clock(limit - el);
  $('wpm').textContent = 'WPM ' + Math.round(calcWpm(gTyper.typed.length, el / 1000));
}
function finishRound(end) {
  if (!gActive) return;
  gActive = false; gTyper.active = false; clearInterval(gTimer);
  const d = DIFFS[diff], limit = d.time * 1000;
  const el = gStart ? Math.min(limit, Math.max(0, end - gStart)) : 0;
  const target = gSnippet.code, typed = gTyper.typed;
  const errors = editDistance(target, typed) + gTyper.corrected;
  const acc = calcAcc(errors, target.length, typed.length), wpm = calcWpm(typed.length, el / 1000);
  const exact = typed === target, score = calcScore(wpm, acc, exact && !gTyper.corrected, d.mult);
  gTotal += score; gRounds++;
  recordBoard(playerName, diff, score, wpm);
  const rating = exact && acc >= 100 ? 'PERFECT! Exact match!' : acc >= 95 ? 'EXCELLENT!' : acc >= 85 ? 'GOOD JOB!' : acc >= 60 ? 'KEEP PRACTICING!' : 'TRY AGAIN!';
  $('rTitle').textContent = `RESULT - Round ${gRound}` + (el >= limit && !exact ? "  (time's up!)" : '');
  $('rSub').textContent = `${d.name}: ${gSnippet.title}`;
  $('rRating').textContent = rating;
  $('rRating').style.color = acc >= 95 ? 'var(--neon)' : acc >= 85 ? 'var(--soft)' : acc >= 60 ? 'var(--purple)' : 'var(--pink)';
  const rows = [['Time used', `${fmt(el / 1000)} of ${d.time} seconds`], ['Accuracy', fmt(acc) + '%'], ['WPM', fmt(wpm)],
    ['Errors', errors + ' character error(s)'], ['Typed', `${typed.length} of ${target.length} characters`],
    ['Exact match', exact ? 'YES' : 'NO'], ['Score', score], ['Total', `${gTotal} points in ${gRounds} round(s)`]];
  $('rStats').innerHTML = '<dl style="display:contents">' + rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('') + '</dl>';
  show('result');
}
$('gSubmit').onclick = () => finishRound(performance.now());
$('gBack').onclick = () => {
  if (gStart && gTyper.typed && !confirm('Leave this round? Your progress in this round will be lost.')) return;
  stopAll(); show('menu');
};
$('rSame').onclick = startRound;

// ---------- battle mode (vs NPC) ----------
const HP = 100, HIT = 20;
let bTimer, bNext, bPhase = 'idle', bMe = HP, bOpp = HP, bSnippet, bReadyEnd = 0, bFightStart = 0, bCps = 0;
const bTyper = new Typer($('bTyper'), onBattleTyped);
function startBattle() {
  gRound = 0; bMe = HP; bOpp = HP;
  $('bMe').textContent = playerName; $('bOpp').textContent = 'NPC ' + DIFFS[diff].name;
  $('bAgain').classList.add('hidden'); setHp(); show('battle'); battleRound();
}
function setHp() {
  [['bMe', bMe], ['bOpp', bOpp]].forEach(([id, hp]) => {
    $(id + 'Hp').textContent = hp + '/' + HP;
    const bar = $(id + 'Bar'); bar.style.width = hp + '%';
    bar.style.background = hp > 50 ? 'var(--neon)' : hp > 25 ? 'var(--purple)' : 'var(--pink)';
  });
}
function battleRound() {
  gRound++;
  const [title, code] = nextSnippet(diff);
  bSnippet = code;
  bTyper.setTarget(code); bTyper.active = false; activeTyper = bTyper;
  $('bMeProg').style.width = '0'; $('bOppProg').style.width = '0';
  $('bHead').textContent = `Round ${gRound}   ${DIFFS[diff].name}: ${title}`;
  $('bStatus').textContent = 'Get ready. Type the code exactly. The first to finish hits the other!';
  bCps = DIFFS[diff].npc * (0.85 + 0.3 * Math.random()) * 5 / 60;
  bPhase = 'ready'; bReadyEnd = performance.now() + 3000;
  clearInterval(bTimer); bTimer = setInterval(battleLoop, 50);
}
function battleLoop() {
  const now = performance.now();
  if (bPhase === 'ready') {
    const left = bReadyEnd - now;
    if (left <= 0) {
      bPhase = 'fight'; bFightStart = now; bTyper.active = true;
      $('banner').textContent = 'GO!'; setTimeout(() => { if (bPhase === 'fight') $('banner').textContent = ''; }, 600);
      $('bStatus').textContent = 'Type it! Backspace fixes mistakes. You need an exact match.';
    } else $('banner').textContent = Math.ceil(left / 1000);
  } else if (bPhase === 'fight') {
    const chars = Math.min(bSnippet.length, (now - bFightStart) / 1000 * bCps);
    $('bOppProg').style.width = (chars / bSnippet.length * 100) + '%';
    if (chars >= bSnippet.length) hit(false);
  }
}
function onBattleTyped() {
  if (bPhase !== 'fight') return;
  let c = 0; while (c < bTyper.typed.length && bTyper.typed[c] === bSnippet[c]) c++;
  $('bMeProg').style.width = (c / bSnippet.length * 100) + '%';
  if (bTyper.typed === bSnippet) hit(true);
}
function hit(youWin) {
  if (bPhase !== 'fight') return;
  bPhase = 'hit'; bTyper.active = false;
  if (youWin) bOpp = Math.max(0, bOpp - HIT); else bMe = Math.max(0, bMe - HIT);
  setHp();
  $('banner').textContent = youWin ? 'HIT!' : 'OUCH!';
  $('bStatus').textContent = youWin ? 'Direct hit! You typed it first.' : 'NPC typed it first!';
  if (bMe <= 0 || bOpp <= 0) {
    clearInterval(bTimer); bPhase = 'over';
    $('banner').textContent = bOpp <= 0 ? 'YOU WIN!' : 'YOU LOSE';
    $('banner').style.color = bOpp <= 0 ? 'var(--neon)' : 'var(--pink)';
    $('bAgain').classList.remove('hidden');
  } else {
    $('banner').style.color = '';
    bNext = setTimeout(battleRound, 1500);
  }
}
$('bAgain').onclick = () => { $('banner').style.color = ''; startBattle(); };
$('bQuit').onclick = () => { stopAll(); $('banner').style.color = ''; show('menu'); };

show('menu');
