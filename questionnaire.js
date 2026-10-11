import { PRESETS } from './presets.js';

export function setupQuestionnaire({ createIndex, hasSharedConfiguration }) {
  const dialog = document.getElementById('profile-dialog');
  const form = document.getElementById('profile-form');
  const steps = [...dialog.querySelectorAll('[data-profile-step]')];
  const next = document.getElementById('profile-next');
  const back = document.getElementById('profile-back');
  const remembered = 'bengaluru-life-index:welcome:v1';
  let step = 0;
  const showStep = () => {
    steps.forEach((panel, n) => { panel.hidden = n !== step; });
    document.getElementById('profile-progress').textContent = `Step ${step + 1} of ${steps.length}`;
    document.getElementById('profile-progress-bar').style.width = `${(step + 1) / steps.length * 100}%`;
    back.hidden = step === 0;
    next.textContent = step === steps.length - 1 ? 'Create my index' : 'Continue';
    document.getElementById('profile-error').textContent = '';
    steps[step].querySelector('h2').focus();
  };
  const close = () => {
    try { localStorage.setItem(remembered, 'seen'); } catch { /* Optional browser storage. */ }
    dialog.close();
  };
  const open = () => { step = 0; dialog.showModal(); showStep(); };
  document.getElementById('profile-open').onclick = open;
  document.getElementById('profile-skip').onclick = close;
  dialog.oncancel = event => { event.preventDefault(); close(); };
  back.onclick = () => { step--; showStep(); };
  form.onsubmit = event => {
    event.preventDefault();
    if (step === 1) {
      const invalid = [...steps[step].querySelectorAll('input')].find(input => !input.checkValidity());
      if (invalid) { invalid.reportValidity(); return; }
    }
    if (step < steps.length - 1) { step++; showStep(); return; }
    const answers = new FormData(form);
    const preset = PRESETS.find(p => p.id === answers.get('lifestyle'));
    const weights = { ...(preset?.weights || { metro: 25, park: 25, hospital: 25, local_services: 25 }) };
    const transit = answers.get('travel');
    if (transit === 'public') { weights.metro = (weights.metro || 0) + 25; weights.bus_stop = (weights.bus_stop || 0) + 15; }
    if (transit === 'local') { weights.local_services = (weights.local_services || 0) + 30; weights.pharmacy = (weights.pharmacy || 0) + 10; }
    const priorities = { green: { green_cover: 25, park: 15 }, quiet: { noise: 30 }, schools: { school_count: 30 }, health: { hospital: 25, pharmacy: 10 }, leisure: { cafe_count: 15, cinema_count: 15, mall_count: 10 } };
    for (const choice of answers.getAll('priorities')) for (const [key, value] of Object.entries(priorities[choice] || {})) weights[key] = (weights[key] || 0) + value;
    const budget = Number(answers.get('budget'));
    // Starting assumption, shown in the guide and editable in the index controls.
    const other = Math.round(budget * 0.3);
    if (!budget) delete weights.cost_of_living;
    else weights.cost_of_living = Math.max(30, weights.cost_of_living || 0);
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    for (const key of Object.keys(weights)) weights[key] = Math.round(weights[key] / total * 100);
    createIndex({
      name: 'My Bengaluru life index',
      description: 'A starting mix based on my lifestyle, travel and selected priorities. Every weight is editable.',
      weights,
      costSettings: { bhk: Number(answers.get('bhk')), monthlyBudget: budget || 30000, nonRent: budget ? other : 10000 }
    });
    close();
  };
  let seen = false;
  try { seen = !!localStorage.getItem(remembered); } catch { /* Show when storage is unavailable. */ }
  if (!seen && !hasSharedConfiguration) open();
}
