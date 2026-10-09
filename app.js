/* NY Beverage Wholesale: message board + bilingual instant auto-reply */

const board = document.getElementById('board');
const LS_KEY = 'nybev_messages_v1';

function loadMessages() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function saveMessages(ms) { localStorage.setItem(LS_KEY, JSON.stringify(ms.slice(-50))); }
function esc(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderBoard() {
  const ms = loadMessages();
  board.innerHTML = ms.length ? '' : '<div class="board-empty">还没有留言 — 欢迎询价！<br>No messages yet — ask us for a quote!</div>';
  ms.forEach(m => {
    const div = document.createElement('div');
    div.className = 'msg' + (m.bot ? ' bot' : '');
    div.innerHTML = `<div class="who">${esc(m.who)}<span class="time">${esc(m.time)}</span></div><div>${esc(m.text)}</div>`;
    board.appendChild(div);
  });
  board.scrollTop = board.scrollHeight;
}

// Bilingual keyword auto-reply (Chinese + English)
function autoReply(text) {
  const t = text.toLowerCase();
  const has = (...w) => w.some(x => t.includes(x));
  if (has('价格','报价','多少钱','price','cost','quote','much'))
    return "感谢询价！批发价格根据品牌和数量而定，一件起批。请留下您要的品牌和数量，我们24小时内给您报批发价。Thanks! Wholesale pricing depends on brand & quantity (1 case minimum). Leave the brands and quantities you need and we'll quote within 24 hours.";
  if (has('送货','配送','shipping','deliver','delivery'))
    return "我们在纽约本地，配送安排请直接联系我们：917-362-3277 或 zjie2025@gmail.com，我们会尽快答复。We're based in New York — contact us at 917-362-3277 or zjie2025@gmail.com for delivery arrangements.";
  if (has('百威','budweiser','啤酒','beer','科罗娜','corona','喜力','heineken'))
    return "啤酒品牌我们常备：百威 Budweiser、百威淡啤 Bud Light、科罗娜 Corona、喜力 Heineken、莫德罗 Modelo、米开罗 Michelob Ultra 等。请告诉我们具体品牌和件数，我们报批发价。We stock major beer brands — tell us which ones and how many cases for a wholesale quote.";
  if (has('可乐','coca','pepsi','百事','雪碧','sprite','红牛','red bull','饮料','drink','soda','水','water'))
    return "饮料我们常备：可口可乐、百事、雪碧、红牛、魔爪、佳得乐、波兰泉矿泉水等。请告诉我们具体品牌和件数，我们报批发价。We stock major beverage brands — tell us which ones and how many cases for a wholesale quote.";
  if (has('一件','起批','minimum','case'))
    return "是的，我们一件起批！不用囤货，一件也按批发价。Yes — 1 case minimum! No need to stock up; even a single case gets wholesale pricing.";
  if (has('酒吧','饭店','bar','restaurant','deli','加油站','gas'))
    return "我们专门服务酒吧、饭店、加油站、Deli、熟食店等零售商，懂您的进货需求。欢迎长期合作，量大价更优！We specialize in serving bars, restaurants, gas stations, delis & grocery stores. Volume discounts available!";
  return "感谢留言！我们24小时内人工回复您。急需报价请直接打电话：917-362-3277。Thanks for your message! We'll reply personally within 24 hours. For an urgent quote call 917-362-3277.";
}

const msgForm = document.getElementById('msg-form');
const msgStatus = document.getElementById('msg-status');

msgForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(msgForm);
  const name = (fd.get('name')||'').trim(), contact = (fd.get('contact')||'').trim(), text = (fd.get('message')||'').trim();
  if (!name || !contact || !text) return;
  const now = new Date().toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  const ms = loadMessages();
  ms.push({who: name, text, time: now, bot: false});
  saveMessages(ms); renderBoard();


  setTimeout(() => {
    const ms2 = loadMessages();
    ms2.push({who: '批发站助手 (自动回复)', text: autoReply(text), time: now, bot: true});
    saveMessages(ms2); renderBoard();
  }, 900);

  msgStatus.textContent = '发送中… Sending…'; msgStatus.className = 'status';
  try {
    await fetch('https://formsubmit.co/ajax/zjie2025@gmail.com', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        _subject: `酒水批发询价 — ${name}`,
        _template: 'table',
        _autoresponse: `您好 ${name}，\n\n感谢联络纽约酒水批发站！我们已收到您的留言，24小时内人工回复您批发报价。\n\n一件起批，欢迎纽约各零售商联络。\n急需请致电：917-362-3277\n\n— 纽约酒水批发站`,
        name, contact, message: text
      })
    });
    msgStatus.textContent = '留言已发送！看上方自动回复。Message sent — see auto-reply above.';
    msgStatus.className = 'status ok';
    msgForm.reset();
  } catch {
    msgStatus.textContent = '留言已显示在板上。(邮件备份失败，但我们能看到。)';
    msgStatus.className = 'status err';
  }
});

