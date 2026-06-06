// ── Google Sheets 데이터 로드 ─────────────────────────────────────────

const SHEET_ID = '1N0LHf0FbKkUSMgKCWRtQWWzy_MAhu9j8TdhtM_Wdj18';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function loadSheetData() {
  return fetch(SHEET_URL)
    .then(r => r.text())
    .then(raw => {
      const json = JSON.parse(raw.match(/setResponse\(([\s\S]*)\)/)[1]);
      const rows = json.table.rows;
      if (!rows || rows.length === 0) return;

      rows.forEach(row => {
        const c = row.c;
        const get = i => (c[i] && c[i].v != null ? String(c[i].v) : '');
        const section = get(0);
        const id      = parseInt(get(1));
        const title   = get(2);
        // "2026.0" → "2026", "2025.06" → "2025.06" 유지
        const year    = get(3).replace(/\.0$/, '');
        const desc    = get(4);
        // ; 또는 / 로 구분된 meta 처리
        const rawMeta = get(5);
        const meta    = (rawMeta.includes(';')
          ? rawMeta.split(';')
          : rawMeta.split('/')
        ).map(s => s.trim()).filter(Boolean);

        if (section === 'design' && designData[id]) {
          if (title) designData[id].title = title;
          if (year)  designData[id].year  = year;
          if (desc)  designData[id].desc  = desc;
          if (meta.length) designData[id].meta = meta;
        }
        if (section === 'book' && bookData[id]) {
          if (title) bookData[id].title = title;
          if (year)  bookData[id].year  = year;
          if (desc)  bookData[id].desc  = desc;
          if (meta.length) bookData[id].meta = meta;
        }
      });
    })
    .catch(() => {});
}

// 페이지 로드 시 시트 데이터 동기화
document.addEventListener('DOMContentLoaded', () => {
  loadSheetData();
});

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
  if (currentSection && currentSection !== name) {
    const prev = document.getElementById(currentSection + '-page');
    if (prev) prev.classList.remove('open');
  }

  const page = document.getElementById(name + '-page');
  if (!page) return;

  document.getElementById('main-page').classList.add('slide-up');

  requestAnimationFrame(() => {
    page.classList.add('open');
  });

  currentSection = name;

  // 섹션 헤더 표시, 메인 lang 토글 숨김
  document.getElementById('section-header').classList.add('visible');
  document.getElementById('lang-toggle').classList.add('hidden');

  // 사이드바 active 상태 업데이트
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

  // 섹션 헤더 숨김, 메인 lang 토글 복원
  document.getElementById('section-header').classList.remove('visible');
  document.getElementById('lang-toggle').classList.remove('hidden');
}

// ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('detail-modal').classList.contains('open')) {
      closeDetail();
    } else {
      closeSection();
    }
  }
  // 모달 열린 상태에서 화살표 키로 이미지 이동
  if (document.getElementById('detail-modal').classList.contains('open')) {
    if (e.key === 'ArrowLeft')  detailImgNav(-1);
    if (e.key === 'ArrowRight') detailImgNav(1);
  }
});

// ── Mobile nav ────────────────────────────────────────────────────────

function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

// (design slider removed — now using grid + modal)

// ── Detail modal data ─────────────────────────────────────────────────

const bookData = {
  1: {
    title: '별들에게 물어봐',
    year: '2026',
    img: 'img/thumbnew_1.png',
    desc: `가장 한국인스러운 서울 여행 버킷리스트를 담은 아트북입니다. 서울의 골목과 문화를 경쾌한 일러스트와 함께 기록한 작업입니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 64p', '발행 : 2026']
  },
  2: {
    title: 'SAVE FILE CLUB',
    year: '2026',
    img: 'img/thumbnew_2.png',
    desc: `게임 문화에서 영감을 받은 아트북입니다. 플레이어의 기억과 세이브 포인트를 은유로 삼아, 일상의 소중한 순간을 기록하는 방식에 대해 이야기합니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 80p', '발행 : 2026']
  },
  3: {
    title: '걱정을 접자',
    year: '2026',
    img: 'img/thumbnew_3.png',
    desc: `일상의 걱정과 불안을 종이접기처럼 접어 내려놓는 이야기를 담은 아트북입니다. 텍스트와 이미지의 균형 속에서 독자에게 작은 위로를 전합니다.`,
    meta: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 56p', '발행 : 2026']
  },
};

