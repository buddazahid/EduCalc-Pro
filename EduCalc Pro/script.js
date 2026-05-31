/* EduCalc Pro – JavaScript Logic
   - Real-time percentage calculation
   - Grade assignment
   - Input validation
   - Dark/Light mode toggle
   - Print and PDF export
*/

// Grade logic helper
function gradeFromPercentage(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 35) return 'Pass';
  return 'Fail';
}

// Format number to 2 decimal places
function formatPercentage(n) {
  return n.toFixed(2);
}

// DOM helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  const studentName = $('#studentName');
  const educationType = $('#educationType');
  const obtainedMarks = $('#obtainedMarks');
  const totalMarksEl = $('#totalMarks');
  const errorMsg = $('#errorMsg');
  const resultInner = $('#resultInner');
  const resetBtn = $('#resetBtn');
  const themeToggle = $('#themeToggle');
  const printBtn = $('#printBtn');
  const pdfBtn = $('#pdfBtn');

  // Restore theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  // Update total marks display when education type changes
  function updateTotal() {
    const opt = educationType.selectedOptions[0];
    if (!opt || !opt.dataset) {
      totalMarksEl.textContent = '—';
      return null;
    }
    const total = opt.dataset.total || '';
    totalMarksEl.textContent = total ? (total + ' Marks') : '—';
    return total ? Number(total) : null;
  }

  // Validate inputs and compute result
  function computeAndRender() {
    errorMsg.textContent = '';
    resultInner.classList.remove('empty');

    const name = studentName.value.trim().toUpperCase();
    const total = updateTotal();
    const obtainedRaw = obtainedMarks.value;

    // Basic validation
    if (!name && !obtainedRaw) {
      resultInner.innerHTML = '<p class="muted">Fill the form to see the live result here.</p>';
      resultInner.classList.add('empty');
      return;
    }

    if (!name) {
      errorMsg.textContent = 'Please enter the student name.';
      return;
    }
    if (total === null) {
      errorMsg.textContent = 'Please select an education type.';
      return;
    }
    if (obtainedRaw === '') {
      errorMsg.textContent = 'Please enter obtained marks.';
      return;
    }

    const obtained = Number(obtainedRaw);
    if (Number.isNaN(obtained)) {
      errorMsg.textContent = 'Obtained marks must be a number.';
      return;
    }
    if (obtained < 0) {
      errorMsg.textContent = 'Obtained marks cannot be negative.';
      return;
    }
    if (obtained > total) {
      errorMsg.textContent = `Obtained marks (${obtained}) cannot exceed total marks (${total}).`;
      return;
    }

    // valid -> compute
    const percentage = (obtained / total) * 100;
    const grade = gradeFromPercentage(percentage);

    // Render result card
    resultInner.innerHTML = `
      <div class="result-header">
        <div>
          <h3 class="student-name">${escapeHtml(name)}</h3>
          <p class="muted">${escapeHtml(educationType.selectedOptions[0].textContent)}</p>
        </div>
        <div class="success-badge" id="successBadge">✓</div>
      </div>

      <div class="stats-grid">
        <div class="stat"><div class="label-sm">Total Marks</div><div class="value">${total}</div></div>
        <div class="stat"><div class="label-sm">Obtained</div><div class="value">${obtained}</div></div>
        <div class="stat"><div class="label-sm">Percentage</div><div class="value">${formatPercentage(percentage)}%</div></div>
        <div class="stat"><div class="label-sm">Grade</div><div class="value grade">${grade}</div></div>
      </div>
    `;

    // animate badge
    const badge = $('#successBadge');
    if (badge) {
      badge.style.transform = 'scale(1)';
      badge.style.opacity = '1';
      badge.animate([
        { transform: 'translateY(-20px) scale(0.6)', opacity:0 },
        { transform: 'translateY(0) scale(1)', opacity:1 }
      ], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });

      launchConfetti();
    }
  }

  // Confetti animation
  function launchConfetti(){
    const parent = document.getElementById('resultArea');
    if(!parent) return;
    for(let i=0;i<18;i++){
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.width = (6+Math.random()*10)+'px';
      el.style.height = el.style.width;
      el.style.left = (30 + Math.random()*40) + '%';
      el.style.top = '10%';
      el.style.background = ['#06b6d4','#4f46e5','#f97316','#10b981'][Math.floor(Math.random()*4)];
      el.style.opacity = '0.95';
      el.style.transform = 'rotate('+Math.random()*360+'deg)';
      el.style.borderRadius = '2px';
      el.style.zIndex = 9999;
      parent.appendChild(el);
      const duration = 900 + Math.random()*1200;
      el.animate([
        { transform: `translateY(0) rotate(${Math.random()*360}deg)`, opacity:1 },
        { transform: `translateY(${200+Math.random()*300}px) rotate(${Math.random()*720}deg)`, opacity:0 }
      ], { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(()=> el.remove(), duration+50);
    }
  }

  // Escape user input for safe HTML insertion
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Capitalize first letter of each word in student name
  function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Event listeners for real-time calculation
  educationType.addEventListener('change', computeAndRender);
  obtainedMarks.addEventListener('input', computeAndRender);
  studentName.addEventListener('input', (e) => {
    e.target.value = capitalizeWords(e.target.value);
    computeAndRender();
  });

  // Reset form
  resetBtn.addEventListener('click', () => {
    $('#calcForm').reset();
    totalMarksEl.textContent = '—';
    errorMsg.textContent = '';
    resultInner.innerHTML = '<p class="muted">Fill the form to see the live result here.</p>';
    resultInner.classList.add('empty');
  });

  // Theme toggle
  themeToggle.addEventListener('click', ()=>{
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark);
  });

  // Print
  printBtn.addEventListener('click', ()=>{
    if (resultInner.classList.contains('empty')) {
      alert('No result to print. Fill the form first.');
      return;
    }
    window.print();
  });

  // Download PDF via print window
  pdfBtn.addEventListener('click', ()=>{
    if (resultInner.classList.contains('empty')) {
      alert('No result to download. Fill the form first.');
      return;
    }
    const content = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>EduCalc Pro – Student Result</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#0b1220}
            .card{max-width:700px;margin:0 auto;border-radius:8px;padding:20px;border:1px solid #e6e9ef}
            .student{font-size:20px;font-weight:700;margin-bottom:6px}
            .muted{color:#6b7280;margin-bottom:12px}
            .stats{display:flex;flex-wrap:wrap;gap:12px}
            .stat{flex:1 1 45%;background:#f8fafc;padding:12px;border-radius:6px}
            .label{font-size:12px;color:#6b7280}
            .value{font-weight:700;margin-top:6px}
            .header{text-align:center;margin-bottom:20px}
          </style>
        </head>
        <body>
          <div class="header">
            <h2>EduCalc Pro</h2>
            <p style="color:#6b7280">Student Percentage & Grade Report</p>
          </div>
          <div class="card">
            ${resultInner.innerHTML}
          </div>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    w.document.open();
    w.document.write(content);
    w.document.close();
    setTimeout(()=>{ w.print(); }, 500);
  });

});