renderBoard();


/* ---------- 啤酒在线下单 ---------- */
const BEERS = [
  {id:'budweiser', name:'Budweiser', cn:'百威', img:'images/beer-budweiser.jpg'},
  {id:'budlight', name:'Bud Light', cn:'百威淡啤', img:'images/beer-budlight.jpg'},
  {id:'corona', name:'Corona Extra', cn:'科罗娜', img:'images/beer-corona.jpg'},
  {id:'heineken', name:'Heineken', cn:'喜力', img:'images/beer-heineken.jpg'},
  {id:'modelo', name:'Modelo Especial', cn:'莫德罗', img:'images/beer-modelo.jpg'},
  {id:'ultra', name:'Michelob Ultra', cn:'米开罗超纯', img:'images/beer-michelobultra.jpg'},
];
const beerQty = {};
const beerList = document.getElementById('beer-list');

if (beerList) {
  BEERS.forEach(b => {
    beerQty[b.id] = 0;
    const row = document.createElement('div');
    row.className = 'beer-row';
    row.innerHTML = `
      <img src="${b.img}" alt="${b.name}" loading="lazy">
      <div class="bname">${b.name}<br><span>${b.cn}</span></div>
      <div class="stepper">
        <button type="button" data-act="dec" data-id="${b.id}" aria-label="减少">−</button>
        <span class="qty" id="qty-${b.id}">0</span><span class="unit">件</span>
        <button type="button" data-act="inc" data-id="${b.id}" aria-label="增加">＋</button>
      </div>`;
    beerList.appendChild(row);
  });

  const totalBar = document.createElement('div');
  totalBar.className = 'order-total';
  totalBar.innerHTML = `<span>共计 Total</span><strong><span id="total-cases">0</span> 件 cases</strong>`;
  beerList.after(totalBar);

  beerList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.dataset.id;
    beerQty[id] = Math.max(0, Math.min(999, beerQty[id] + (btn.dataset.act === 'inc' ? 1 : -1)));
    document.getElementById('qty-' + id).textContent = beerQty[id];
    document.getElementById('total-cases').textContent =
      Object.values(beerQty).reduce((a, c) => a + c, 0);
  });

  const orderForm = document.getElementById('beer-order-form');
  const orderStatus = document.getElementById('order-status');
  orderForm.addEventListener('submit', async e => {
    e.preventDefault();
    const items = BEERS.filter(b => beerQty[b.id] > 0)
      .map(b => `${b.name}(${b.cn}) x ${beerQty[b.id]}件`).join('\n');
    if (!items) {
      orderStatus.textContent = '请先选择至少一件啤酒。Please select at least 1 case.';
      orderStatus.className = 'status err';
      return;
    }
    const fd = new FormData(orderForm);
    const total = Object.values(beerQty).reduce((a, c) => a + c, 0);
    orderStatus.textContent = '提交中… Submitting…';
    orderStatus.className = 'status';
    try {
      await fetch('https://formsubmit.co/ajax/zjie2025@gmail.com', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({
          _subject: `🍺 啤酒订单 Beer Order — ${fd.get('name')}（共${total}件）`,
          _template: 'table',
          _autoresponse: `您好 ${fd.get('name')}，\n\n您的啤酒订单已收到（共 ${total} 件），我们将在隔天安排送货。\n\n订单明细：\n${items}\n\n如有问题请致电：917-362-3277\n\n— 纽约酒水批发站`,
          name: fd.get('name'), phone: fd.get('phone'),
          address: fd.get('address'), notes: fd.get('notes') || '无',
          items, total_cases: total,
          stock_confirmed_by_phone: '是 Yes'
        })
      });
      orderStatus.textContent = `✅ 订单已提交！共 ${total} 件，我们隔天安排送货。Order received — delivery the next day.`;
      orderStatus.className = 'status ok';
      orderForm.reset();
      BEERS.forEach(b => { beerQty[b.id] = 0; document.getElementById('qty-' + b.id).textContent = '0'; });
      document.getElementById('total-cases').textContent = '0';
    } catch {
      orderStatus.textContent = '提交失败，请直接打电话下单：917-362-3277';
      orderStatus.className = 'status err';
    }
  });
}