const GD = 'https://lh3.googleusercontent.com/d/';

const designData = {
  1: {
    title: 'Rootin Seongsu',
    year: '2025',
    images: [
      GD+'1SZseg-WkAKkYoTwIzknzwCX80EDKO8ag',
      GD+'171M-2SO6BmQ2STdwvcKMbt1a7OlbULLQ',
      GD+'142P-Kcohgw83Czt5m21M_idfh2EhX3RM',
      GD+'1wPfjkpGD8Vad6Fd3qMq5EVr63Vp3j7mV',
      GD+'1F9YMgLKBTjXCJxuEVCPNfCDoWY4bC0U7',
      GD+'1-3SZRDWdYb5ST-dvKnOwVom_0XyajE_P',
      GD+'1rTai52WQHhO_Bi3x3dttaaBYCewg-eCU',
      GD+'1KwYi-X54JzStgulFdeEOLi_EKFsXuxxH',
      GD+'1ecOqsM6w05bgn5duVBkdaXDsE7f69g_H',
      GD+'1htxtT74HAqjfmwrUnPjwzc7xA1dc3Duz',
      GD+'1wBCI017VGJApWMDBnCGBKmrhSOhH8j1V',
      GD+'1mUXBAx-xtv1pfxx01qnAvoRXwjNVyhyr',
      GD+'1HeDSxjLClnExF7r9smKf3MYGIQAcTFdR',
      GD+'140f1RBisjG_NTayfoA3dAGN9MAKykDrw',
      GD+'1gD05Z8z9if0ZgmQZQZ1fuAzqYjDPD1nv',
      GD+'1AEGenyRhRkAqrREo0qtOrjZ-r-2HIqgn',
      GD+'1QAptFvHI78c15gIkM8u1TNp7Oh33q5_U'
    ],
    desc: `ROOT in SEONGSU\nCollage Your Taste\n\n루트인 성수 팝업에서\n키비주얼 디자인과 내부 공간 전반의 비주얼 작업을 진행했습니다.\n\nFASHION · TASTE · RITUAL · BEAUTY\n네 가지 카테고리를 컬러와 그래픽 오브제로 구조화하고,\n공간 전체가 하나의 콜라주처럼 보이도록 설계했습니다.\n\nKV 제작부터\n포토부스, 인테리어, POP 그래픽까지\n브랜드 메시지가 공간 안에서 자연스럽게 경험되도록 작업했습니다.`,
    meta: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : @rootin.festa']
  },
  2: {
    title: 'Ritchynitche',
    year: '2025',
    images: [
      GD+'1m0J4XZtUGsR9vPNytEtKMA-NlgffQ7Bp',
      GD+'1Wj-dieay2NT7wfYUwIuO7YMCQZcP_476',
      GD+'11OGmsLL3oEZV-W5xJ0OGZqjbbJT4qxx0'
    ],
    desc: `Ritchy Niche Cap Collection 🎀\n\n스크립트 로고에 하트와 날개 라인을 연결해\n키치하면서도 러블리한 무드를 담았습니다.\n\n자수 두께, 캡 곡면 가독성, 컬러 배합까지\n고려한 작업입니다.`,
    meta: ['카테고리 : 패션 그래픽디자인', '클라이언트 : @ritchynitche']
  },
  3: {
    title: '루트인 제주',
    year: '2025',
    images: [
      GD+'1aNc98TuC41B5hrxdzEECdV_vzRqg90CT',
      GD+'18oaPD5zWQrE4bS_FNuHw1kxZIBdRgR7J',
      GD+'1vu-H3fJ59Ajc8A-12dOSeH28rSwDNmXW',
      GD+'19xOEVaXlS_nPmM-45EcFE45t3P8Oztkg',
      GD+'1U6p1W4CVWBh5TZdn7ejd8AYHbOh-jVWU',
      GD+'1JZJAiUGrflG-IA-6Cr_Rvi-0UHYw-zvV',
      GD+'1f1B0DBadmt3MO-VQRdUDw2pWF4mw9MEL',
      GD+'1rr7eN0S8FW56_C2CEb32P-30PhYYhapH',
      GD+'1YbZWfnafizaxOyMxpGQEuK2ki8LJ2RCW',
      GD+'1DlVkqVou47z62UUlSuGzdZrmLSaOEXft',
      GD+'1OQQCM6xxIDeZgxgi_Om46a2p3Yy9dvbV',
      GD+'1qg6h0sCb-YFa7jkiCxfe4WkAz_-_BvMw',
      GD+'1bk604sDHIVdQXgtTxJCzJV6dvYv7TL6s'
    ],
    desc: `루트인 제주 2025 Wellness Festa\n〈루트인 제주〉 키비주얼 디자인\n\n'잃어버린 낭만을 찾아서'라는 메시지를 중심으로\n제주의 자연과 웰니스 경험을 하나의 그래픽 언어로 정리했습니다.\n\n러프한 타이포는 자유롭고 감성적인 무드를,\n그린과 옐로우 중심의 컬러는 자연·회복·에너지를 상징합니다.\n\n포스터, 맵, 스탬프 미션 카드, 엽서, 현장 POP, 사인물까지\n온·오프라인 전반에 동일한 톤앤매너를 적용했습니다.`,
    meta: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : @rootin.festa']
  },
  4: {
    title: '2026 연하장',
    year: '2026',
    images: [
      GD+'1gnhKs_odbSQ5uIoYRgpXIav_enx3qjLL',
      GD+'1dFKghdVs4Ufxk_0UUbksCrGVTMG58x5F',
      GD+'13b4dGp5m6Vs8J61OlTiVtvOD5lZ4TvX6',
      GD+'1s_Y9XLlAWocoA3wCrwSi5Q10JZKXN2dT',
      GD+'1aUYD2DruPFDSlkiI8pedmLkFf-T5ztmF',
      GD+'1iQMr1P8zXB0Qjtj3FTQQTqF1V224i3KW',
      GD+'1G_OmnheViGgCNG-XoC09TZ-wa3nxfjc0',
      GD+'12FRgfOO-gCf7_Z7cykkcM88WrTEnJHcU',
      GD+'1_OYN9vg4jvBH9dWJUlKKg2BJTWmrQdub',
      GD+'1ukXL_jjqU98J7S-NYUMobsTVw_kpEDWi',
      GD+'1T6iBZ0_SK3j21Mmndhv03MIu4jzS1ohm',
      GD+'1lLdGWHx4E5HqfaVYs2z9U3ngLD_Q3wfy',
      GD+'1r7Hltl3wkzg0LTovV0SRzuJDqQEUyvip',
      GD+'1aqWcHiKxJPHOCEBD4IN95ifbNSVkLVdY',
      GD+'1W9b5675W3VPfMEWCqzjzVBFd3W5MFaY7'
    ],
    desc: `2026년을 시작하며, 당신을 주저하게 만드는 걱정들을 이 종이에 털어놓으세요. 뒷면 점선을 따라 단호하게 접어버리세요.\n1년뒤, 다시 펼쳐보면 알게 될거예요. 당신을 괴롭힌 거대한 걱정들은 사실 종이 한 장의 무게도 안되었다는 것을요.`,
    meta: ['카테고리 : 그래픽 디자인']
  },
  5: {
    title: '오늘의 평야',
    year: '2025',
    images: [
      GD+'1aquzuErO25HW_m1M5xDCDF0sBqc1hhxd',
      GD+'1g0YkML9bwA__-KFid7-EXWLz7hKKXO3h',
      GD+'1QlevYa3OP-9lxkQ-f2wRl1qvDJSmMCvH',
      GD+'18J0ZnfHkr22mnsO3azsV4837HwqYZp-h',
      GD+'1uctjNvM3T8_5XsT1bim96H_3C9MiKIgL',
      GD+'1AjsVWJSrBzq-slOnEkIpDAKV6RbRXh8I',
      GD+'1Cd_EiMUSoDqHsf2uUp5T_t_F4sifWaZp',
      GD+'1L93XQPbAinZ3To25Y2WtZ34LdSEaj4WA',
      GD+'1B4fYD1bBqsQ8jj9gLwc9wBwQpR49TxLJ',
      GD+'10xF8IoqCTYjnrskpmEc7FlFhY3hp27qN',
      GD+'1EQ1uFZ4Dq6p4o1VdzHuPvexahpMsNPnR',
      GD+'1HMEQwP17PXzy2dBLlDdMms-e3MEBjYDB',
      GD+'1qjxQP_OvjgoQvUMXH53GuHGx7PO4mL5c',
      GD+'1MEfbSQR6gxeEzBlaiX6xPAT2i4BKIztr'
    ],
    desc: `오늘의 평야 브랜딩 작업에 참여했습니다.\n\n전북 김제 평야에서 시작된 이 브랜드는\n'갓 도정한 쌀을 가장 맛있는 순간에 전달한다'는 가치에서 출발합니다.\n\n평야라는 이름이 가진 넓고 단단한 이미지를 바탕으로, 브랜드의 톤과 비주얼 방향을 함께 설계했습니다.\n패키지 디자인 작업 및 홈페이지 디자인을 함께 진행했습니다.`,
    meta: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : 오늘의 평야 @todayfield.official']
  },
  6: {
    title: 'Daki',
    year: '2025',
    images: [
      GD+'1qYqXGRV0B-0Gi6ubTeMYKZj4zl4TZ_PD',
      GD+'11eiXZ7PA1CuqLq1wrGV6OrU-h8Zwa0M2',
      GD+'1dPui1LL3RhS4FJeuwiZf2GUV9Dp-b0Dg',
      GD+'14V1MHNfa-QlFs7G-fKgxAs7lnXbdQsZI',
      GD+'1Jpsz3kRYFOU-EbBaopLI-6k6aXGgoWeG',
      GD+'1OMEwk673o7R6Eutv6W86oT3BLxhO7PU_',
      GD+'1SI8V9q4jFhuOVP2QIV7jEjmrwIH_JlX8',
      GD+'1Cs-Wwqf8CrjqJzTQ9Y419LyVOXxVUe3_',
      GD+'12AYubMfOeTpmyfDn9N3curdrgJUqMnVE',
      { type: 'video', id: '193PLM3qvs85qeYro340ZNpjXr6mu4l90' }
    ],
    desc: `Daki는 한국 말차를 기반으로 한 음료 브랜드 프로젝트입니다.\n기존 로고를 리브랜딩 하면서 브랜드 전반 아이덴티티 작업을 진행했습니다.`,
    meta: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : Daki']
  }
};

