// Default Warsaw (PL) and New Delhi (IN)
const defaults = {
  cityA: 'Warsaw, Poland',
  latA: 52.2297,
  lngA: 21.0122,
  cityB: 'New Delhi, India',
  latB: 28.6139,
  lngB: 77.2090
};

// Utility: Haversine distance in km
function toRad(d){ return d * Math.PI / 180; }
function haversine(lat1, lon1, lat2, lon2){
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); // whole km
}

// LocalStorage helpers
const KEY = 'loveDistanceSettings';
function getSettings(){
  const saved = localStorage.getItem(KEY);
  if(saved){
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return {...defaults};
}
function saveSettings(obj){
  localStorage.setItem(KEY, JSON.stringify(obj));
}

// Update UI with distance and city labels
function updateDistanceUI(){
  const s = getSettings();
  const km = haversine(s.latA, s.lngA, s.latB, s.lngB);
  document.getElementById('distanceKm').textContent = km.toLocaleString();

  const cityAEl = document.querySelector('.cityA');
  const cityBEl = document.querySelector('.cityB');
  if(cityAEl) cityAEl.textContent = s.cityA;
  if(cityBEl) cityBEl.textContent = s.cityB;
}

// Modal controls
const modal = document.getElementById('locationModal');
const openModalBtn = document.getElementById('editLocationsBtn');
const closeModalBtns = document.querySelectorAll('.modal__close');

function openModal(){
  const s = getSettings();
  document.getElementById('cityA').value = s.cityA.replace(/, Poland$/i,'');
  document.getElementById('latA').value = s.latA;
  document.getElementById('lngA').value = s.lngA;
  document.getElementById('cityB').value = s.cityB.replace(/, India$/i,'');
  document.getElementById('latB').value = s.latB;
  document.getElementById('lngB').value = s.lngB;

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

openModalBtn.addEventListener('click', openModal);
closeModalBtns.forEach(b => b.addEventListener('click', closeModal));
modal.addEventListener('click', (e) => {
  if(e.target === modal) closeModal();
});

// Save location form
document.getElementById('locForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const cityA = (document.getElementById('cityA').value || 'City A').trim();
  const latA = parseFloat(document.getElementById('latA').value);
  const lngA = parseFloat(document.getElementById('lngA').value);
  const cityB = (document.getElementById('cityB').value || 'City B').trim();
  const latB = parseFloat(document.getElementById('latB').value);
  const lngB = parseFloat(document.getElementById('lngB').value);

  const settings = {
    cityA: cityA.match(/poland/i) ? cityA : `${cityA}, Poland`,
    latA, lngA,
    cityB: cityB.match(/india/i) ? cityB : `${cityB}, India`,
    latB, lngB
  };
  saveSettings(settings);
  updateDistanceUI();
  closeModal();
});

// COUNTDOWN
const DATE_KEY = 'nextMeetupDate';
const meetInput = document.getElementById('meetDate');
const saveDateBtn = document.getElementById('saveDateBtn');
const timer = document.getElementById('timer');
let tickHandle = null;

function formatLeft(ms){
  if(ms <= 0) return 'It’s time! 💞';
  const s = Math.floor(ms/1000);
  const days = Math.floor(s / 86400);
  const hrs  = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${days}d ${hrs}h ${mins}m ${secs}s`;
}
function startCountdown(iso){
  if(tickHandle) clearInterval(tickHandle);
  function render(){
    const target = new Date(iso).getTime();
    const now = Date.now();
    timer.textContent = formatLeft(target - now);
  }
  render();
  tickHandle = setInterval(render, 1000);
}
saveDateBtn.addEventListener('click', () => {
  if(!meetInput.value){ alert('Please pick a date and time.'); return; }
  localStorage.setItem(DATE_KEY, meetInput.value);
  startCountdown(meetInput.value);
});

// Load existing date if any
const savedDate = localStorage.getItem(DATE_KEY);
if(savedDate){
  meetInput.value = savedDate;
  startCountdown(savedDate);
}

// GALLERY LIGHTBOX
const galleryImgs = Array.from(document.querySelectorAll('.grid-gallery img'));
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbClose = lightbox.querySelector('.close');
const lbPrev = lightbox.querySelector('.prev');
const lbNext = lightbox.querySelector('.next');
let currentIndex = 0;

function openLB(idx){
  currentIndex = idx;
  const img = galleryImgs[currentIndex];
  lbImg.src = img.src;
  lbImg.alt = img.alt || 'Photo';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeLB(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function nextImg(dir){
  const total = galleryImgs.length;
  currentIndex = (currentIndex + dir + total) % total;
  lbImg.src = galleryImgs[currentIndex].src;
  lbImg.alt = galleryImgs[currentIndex].alt || 'Photo';
}

galleryImgs.forEach((img, i) => {
  img.addEventListener('click', () => openLB(i));
});
lbClose.addEventListener('click', closeLB);
lbPrev.addEventListener('click', () => nextImg(-1));
lbNext.addEventListener('click', () => nextImg(1));
lightbox.addEventListener('click', (e) => {
  if(e.target === lightbox) closeLB();
});
window.addEventListener('keydown', (e) => {
  if(!lightbox.classList.contains('open')) return;
  if(e.key === 'Escape') closeLB();
  if(e.key === 'ArrowRight') nextImg(1);
  if(e.key === 'ArrowLeft') nextImg(-1);
});

// Init distance UI
updateDistanceUI();