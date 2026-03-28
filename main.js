import { createClient } from '@supabase/supabase-js';
import { DEFAULT_INVESTORS, DEFAULT_MESSAGES } from './seed-data.js';

// ============ SUPABASE CONFIG ============
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
let useSupabase = false;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    useSupabase = true;
    console.log('Supabase connected');
  } else {
    console.warn('Supabase not configured — using localStorage fallback');
  }
} catch (e) {
  console.warn('Supabase init failed, using localStorage fallback:', e);
}

// ============ SEED VERSION ============
// Bump this whenever seed-data.js is updated to force a re-seed on the live site
const SEED_VERSION = 3;

// ============ DATA ============
const STAGES = ['Identified','Reached Out','In Dialogue','Meeting Set','Met','Due Diligence','Term Sheet','Closed','Passed'];
const STAGE_CLASSES = {
  'Identified':'stage-identified','Reached Out':'stage-reached','In Dialogue':'stage-in-dialogue',
  'Meeting Set':'stage-meeting-set','Met':'stage-met','Due Diligence':'stage-dd',
  'Term Sheet':'stage-term-sheet','Closed':'stage-closed','Passed':'stage-passed'
};
const STAGE_COLORS = {
  'Identified':'#999','Reached Out':'var(--blue)','In Dialogue':'var(--purple)',
  'Meeting Set':'#9b59b6','Met':'var(--orange)','Due Diligence':'#b8860b',
  'Term Sheet':'var(--green-dark)','Closed':'var(--green-dark)','Passed':'var(--red)'
};

let investors = [];
let messages = [];

// ============ DATA LAYER ============
async function loadInvestors() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) { console.error('Load investors error:', error); return; }
    investors = data.map(row => ({
      id: row.id,
      name: row.name || '',
      fund: row.fund,
      stage: row.stage,
      priority: row.priority,
      category: row.category || '',
      contact: row.contact || '',
      intro: row.intro || '',
      emailDate: row.email_date || '',
      meetingDate: row.meeting_date || '',
      nextAction: row.next_action || '',
      nextDate: row.next_date || '',
      notes: row.notes || '',
      ticketSize: row.ticket_size || '',
      whyFit: row.why_fit || '',
      conflictCheck: row.conflict_check || '',
      fundStage: row.fund_stage || '',
      updated: row.updated_at || Date.now()
    }));
  } else {
    const storedVersion = parseInt(localStorage.getItem('kiwi_seed_version') || '0');
    const stored = localStorage.getItem('kiwi_investors');
    if (stored && storedVersion >= SEED_VERSION) {
      investors = JSON.parse(stored);
    } else {
      investors = JSON.parse(JSON.stringify(DEFAULT_INVESTORS));
      localStorage.setItem('kiwi_investors', JSON.stringify(investors));
      localStorage.setItem('kiwi_seed_version', String(SEED_VERSION));
    }
  }
}

async function saveInvestorToDB(inv) {
  const row = {
    name: inv.name,
    fund: inv.fund,
    stage: inv.stage,
    priority: inv.priority,
    category: inv.category,
    contact: inv.contact,
    intro: inv.intro,
    email_date: inv.emailDate,
    meeting_date: inv.meetingDate,
    next_action: inv.nextAction,
    next_date: inv.nextDate,
    notes: inv.notes,
    ticket_size: inv.ticketSize,
    why_fit: inv.whyFit,
    conflict_check: inv.conflictCheck,
    fund_stage: inv.fundStage,
    updated_at: Date.now()
  };

  if (useSupabase) {
    if (inv.id) {
      const { error } = await supabase.from('investors').update(row).eq('id', inv.id);
      if (error) console.error('Update investor error:', error);
    } else {
      const { data, error } = await supabase.from('investors').insert(row).select().single();
      if (error) console.error('Insert investor error:', error);
      if (data) inv.id = data.id;
    }
  } else {
    localStorage.setItem('kiwi_investors', JSON.stringify(investors));
  }
}

async function deleteInvestorFromDB(id) {
  if (useSupabase) {
    const { error } = await supabase.from('investors').delete().eq('id', id);
    if (error) console.error('Delete investor error:', error);
  } else {
    localStorage.setItem('kiwi_investors', JSON.stringify(investors));
  }
}