// ── Detail modal open / close ─────────────────────────────────────────

let _detailSection = null;
let _detailItemIdx = 0;
let _detailImgIdx = 0;
let _detailAnimating = false;

// 미디어 아이템이 영상인지 판별
function _isVideo(item) {
  return item && typeof item === 'object' && item.type === 'video';
}

// img 또는 iframe 엘리먼트 생성
function _makeMediaEl(item) {
  if (_isVideo(item)) {
    const el = document.createElement('iframe');
    el.src = `https://drive.google.com/file/d/${item.id}/preview`;
    el.setAttribute('frameborder', '0');
    el.setAttribute('allowfullscreen', '');
    el.setAttribute('allow', 'autoplay');
    el.className = 'detail-media-el';
    return el;
  }
  const el = document.createElement('img');
  el.src = typeof item === 'string' ? item : '';
  el.alt = '';
  el.className = 'detail-media-el';
  return el;
}

function openDetail(section, idx) {
  _detailSection = section;
  _detailItemIdx = idx;
  _detailImgIdx = 0;
  _detailAnimating = false;
  _renderDetail();
  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openDesignDetail(idx) {
  openDetail('design', idx);
}

function _renderDetail() {
  const data = _detailSection === 'book' ? bookData[_detailItemIdx] : designData[_detailItemIdx];
  if (!data) return;

  const imgs = _detailSection === 'design' ? data.images : [data.img];
  const item = imgs[_detailImgIdx];

  // 미디어 영역 교체
  const wrap = document.querySelector('.detail-img-wrap');
  const oldEl = wrap.querySelector('.detail-media-el');
  const newEl = _makeMediaEl(item);
  if (oldEl) wrap.replaceChild(newEl, oldEl);
  else wrap.insertBefore(newEl, wrap.firstChild);
  newEl.id = 'detail-img';

  document.getElementById('detail-num').textContent = `No. ${String(_detailItemIdx).padStart(2, '0')}`;
  document.getElementById('detail-title').textContent = data.title;
  document.getElementById('detail-year').textContent = data.year;
  document.getElementById('detail-desc').innerHTML = data.desc.replace(/\n/g, '<br />');
  document.getElementById('detail-meta').innerHTML = data.meta.map(m => `<span>${m}</span>`).join('');

  _updateDetailArrows(imgs);
}

function _updateDetailArrows(imgs) {
  const prevBtn = document.getElementById('detail-img-prev');
  const nextBtn = document.getElementById('detail-img-next');
  if (imgs.length > 1) {
    prevBtn.style.display = _detailImgIdx > 0        ? 'flex' : 'none';
    nextBtn.style.display = _detailImgIdx < imgs.length - 1 ? 'flex' : 'none';
  } else {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}

function detailImgNav(dir) {
  if (_detailAnimating) return;
  const data = _detailSection === 'design' ? designData[_detailItemIdx] : null;
  if (!data || !data.images) return;
  const newIdx = _detailImgIdx + dir;
  if (newIdx < 0 || newIdx >= data.images.length) return;

  _detailAnimating = true;
  const wrap = document.querySelector('.detail-img-wrap');
  const curEl = wrap.querySelector('.detail-media-el');
  const newEl = _makeMediaEl(data.images[newIdx]);
  const DURATION = 420;
  const ease = 'cubic-bezier(0.77, 0, 0.18, 1)';

  // 새 엘리먼트를 화면 밖에 배치
  newEl.style.cssText = `position:absolute;inset:0;width:100%;height:100%;transform:translateX(${dir > 0 ? '100%' : '-100%'});`;
  wrap.insertBefore(newEl, document.getElementById('detail-img-prev'));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newEl.style.transition  = `transform ${DURATION}ms ${ease}`;
      curEl.style.transition  = `transform ${DURATION}ms ${ease}`;
      newEl.style.transform   = 'translateX(0)';
      curEl.style.transform   = `translateX(${dir > 0 ? '-100%' : '100%'})`;
    });
  });

  setTimeout(() => {
    curEl.remove();
    newEl.removeAttribute('style');
    newEl.id = 'detail-img';
    newEl.className = 'detail-media-el';
    _detailImgIdx = newIdx;
    _detailAnimating = false;
    _updateDetailArrows(data.images);
  }, DURATION);
}

function closeDetail() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
  _detailImgIdx = 0;
  _detailAnimating = false;
}

// Close modal on backdrop click
document.getElementById('detail-modal').addEventListener('click', function (e) {
  if (e.target === this) closeDetail();
});
