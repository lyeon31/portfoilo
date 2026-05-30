// ── Language toggle ───────────────────────────────────────────────────

let currentLang = 'ko';

function setLang(lang) {
  currentLang = lang;

  // 버튼 active 상태 업데이트
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // body에 lang 클래스 적용 (추후 번역 텍스트 토글용)
  document.body.dataset.lang = lang;
}

// 초기 lang 설정
document.addEventListener('DOMContentLoaded', () => {
  document.body.dataset.lang = currentLang;
});

// ── Section open / close ──────────────────────────────────────────────

let currentSection = null;

function openSection(name) {
  // Close any open section first (instant swap)
  if (currentSection && currentSection !== name) {
    const prev = document.getElementById(currentSection + '-page');
    if (prev) prev.classList.remove('open');
  }

  const page = document.getElementById(name + '-page');
  if (!page) return;

  // Slide main page up
  document.getElementById('main-page').classList.add('slide-up');

  // Slide section page up from bottom
  requestAnimationFrame(() => {
    page.classList.add('open');
  });

  currentSection = name;

  // Update sidebar active states
  document.querySelectorAll('.sidebar-nav-item').forEach(el => {
    el.classList.toggle('active', el.textContent.trim().toLowerCase() === name);
  });
}

function closeSection() {
  if (!currentSection) return;

  const page = document.getElementById(currentSection + '-page');
  if (page) page.classList.remove('open');

  document.getElementById('main-page').classList.remove('slide-up');
  currentSection = null;
}

// Close section on logo click (already wired via onclick)
// Also allow ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('detail-modal').classList.contains('open')) {
      closeDetail();
    } else {
      closeSection();
    }
  }
});

// ── Detail modal data ─────────────────────────────────────────────────

const bookData = {
  1: {
    title: '별들에게 물어봐',
    year: '2026',
    img: 'img/thumbnew_1.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n작업 의도, 제작 과정, 사용된 재료와 기법, 그리고 이 책이 담고자 한 이야기를 이곳에 적어주세요. 독자에게 전하고 싶은 메시지나 영감의 출처도 함께 담아도 좋습니다.\n\n이 텍스트는 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 64p', '발행 : 2026']
  },
  2: {
    title: 'SAVE FILE CLUB',
    year: '2026',
    img: 'img/thumbnew_2.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n작업 의도, 제작 과정, 사용된 재료와 기법, 그리고 이 책이 담고자 한 이야기를 이곳에 적어주세요. 독자에게 전하고 싶은 메시지나 영감의 출처도 함께 담아도 좋습니다.\n\n이 텍스트는 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 80p', '발행 : 2026']
  },
  3: {
    title: '걱정을 접자',
    year: '2026',
    img: 'img/thumbnew_3.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n작업 의도, 제작 과정, 사용된 재료와 기법, 그리고 이 책이 담고자 한 이야기를 이곳에 적어주세요. 독자에게 전하고 싶은 메시지나 영감의 출처도 함께 담아도 좋습니다.\n\n이 텍스트는 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 56p', '발행 : 2026']
  },
  4: {
    title: '작품 제목',
    year: '2025',
    img: 'img/thumbnew_1.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '발행 : 2025']
  },
  5: {
    title: '작품 제목',
    year: '2025',
    img: 'img/thumbnew_2.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '발행 : 2025']
  },
  6: {
    title: '작품 제목',
    year: '2025',
    img: 'img/thumbnew_3.png',
    desc: `[목업 텍스트] 이 작품에 대한 설명이 들어갈 자리입니다.\n\n추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '발행 : 2025']
  }
};

const designData = {
  1: {
    title: '디자인 작품 1',
    year: '2026',
    img: 'img/thumbnew_1.png',
    desc: `[목업 텍스트] 이 디자인 작품에 대한 설명이 들어갈 자리입니다.\n\n작업 의도, 사용된 툴과 기법, 그리고 이 디자인이 담고자 한 메시지를 이곳에 적어주세요.\n\n이 텍스트는 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 그래픽 디자인', '툴 : Illustrator / Photoshop', '연도 : 2026']
  },
  2: {
    title: '디자인 작품 2',
    year: '2026',
    img: 'img/thumbnew_2.png',
    desc: `[목업 텍스트] 이 디자인 작품에 대한 설명이 들어갈 자리입니다.\n\n추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 타이포그래피', '툴 : Illustrator', '연도 : 2026']
  },
  3: {
    title: '디자인 작품 3',
    year: '2026',
    img: 'img/thumbnew_3.png',
    desc: `[목업 텍스트] 이 디자인 작품에 대한 설명이 들어갈 자리입니다.\n\n추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 브랜딩', '툴 : Illustrator / InDesign', '연도 : 2026']
  },
  4: {
    title: '디자인 작품 4',
    year: '2025',
    img: 'img/thumbnew_1.png',
    desc: `[목업 텍스트] 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 그래픽 디자인', '연도 : 2025']
  },
  5: {
    title: '디자인 작품 5',
    year: '2025',
    img: 'img/thumbnew_2.png',
    desc: `[목업 텍스트] 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 그래픽 디자인', '연도 : 2025']
  },
  6: {
    title: '디자인 작품 6',
    year: '2025',
    img: 'img/thumbnew_3.png',
    desc: `[목업 텍스트] 추후 실제 내용으로 교체될 예정입니다.`,
    meta: ['카테고리 : 그래픽 디자인', '연도 : 2025']
  }
};

// ── Detail modal open / close ─────────────────────────────────────────

function openDetail(section, idx) {
  const data = section === 'book' ? bookData[idx] : designData[idx];
  if (!data) return;

  document.getElementById('detail-img').src = data.img;
  document.getElementById('detail-img').alt = data.title;
  document.getElementById('detail-num').textContent = `No. ${String(idx).padStart(2, '0')}`;
  document.getElementById('detail-title').textContent = data.title;
  document.getElementById('detail-year').textContent = data.year;
  document.getElementById('detail-desc').innerHTML = data.desc.replace(/\n/g, '<br />');

  const metaEl = document.getElementById('detail-meta');
  metaEl.innerHTML = data.meta.map(m => `<span>${m}</span>`).join('');

  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on backdrop click
document.getElementById('detail-modal').addEventListener('click', function (e) {
  if (e.target === this) closeDetail();
});