async function loadMessages() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) { console.error('Load messages error:', error); return; }
    messages = data.map(row => ({
      id: row.id,
      investor: row.investor,
      channel: row.channel,
      status: row.status,
      subject: row.subject || '',
      body: row.body,
      notes: row.notes || '',
      updated: row.updated_at || Date.now()
    }));
  } else {
    const storedVersion = parseInt(localStorage.getItem('kiwi_seed_version') || '0');
    const stored = localStorage.getItem('kiwi_messages');
    if (stored && storedVersion >= SEED_VERSION) {
      messages = JSON.parse(stored);
    } else {
      messages = JSON.parse(JSON.stringify(DEFAULT_MESSAGES));
      localStorage.setItem('kiwi_messages', JSON.stringify(messages));
      localStorage.setItem('kiwi_seed_version', String(SEED_VERSION));
    }
  }
}

async function saveMessageToDB(msg) {
  const row = {
    investor: msg.investor,
    channel: msg.channel,
    status: msg.status,
    subject: msg.subject,
    body: msg.body,
    notes: msg.notes,
    updated_at: Date.now()
  };

  if (useSupabase) {
    if (msg.id) {
      const { error } = await supabase.from('messages').update(row).eq('id', msg.id);
      if (error) console.error('Update message error:', error);
    } else {
      const { data, error } = await supabase.from('messages').insert(row).select().single();
      if (error) console.error('Insert message error:', error);
      if (data) msg.id = data.id;
    }
  } else {
    localStorage.setItem('kiwi_messages', JSON.stringify(messages));
  }
}

async function deleteMessageFromDB(id) {
  if (useSupabase) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) console.error('Delete message error:', error);
  } else {
    localStorage.setItem('kiwi_messages', JSON.stringify(messages));
  }
}

// ============ RENDER ============
function renderStats() {
  const counts = {};
  STAGES.forEach(s => counts[s] = 0);
  investors.forEach(inv => { if (counts[inv.stage] !== undefined) counts[inv.stage]++; });
  const activeTotal = investors.filter(i => i.stage !== 'Passed').length;
  const passedCount = counts['Passed'] || 0;
  const activeFilter = document.getElementById('stageFilter').value;

  let html = `<div class="stat-card ${!activeFilter?'active':''}" onclick="filterByStage('')" style="cursor:pointer;">
    <div class="stat-val" style="color:var(--dark);">${activeTotal}</div>
    <div class="stat-label">Active</div>
  </div>`;

  STAGES.filter(s => s !== 'Passed').forEach(s => {
    const isActive = activeFilter === s;
    html += `<div class="stat-card ${isActive?'active':''}" onclick="filterByStage('${s}')" style="cursor:pointer;">
      <div class="stat-val" style="color:${STAGE_COLORS[s]};">${counts[s]}</div>
      <div class="stat-label">${s}</div>
    </div>`;
  });

  if (passedCount > 0) {
    const isActive = activeFilter === 'Passed';
    html += `<div class="stat-card ${isActive?'active':''}" onclick="filterByStage('Passed')" style="cursor:pointer;">
      <div class="stat-val" style="color:var(--red);">${passedCount}</div>
      <div class="stat-label">Passed</div>
    </div>`;
  }

  document.getElementById('statsBar').innerHTML = html;
}

window.filterByStage = function(stage) {
  document.getElementById('stageFilter').value = stage;
  renderTable();
};

function getFilteredInvestors() {
  const search = document.getElementById('searchBox').value.toLowerCase();
  const stageF = document.getElementById('stageFilter').value;
  const prioF = document.getElementById('priorityFilter').value;
  const sortBy = document.getElementById('sortSelect').value;

  let list = investors.filter(inv => {
    if (stageF && inv.stage !== stageF) return false;
    if (prioF && inv.priority !== prioF) return false;
    if (search) {
      const hay = (inv.name + inv.fund + inv.notes + inv.intro + inv.contact + inv.nextAction + (inv.category||'') + (inv.ticketSize||'') + (inv.whyFit||'')).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  const stageOrder = {};
  STAGES.forEach((s,i) => stageOrder[s] = i);
  const prioOrder = { P1:0, P2:1, P3:2, P4:3 };

  list.sort((a,b) => {
    switch(sortBy) {
      case 'name': return (a.name || a.fund).localeCompare(b.name || b.fund);
      case 'stage': return stageOrder[a.stage] - stageOrder[b.stage];
      case 'priority': return prioOrder[a.priority] - prioOrder[b.priority];
      case 'nextAction': return (a.nextDate||'9999').localeCompare(b.nextDate||'9999');
      default: return b.updated - a.updated;
    }
  });

  return list;
}

function renderTable() {
  renderStats();
  const list = getFilteredInvestors();
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const today = new Date().toISOString().split('T')[0];

  tbody.innerHTML = list.map((inv, i) => {
    const invId = inv.id || investors.indexOf(inv);
    const prioCls = inv.priority === 'P1' ? 'priority-high' : inv.priority === 'P2' ? 'priority-medium' : 'priority-low';
    const isOverdue = inv.nextDate && inv.nextDate < today && inv.stage !== 'Closed' && inv.stage !== 'Passed';

    const notesPreview = (inv.notes || '').length > 60 ? inv.notes.substring(0, 60) + '…' : (inv.notes || '');
    const nextActionPreview = (inv.nextAction || '').length > 50 ? inv.nextAction.substring(0, 50) + '…' : (inv.nextAction || '');
    const escapedNotes = (inv.notes || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedAction = (inv.nextAction || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return `<tr onclick="editInvestor('${invId}')" style="cursor:pointer;">
      <td style="color:rgba(0,0,0,0.3);font-size:11px;">${i+1}</td>
      <td style="font-weight:600;">${inv.name||''}</td>
      <td style="font-weight:500;">${inv.fund}</td>
      <td style="font-size:11px;color:rgba(0,0,0,0.6);">${inv.category||''}</td>
      <td>
        <span class="stage-badge ${STAGE_CLASSES[inv.stage]}">${inv.stage}</span>
      </td>
      <td>
        <span class="priority-dot ${prioCls}"></span>${inv.priority}
      </td>
      <td style="font-size:11px;white-space:nowrap;">${inv.ticketSize||''}</td>
      <td style="${isOverdue?'color:var(--red);':''}" title="${escapedAction}">
        <div style="font-size:11px;font-weight:500;${isOverdue?'color:var(--red);':''}">${nextActionPreview}</div>
        ${inv.nextDate ? `<div style="font-size:10px;color:${isOverdue?'var(--red)':'rgba(0,0,0,0.4)'};margin-top:2px;">${new Date(inv.nextDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}${isOverdue?' · OVERDUE':''}</div>` : ''}
      </td>
      <td style="font-size:11px;color:rgba(0,0,0,0.5);" title="${escapedNotes}">${notesPreview}</td>
      <td onclick="event.stopPropagation();">
        <button class="btn btn-sm btn-outline" onclick="editInvestor('${invId}')" title="Edit" style="margin-bottom:4px;">&#9998;</button>
        <button class="btn btn-sm btn-danger" onclick="deleteInvestor('${invId}')" title="Delete">&#10007;</button>
      </td>
    </tr>`;
  }).join('');
}

// ============ CRUD ============
function findInvestor(idOrIdx) {
  return investors.find(inv => inv.id === idOrIdx) || investors[parseInt(idOrIdx)];
}

window.updateField = async function(idOrIdx, field, value) {
  const inv = findInvestor(idOrIdx);
  if (!inv) return;
  inv[field] = value.trim();
  inv.updated = Date.now();
  renderStats();
  await saveInvestorToDB(inv);
};

window.openModal = function(idOrIdx) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const editId = document.getElementById('editId');

  if (idOrIdx !== undefined) {
    const inv = findInvestor(idOrIdx);
    if (!inv) return;
    title.textContent = 'Edit Investor';
    editId.value = inv.id || investors.indexOf(inv);
    document.getElementById('fName').value = inv.name;
    document.getElementById('fFund').value = inv.fund;
    document.getElementById('fStage').value = inv.stage;
    document.getElementById('fPriority').value = inv.priority;
    document.getElementById('fCategory').value = inv.category||'';
    document.getElementById('fTicketSize').value = inv.ticketSize||'';
    document.getElementById('fContact').value = inv.contact;
    document.getElementById('fIntro').value = inv.intro;
    document.getElementById('fWhyFit').value = inv.whyFit||'';
    document.getElementById('fFundStage').value = inv.fundStage||'';
    document.getElementById('fNextAction').value = inv.nextAction;
    document.getElementById('fNextDate').value = inv.nextDate;
    document.getElementById('fNotes').value = inv.notes;
  } else {
    title.textContent = 'Add New Investor';
    editId.value = '';
    document.querySelectorAll('.modal input, .modal textarea').forEach(el => el.value = '');
    document.getElementById('fStage').value = 'Identified';
    document.getElementById('fPriority').value = 'P2';
  }

  overlay.classList.add('show');
};

window.closeModal = function() {
  document.getElementById('modalOverlay').classList.remove('show');
};

window.saveInvestor = async function() {
  const editId = document.getElementById('editId').value;
  const data = {
    name: document.getElementById('fName').value.trim(),
    fund: document.getElementById('fFund').value.trim(),
    stage: document.getElementById('fStage').value,
    priority: document.getElementById('fPriority').value,
    category: document.getElementById('fCategory').value.trim(),
    ticketSize: document.getElementById('fTicketSize').value.trim(),
    contact: document.getElementById('fContact').value.trim(),
    intro: document.getElementById('fIntro').value.trim(),
    whyFit: document.getElementById('fWhyFit').value.trim(),
    fundStage: document.getElementById('fFundStage').value.trim(),
    nextAction: document.getElementById('fNextAction').value.trim(),
    nextDate: document.getElementById('fNextDate').value,
    notes: document.getElementById('fNotes').value.trim(),
    emailDate: '',
    meetingDate: '',
    updated: Date.now()
  };

  if (!data.fund) { alert('Please enter at least the fund/firm name.'); return; }

  if (editId) {
    const inv = findInvestor(editId);
    if (inv) {
      Object.assign(inv, data);
      await saveInvestorToDB(inv);
    }
  } else {
    investors.unshift(data);
    await saveInvestorToDB(data);
  }

  closeModal();
  renderTable();
};

window.editInvestor = function(idOrIdx) {
  window.openModal(idOrIdx);
};

window.deleteInvestor = async function(idOrIdx) {
  const inv = findInvestor(idOrIdx);
  if (!inv) return;
  if (confirm(`Remove ${inv.name || inv.fund} from the tracker?`)) {
    const idx = investors.indexOf(inv);
    if (idx > -1) investors.splice(idx, 1);
    if (inv.id) await deleteInvestorFromDB(inv.id);
    else if (!useSupabase) localStorage.setItem('kiwi_investors', JSON.stringify(investors));
    renderTable();
  }
};

// ============ EXPORT ============
window.exportCSV = function() {
  const headers = ['Name','Fund','Category','Stage','Priority','Ticket Size (INR Cr)','Contact','How to Reach','Why KiwiStays Fit','Fund Stage','Next Action','Next Action Date','Notes'];
  const rows = investors.map(inv => [
    inv.name, inv.fund, inv.category, inv.stage, inv.priority, inv.ticketSize,
    inv.contact, inv.intro, inv.whyFit, inv.fundStage, inv.nextAction, inv.nextDate, inv.notes
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(v => `"${(v||'').replace(/"/g,'""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'KiwiStays_Investor_Tracker_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);

  const notice = document.getElementById('exportNotice');
  notice.style.display = 'block';
  setTimeout(() => notice.style.display = 'none', 2500);
};

// ============ KEYBOARD ============
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMsgModal();
  }
});

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ============ TABS ============
window.switchTab = function(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'analytics') renderAnalytics();
  if (tab === 'messages') renderMessages();
};

// ============ ANALYTICS ============
function renderAnalytics() {
  renderFunnel();
  renderRates();
  renderWeekGrid();
  renderActionList();
  renderPriorityMatrix();
  renderSourceChart();
}

function renderFunnel() {
  const counts = {};
  STAGES.forEach(s => counts[s] = 0);
  investors.forEach(inv => counts[inv.stage]++);
  const max = Math.max(...Object.values(counts), 1);
  const funnelStages = STAGES.filter(s => s !== 'Passed');
  const colors = {
    'Identified':'#aaa','Reached Out':'var(--blue)','In Dialogue':'var(--purple)',
    'Meeting Set':'#9b59b6','Met':'var(--orange)','Due Diligence':'var(--gold)',
    'Term Sheet':'var(--green)','Closed':'var(--green-dark)'
  };

  document.getElementById('funnelChart').innerHTML = funnelStages.map(s => `
    <div class="funnel-row">
      <div class="funnel-label">${s}</div>
      <div class="funnel-bar-bg">
        <div class="funnel-bar" style="width:${Math.max((counts[s]/max)*100, counts[s]>0?8:0)}%;background:${colors[s]};">${counts[s]>0?counts[s]:''}</div>
      </div>
      <div class="funnel-count">${counts[s]}</div>
    </div>
  `).join('');
}

function renderRates() {
  const total = investors.length;
  const reachedPlus = investors.filter(i => STAGES.indexOf(i.stage) >= 1 && i.stage !== 'Passed').length;
  const metPlus = investors.filter(i => STAGES.indexOf(i.stage) >= 3 && i.stage !== 'Passed').length;
  const ddPlus = investors.filter(i => STAGES.indexOf(i.stage) >= 4 && i.stage !== 'Passed').length;
  const passed = investors.filter(i => i.stage === 'Passed').length;

  const responseRate = total > 0 ? Math.round((reachedPlus / total) * 100) : 0;
  const meetingRate = reachedPlus > 0 ? Math.round((metPlus / reachedPlus) * 100) : 0;
  const progressRate = metPlus > 0 ? Math.round((ddPlus / metPlus) * 100) : 0;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  document.getElementById('rateCards').innerHTML = `
    <div class="rate-card"><div class="rv" style="color:var(--blue);">${responseRate}%</div><div class="rl">Response Rate</div></div>
    <div class="rate-card"><div class="rv" style="color:var(--purple);">${meetingRate}%</div><div class="rl">Meeting Conversion</div></div>
    <div class="rate-card"><div class="rv" style="color:var(--orange);">${progressRate}%</div><div class="rl">DD+ Conversion</div></div>
    <div class="rate-card"><div class="rv" style="color:var(--red);">${passRate}%</div><div class="rl">Pass Rate</div></div>
  `;
}

function renderWeekGrid() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const dayCounts = [0,0,0,0,0,0,0];
  investors.forEach(inv => {
    if (inv.nextDate) {
      const d = new Date(inv.nextDate);
      const diff = Math.floor((d - monday) / (1000*60*60*24));
      if (diff >= 0 && diff < 7) dayCounts[diff]++;
    }
  });

  const maxC = Math.max(...dayCounts, 1);
  document.getElementById('weekGrid').innerHTML = days.map((d, i) => {
    const count = dayCounts[i];
    const intensity = count > 0 ? Math.max(0.2, count / maxC) : 0;
    const dateStr = new Date(monday.getTime() + i*86400000).getDate();
    const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const bg = count > 0 ? `rgba(17,142,194,${intensity})` : 'rgba(0,0,0,0.04)';
    return `<div class="week-day">
      <div class="wd-label">${d} ${dateStr}</div>
      <div class="wd-block" style="background:${bg};color:${count>0?'#fff':'rgba(0,0,0,0.2)'};${isToday?'outline:2px solid var(--green);outline-offset:2px;':''}">${count}</div>
    </div>`;
  }).join('');
}

function renderActionList() {
  const today = new Date().toISOString().split('T')[0];
  const withActions = investors.filter(i => i.nextDate && i.stage !== 'Closed' && i.stage !== 'Passed')
    .sort((a,b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, 8);

  if (withActions.length === 0) {
    document.getElementById('actionList').innerHTML = '<div style="text-align:center;color:rgba(0,0,0,0.3);padding:20px;font-size:12px;">No upcoming actions.</div>';
    return;
  }

  document.getElementById('actionList').innerHTML = withActions.map(inv => {
    const isOverdue = inv.nextDate < today;
    const dateObj = new Date(inv.nextDate + 'T00:00:00');
    const dateLabel = dateObj.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    return `<div class="action-item ${isOverdue?'overdue':''}">
      <div class="action-date" style="${isOverdue?'color:var(--red);':''}">${dateLabel} ${isOverdue?'(!)':''}</div>
      <div class="action-who">${inv.name || inv.fund}</div>
      <div class="action-what">${inv.nextAction}</div>
      <span class="stage-badge ${STAGE_CLASSES[inv.stage]}">${inv.stage}</span>
    </div>`;
  }).join('');
}

function renderPriorityMatrix() {
  const matrix = {};
  ['P1','P2','P3','P4'].forEach(p => {
    matrix[p] = {};
    STAGES.forEach(s => matrix[p][s] = 0);
  });
  investors.forEach(inv => { if (matrix[inv.priority]) matrix[inv.priority][inv.stage]++; });

  const activeStages = STAGES.filter(s => investors.some(i => i.stage === s));
  let html = '<div style="display:grid;grid-template-columns:80px repeat(' + activeStages.length + ',1fr);gap:4px;align-items:center;">';
  html += '<div></div>';
  activeStages.forEach(s => {
    html += `<div style="text-align:center;font-size:10px;font-weight:600;color:rgba(0,0,0,0.4);padding:8px 0;">${s}</div>`;
  });

  ['P1','P2','P3','P4'].forEach(p => {
    html += `<div style="font-size:11px;font-weight:600;text-align:right;padding-right:8px;"><span class="priority-dot ${p==='P1'?'priority-high':p==='P2'?'priority-medium':'priority-low'}"></span>${p}</div>`;
    activeStages.forEach(s => {
      const count = matrix[p][s];
      const bg = count > 0 ? `rgba(17,142,194,${Math.min(0.15 + count*0.15, 0.6)})` : 'rgba(0,0,0,0.02)';
      html += `<div style="text-align:center;padding:12px;background:${bg};border-radius:6px;font-size:16px;font-weight:800;color:${count>0?'var(--dark)':'rgba(0,0,0,0.1)'};">${count}</div>`;
    });
  });
  html += '</div>';
  document.getElementById('priorityMatrix').innerHTML = html;
}

function renderSourceChart() {
  const sources = {};
  investors.forEach(inv => {
    const src = inv.intro || 'Unknown';
    if (!sources[src]) sources[src] = { total:0, active:0 };
    sources[src].total++;
    if (inv.stage !== 'Passed') sources[src].active++;
  });

  const sorted = Object.entries(sources).sort((a,b) => b[1].total - a[1].total);
  const max = sorted.length > 0 ? sorted[0][1].total : 1;

  document.getElementById('sourceChart').innerHTML = sorted.map(([src, data]) => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="width:140px;font-size:11px;font-weight:500;text-align:right;color:rgba(0,0,0,0.5);">${src}</div>
      <div style="flex:1;height:28px;background:rgba(0,0,0,0.04);border-radius:6px;overflow:hidden;position:relative;">
        <div style="height:100%;width:${(data.total/max)*100}%;background:var(--blue);border-radius:6px;display:flex;align-items:center;padding-left:8px;">
          <span style="font-size:11px;font-weight:700;color:#fff;">${data.total} total</span>
        </div>
      </div>
      <div style="font-size:11px;color:var(--green-dark);font-weight:600;width:60px;">${data.active} active</div>
    </div>
  `).join('');
}

// ============ MESSAGES ============
const MSG_STATUS_COLORS = {
  'Draft':'#999','Ready':'var(--blue)','Sent':'var(--orange)','Replied':'var(--green-dark)'
};
const MSG_CHANNEL_ICONS = {
  'LinkedIn DM':'in','Email':'@','Website Form':'W','Instagram DM':'ig','WhatsApp':'wa'
};

function renderMessages() {
  const search = (document.getElementById('msgSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('msgStatusFilter')?.value || '';
  const channelF = document.getElementById('msgChannelFilter')?.value || '';

  let list = messages.filter(m => {
    if (statusF && m.status !== statusF) return false;
    if (channelF && m.channel !== channelF) return false;
    if (search && !(m.investor + m.body + m.notes).toLowerCase().includes(search)) return false;
    return true;
  });

  const container = document.getElementById('messagesContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:rgba(0,0,0,0.3);font-size:14px;">No messages yet. Click "+ New Message" to draft your first outreach.</div>';
    return;
  }

  container.innerHTML = list.map((m) => {
    const msgId = m.id || messages.indexOf(m);
    const statusColor = MSG_STATUS_COLORS[m.status] || '#999';
    const channelIcon = MSG_CHANNEL_ICONS[m.channel] || '?';
    return `
    <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.06);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:${statusColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">${channelIcon}</div>
          <div>
            <div style="font-weight:700;font-size:14px;color:var(--dark);">${m.investor}</div>
            <div style="font-size:11px;color:rgba(0,0,0,0.4);margin-top:1px;">${m.channel}${m.subject ? ' · ' + m.subject : ''}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:11px;font-weight:700;color:${statusColor};background:${statusColor}15;padding:4px 10px;border-radius:20px;">${m.status}</span>
          <button class="btn btn-sm btn-primary" onclick="copyMessage('${msgId}')" title="Copy to clipboard" style="font-size:11px;">Copy</button>
          <button class="btn btn-sm btn-outline" onclick="openMsgModal('${msgId}')" title="Edit">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteMessage('${msgId}')" title="Delete">X</button>
        </div>
      </div>
      <div style="background:var(--cream);border-radius:8px;padding:16px;font-size:12px;line-height:1.7;color:var(--dark);white-space:pre-wrap;max-height:300px;overflow-y:auto;cursor:pointer;border:1px solid rgba(0,0,0,0.04);" onclick="openMsgModal('${msgId}')">${m.body}</div>
      ${m.notes ? '<div style="margin-top:10px;font-size:11px;color:rgba(0,0,0,0.45);padding:8px 12px;background:rgba(0,0,0,0.02);border-radius:6px;border-left:3px solid var(--blue);"><strong>Internal notes:</strong> ' + m.notes + '</div>' : ''}
    </div>`;
  }).join('');
}

function findMessage(idOrIdx) {
  return messages.find(m => m.id === idOrIdx) || messages[parseInt(idOrIdx)];
}

window.copyMessage = function(idOrIdx) {
  const m = findMessage(idOrIdx);
  if (!m) return;
  let text = m.body;
  if (m.subject) text = 'Subject: ' + m.subject + '\n\n' + text;
  navigator.clipboard.writeText(text).then(() => {
    const notice = document.getElementById('copyNotice');
    notice.style.display = 'block';
    setTimeout(() => notice.style.display = 'none', 2000);
  });
};

window.openMsgModal = function(idOrIdx) {
  const overlay = document.getElementById('msgModalOverlay');
  const title = document.getElementById('msgModalTitle');
  const editId = document.getElementById('msgEditId');

  if (idOrIdx !== undefined) {
    const m = findMessage(idOrIdx);
    if (!m) return;
    title.textContent = 'Edit Message';
    editId.value = m.id || messages.indexOf(m);
    document.getElementById('mInvestor').value = m.investor;
    document.getElementById('mChannel').value = m.channel;
    document.getElementById('mStatus').value = m.status;
    document.getElementById('mSubject').value = m.subject || '';
    document.getElementById('mBody').value = m.body;
    document.getElementById('mNotes').value = m.notes || '';
  } else {
    title.textContent = 'New Outreach Message';
    editId.value = '';
    document.querySelectorAll('#msgModalOverlay input, #msgModalOverlay textarea').forEach(el => el.value = '');
    document.getElementById('mChannel').value = 'LinkedIn DM';
    document.getElementById('mStatus').value = 'Draft';
  }
  overlay.classList.add('show');
};

window.closeMsgModal = function() {
  document.getElementById('msgModalOverlay').classList.remove('show');
};

window.saveMessage = async function() {
  const editId = document.getElementById('msgEditId').value;
  const data = {
    investor: document.getElementById('mInvestor').value.trim(),
    channel: document.getElementById('mChannel').value,
    status: document.getElementById('mStatus').value,
    subject: document.getElementById('mSubject').value.trim(),
    body: document.getElementById('mBody').value.trim(),
    notes: document.getElementById('mNotes').value.trim(),
    updated: Date.now()
  };
  if (!data.investor) { alert('Please enter the investor name.'); return; }
  if (!data.body) { alert('Please enter the message body.'); return; }

  if (editId) {
    const m = findMessage(editId);
    if (m) {
      Object.assign(m, data);
      await saveMessageToDB(m);
    }
  } else {
    messages.unshift(data);
    await saveMessageToDB(data);
  }
  closeMsgModal();
  renderMessages();
};

window.deleteMessage = async function(idOrIdx) {
  const m = findMessage(idOrIdx);
  if (!m) return;
  if (confirm('Delete this message?')) {
    const idx = messages.indexOf(m);
    if (idx > -1) messages.splice(idx, 1);
    if (m.id) await deleteMessageFromDB(m.id);
    else if (!useSupabase) localStorage.setItem('kiwi_messages', JSON.stringify(messages));
    renderMessages();
  }
};

document.getElementById('msgModalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMsgModal();
});

// Make renderTable and renderMessages available globally
window.renderTable = renderTable;
window.renderMessages = renderMessages;

// ============ INIT ============
async function init() {
  await Promise.all([loadInvestors(), loadMessages()]);
  renderTable();
}

init();
