// ── UI 다국어 텍스트 ──────────────────────────────────────────────────

const uiText = {
  ko: {
    contactDesc: '제품 구매 및 작업 문의, 기타 문의는<br />아래 버튼을 통해 메일로 보내주세요.'
  },
  en: {
    contactDesc: 'For product purchases, project inquiries,<br />and all other questions, please send us an email.'
  },
  ja: {
    contactDesc: '商品のご購入・お仕事のご依頼、<br />その他のお問い合わせはメールにてお願いします。'
  }
};

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
          if (desc)  designData[id].desc.ko  = desc;
          if (meta.length) designData[id].meta.ko = meta;
        }
        if (section === 'book' && bookData[id]) {
          if (title) bookData[id].title = title;
          if (year)  bookData[id].year  = year;
          if (desc)  bookData[id].desc.ko  = desc;
          if (meta.length) bookData[id].meta.ko = meta;
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

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.body.dataset.lang = lang;

  // UI 텍스트 일괄 교체
  const t = uiText[lang] || uiText.ko;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.innerHTML = t[key];
  });

  // 모달이 열려있으면 현재 언어로 재렌더
  if (document.getElementById('detail-modal').classList.contains('open')) {
    _renderDetail();
  }
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

const GD = 'https://lh3.googleusercontent.com/d/';
const GB = GD; // book images use same CDN

const bookData = {
  1: {
    title: 'SAVE FILE CLUB',
    year: '2026',
    images: [
      GB+'1nXS36CPLZxDxgbxyjodg3FWxrlX4YErA',
      GB+'1PUF1HRp_ApLfhswHCtBMrTtR8QMG9moO',
      GB+'1_-_AgH0j5N6lOOuS9fGkL3p9JURAfEZQ',
      GB+'16H6Rv8dE4TBeEf5tiBN9MU_ALpVrVWEU',
      GB+'1ox7ye2eFLcMhV6BIaPkYSnCetuYGzjZj',
      GB+'1bZGU-nIbs_YSHeNcvcBVMk1bm39CSc6r',
      GB+'1HQaXY6kcRBaSgMdy4yVDe0wSVRFF7YQs',
      GB+'16ZEwJQowdzI33NTzxkKDW00NbhqPvmDE'
    ],
    desc: {
      ko: `『SAVE FILE CLUB』은 디자인을 조금 덜 진지하게 하고 싶다는 생각에서 시작된 책입니다.\n디자인은 멋있는 결과물보다, "거의 다 됐어요"를 외치며 새벽을 버티고, 레퍼런스를 찾다가 갑자기 딴짓을 하고, 에러와 수정 속에서 계속 저장 버튼을 누르는 과정에 더 가깝다고 생각했습니다.\n\n그래서 이 책은 디자인을 버티기 위한 공략집처럼 구성했습니다.\n게임기 형태의 북케이스 안에는 아이디어를 찾는 방법, 마감을 버티는 언어, 에러 속에서 살아남는 방식들을 각각의 게임팩처럼 담았습니다.`,
      en: `『SAVE FILE CLUB』was born from a desire to approach design a little less seriously.\nDesign feels less like producing impressive work and more like surviving late nights yelling "almost done!", getting distracted mid-reference-search, and pressing save over and over through errors and revisions.\n\nSo this book is structured like a strategy guide for surviving design.\nInside the game console-shaped book case, ideas for finding inspiration, language for enduring deadlines, and ways to survive errors are each packed in like game cartridges.`,
      ja: `『SAVE FILE CLUB』は、デザインをもう少し気楽に楽しみたいという気持ちから生まれた本です。\nデザインとは、かっこいい成果物よりも、「もうすぐ完成！」と叫びながら深夜を乗り越え、参考資料を探しながらついよそ見をして、エラーと修正の中でセーブボタンを押し続けるプロセスに近いと思います。\n\nそのためこの本は、デザインを乗り越えるための攻略本のように構成されています。\nゲーム機の形をしたブックケースの中に、アイデアの見つけ方、締め切りを乗り越えるための言葉、エラーの中で生き残る方法が、それぞれゲームカートリッジのように収められています。`
    },
    meta: {
      ko: ['카테고리 : 아트북', '판형 : 67×69mm', '페이지 : 각 20p', '발행 : 2026'],
      en: ['Category : Art Book', 'Format : 67×69mm', 'Pages : 20p each', 'Published : 2026'],
      ja: ['カテゴリー : アートブック', '判型 : 67×69mm', 'ページ : 各20p', '発行 : 2026']
    }
  },
  2: {
    title: 'My Aesthetic Literacy',
    year: '2026',
    images: [
      GB+'1d7ZXddrf00yP-pCM0xAx1DIVmSGE7hI-',
      GB+'1Bav0xV7xBBDGRCp7x0ADA2Z2MCDlfs0S',
      GB+'1VckgVaSsN7h8qi3tJRfUpxu4oYbenYHp',
      GB+'1LkqnkIuvMFHUiukowwElxu4dJzbIFoVv',
      GB+'1DZ3AvsCD9Dih8AWn8tawdd2tzhLwzX4H'
    ],
    desc: {
      ko: `『My Aesthetic Literacy』는 이미지를 수집하고 분류하는 과정을 통해 개인의 미감이 어떻게 형성되는지를 탐구하는 출판물이다.\n\n우리는 수많은 이미지를 저장하고 소비하지만, 정작 왜 그것을 좋아하게 되었는지에 대해서는 깊이 생각하지 않는다. 이 책은 일상 속에서 발견한 시각적 요소들을 기록하고 연결하며, 취향이 만들어지는 과정을 하나의 개인적 아카이브로 풀어낸다.\n\n독자는 책을 읽는 동시에 자신의 미감을 관찰하고 수집하는 경험에 참여하게 된다.`,
      en: `『My Aesthetic Literacy』is a publication exploring how personal aesthetic sensibility is formed through collecting and categorizing images.\n\nWe save and consume countless images, yet rarely think deeply about why we've come to love them. This book records and connects visual elements found in everyday life, tracing how taste is formed as a personal archive.\n\nReaders simultaneously read the book and participate in an experience of observing and collecting their own aesthetic sensibility.`,
      ja: `『My Aesthetic Literacy』は、イメージを収集・分類するプロセスを通じて、個人の美的感性がどのように形成されるかを探求する出版物です。\n\n私たちは無数のイメージを保存・消費しながら、なぜそれを好きになったのかをほとんど深く考えません。この本は日常の中で発見した視覚的要素を記録し繋ぎ合わせ、趣味・嗜好が形成されるプロセスを個人的なアーカイブとして紐解きます。\n\n読者は本を読みながら、自分の美的感性を観察・収集する体験に参加することになります。`
    },
    meta: {
      ko: ['카테고리 : 아트북', '판형 : 120 × 140mm', '페이지 : 88p', '발행 : 2026'],
      en: ['Category : Art Book', 'Format : 120 × 140mm', 'Pages : 88p', 'Published : 2026'],
      ja: ['カテゴリー : アートブック', '判型 : 120 × 140mm', 'ページ : 88p', '発行 : 2026']
    }
  },
  3: {
    title: '별들에게 물어봐',
    year: '2026',
    images: ['img/thumbnew_03.png'],
    desc: {
      ko: `가장 한국인스러운 서울 여행 버킷리스트를 담은 아트북입니다. 서울의 골목과 문화를 경쾌한 일러스트와 함께 기록한 작업입니다.`,
      en: `An art book featuring the most quintessentially Korean Seoul travel bucket list. A work documenting the alleyways and culture of Seoul through vibrant illustrations.`,
      ja: `最もコリアンらしいソウル旅行バケットリストを詰め込んだアートブックです。ソウルの路地裏と文化を、明るいイラストとともに記録した作品です。`
    },
    meta: {
      ko: ['카테고리 : 아트북', '판형 : 148 × 210mm', '페이지 : 64p', '발행 : 2026'],
      en: ['Category : Art Book', 'Format : 148 × 210mm', 'Pages : 64p', 'Published : 2026'],
      ja: ['カテゴリー : アートブック', '判型 : 148 × 210mm', 'ページ : 64p', '発行 : 2026']
    }
  },
};

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
    desc: {
      ko: `ROOT in SEONGSU\nCollage Your Taste\n\n루트인 성수 팝업에서\n키비주얼 디자인과 내부 공간 전반의 비주얼 작업을 진행했습니다.\n\nFASHION · TASTE · RITUAL · BEAUTY\n네 가지 카테고리를 컬러와 그래픽 오브제로 구조화하고,\n공간 전체가 하나의 콜라주처럼 보이도록 설계했습니다.\n\nKV 제작부터\n포토부스, 인테리어, POP 그래픽까지\n브랜드 메시지가 공간 안에서 자연스럽게 경험되도록 작업했습니다.`,
      en: `ROOT in SEONGSU\nCollage Your Taste\n\nAt the Rootin Seongsu pop-up,\nwe handled key visual design and overall visual work throughout the interior space.\n\nFASHION · TASTE · RITUAL · BEAUTY\nFour categories were structured through color and graphic objects,\ndesigned so the entire space reads as a single collage.\n\nFrom KV production to\nphoto booths, interior design, and POP graphics,\nwe ensured the brand message could be experienced naturally within the space.`,
      ja: `ROOT in SEONGSU\nCollage Your Taste\n\nルートイン聖水のポップアップにて\nキービジュアルデザインと空間全体のビジュアルワークを担当しました。\n\nFASHION · TASTE · RITUAL · BEAUTY\n4つのカテゴリーをカラーとグラフィックオブジェクトで構造化し、\n空間全体が一つのコラージュに見えるよう設計しました。\n\nKV制作から\nフォトブース、インテリア、POPグラフィックまで\nブランドメッセージが空間の中で自然に体験できるよう制作しました。`
    },
    meta: {
      ko: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : @rootin.festa'],
      en: ['Category : Brand Identity', 'Client : @rootin.festa'],
      ja: ['カテゴリー : ブランドアイデンティティ', 'クライアント : @rootin.festa']
    }
  },
  2: {
    title: 'Ritchynitche',
    year: '2025',
    images: [
      GD+'1m0J4XZtUGsR9vPNytEtKMA-NlgffQ7Bp',
      GD+'1Wj-dieay2NT7wfYUwIuO7YMCQZcP_476',
      GD+'11OGmsLL3oEZV-W5xJ0OGZqjbbJT4qxx0'
    ],
    desc: {
      ko: `Ritchy Niche Cap Collection 🎀\n\n스크립트 로고에 하트와 날개 라인을 연결해\n키치하면서도 러블리한 무드를 담았습니다.\n\n자수 두께, 캡 곡면 가독성, 컬러 배합까지\n고려한 작업입니다.`,
      en: `Ritchy Niche Cap Collection 🎀\n\nBy connecting heart and wing lines to the script logo,\nwe captured a kitsch yet lovely mood.\n\nEmbroidery thickness, legibility on the cap's curved surface,\nand color combinations were all carefully considered.`,
      ja: `Ritchy Niche Cap Collection 🎀\n\nスクリプトロゴにハートと翼のラインを繋げ、\nキッチュながらもラブリーなムードを表現しました。\n\n刺繍の太さ、キャップの曲面での可読性、\nカラーの組み合わせまで丁寧に考慮した作品です。`
    },
    meta: {
      ko: ['카테고리 : 패션 그래픽디자인', '클라이언트 : @ritchynitche'],
      en: ['Category : Fashion Graphic Design', 'Client : @ritchynitche'],
      ja: ['カテゴリー : ファッショングラフィックデザイン', 'クライアント : @ritchynitche']
    }
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
    desc: {
      ko: `루트인 제주 2025 Wellness Festa\n〈루트인 제주〉 키비주얼 디자인\n\n'잃어버린 낭만을 찾아서'라는 메시지를 중심으로\n제주의 자연과 웰니스 경험을 하나의 그래픽 언어로 정리했습니다.\n\n러프한 타이포는 자유롭고 감성적인 무드를,\n그린과 옐로우 중심의 컬러는 자연·회복·에너지를 상징합니다.\n\n포스터, 맵, 스탬프 미션 카드, 엽서, 현장 POP, 사인물까지\n온·오프라인 전반에 동일한 톤앤매너를 적용했습니다.`,
      en: `Root in Jeju 2025 Wellness Festa\n〈Root in Jeju〉Key Visual Design\n\nCentered on the message 'In search of lost romance,'\nwe organized Jeju's nature and wellness experience into a unified graphic language.\n\nRough typography represents a free and emotional mood,\nwhile the green and yellow palette symbolizes nature, recovery, and energy.\n\nFrom posters, maps, stamp mission cards, postcards, on-site POP, and signage,\nthe same tone and manner was applied across all online and offline touchpoints.`,
      ja: `ルートイン済州 2025 Wellness Festa\n〈ルートイン済州〉キービジュアルデザイン\n\n「失われたロマンを求めて」というメッセージを中心に\n済州の自然とウェルネス体験を一つのグラフィック言語にまとめました。\n\nラフなタイポグラフィは自由で感性的なムードを、\nグリーンとイエロー中心のカラーは自然・回復・エネルギーを象徴します。\n\nポスター、マップ、スタンプミッションカード、ポストカード、現場POP、サインまで\nオン・オフライン全体に同一のトーン&マナーを適用しました。`
    },
    meta: {
      ko: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : @rootin.festa'],
      en: ['Category : Brand Identity', 'Client : @rootin.festa'],
      ja: ['カテゴリー : ブランドアイデンティティ', 'クライアント : @rootin.festa']
    }
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
    desc: {
      ko: `2026년을 시작하며, 당신을 주저하게 만드는 걱정들을 이 종이에 털어놓으세요. 뒷면 점선을 따라 단호하게 접어버리세요.\n1년뒤, 다시 펼쳐보면 알게 될거예요. 당신을 괴롭힌 거대한 걱정들은 사실 종이 한 장의 무게도 안되었다는 것을요.`,
      en: `As 2026 begins, write down the worries holding you back on this paper. Fold it firmly along the dotted lines on the back.\nA year later, when you unfold it again, you'll realize — the enormous worries that troubled you didn't even weigh as much as a single sheet of paper.`,
      ja: `2026年の始まりに、あなたをためらわせる不安をこの紙に書き出してください。裏面の点線に沿ってきっぱりと折りたたんでください。\n1年後、再び開いてみれば気づくはずです。あなたを苦しめた大きな悩みは、実は紙一枚の重さにも満たなかったということを。`
    },
    meta: {
      ko: ['카테고리 : 그래픽 디자인'],
      en: ['Category : Graphic Design'],
      ja: ['カテゴリー : グラフィックデザイン']
    }
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
    desc: {
      ko: `오늘의 평야 브랜딩 작업에 참여했습니다.\n\n전북 김제 평야에서 시작된 이 브랜드는\n'갓 도정한 쌀을 가장 맛있는 순간에 전달한다'는 가치에서 출발합니다.\n\n평야라는 이름이 가진 넓고 단단한 이미지를 바탕으로, 브랜드의 톤과 비주얼 방향을 함께 설계했습니다.\n패키지 디자인 작업 및 홈페이지 디자인을 함께 진행했습니다.`,
      en: `I participated in the branding work for Oneul-ui Pyeongya (Today's Plain).\n\nThis brand, born from the plains of Gimje in North Jeolla Province,\nstarts from the value of 'delivering freshly milled rice at its most delicious moment.'\n\nBased on the wide, solid image held by the name 'plain,' we designed the brand's tone and visual direction together.\nPackaging design and website design were also carried out together.`,
      ja: `今日の平野のブランディング作業に参加しました。\n\n全羅北道金堤の平野から始まったこのブランドは、\n「精米したてのお米を一番美味しい瞬間に届ける」という価値から出発しています。\n\n「平野」という名前が持つ広くて力強いイメージをベースに、\nブランドのトーンとビジュアルの方向性を共に設計しました。\nパッケージデザインとウェブサイトデザインも一緒に進めました。`
    },
    meta: {
      ko: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : 오늘의 평야 @todayfield.official'],
      en: ['Category : Brand Identity', 'Client : Oneul-ui Pyeongya @todayfield.official'],
      ja: ['カテゴリー : ブランドアイデンティティ', 'クライアント : 오늘의 평야 @todayfield.official']
    }
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
    desc: {
      ko: `Daki는 한국 말차를 기반으로 한 음료 브랜드 프로젝트입니다.\n기존 로고를 리브랜딩 하면서 브랜드 전반 아이덴티티 작업을 진행했습니다.`,
      en: `Daki is a beverage brand project based on Korean matcha.\nWe carried out a full brand identity project while rebranding the existing logo.`,
      ja: `DakiはKorean Matchaを基盤とした飲料ブランドプロジェクトです。\n既存のロゴをリブランディングしながら、ブランド全体のアイデンティティ制作を行いました。`
    },
    meta: {
      ko: ['카테고리 : 브랜드 아이덴티티', '클라이언트 : Daki'],
      en: ['Category : Brand Identity', 'Client : Daki'],
      ja: ['カテゴリー : ブランドアイデンティティ', 'クライアント : Daki']
    }
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

  const imgs = data.images || (data.img ? [data.img] : []);
  const item = imgs[_detailImgIdx];

  // 미디어 영역 교체
  const wrap = document.querySelector('.detail-img-wrap');
  const oldEl = wrap.querySelector('.detail-media-el');
  const newEl = _makeMediaEl(item);
  if (oldEl) wrap.replaceChild(newEl, oldEl);
  else wrap.insertBefore(newEl, wrap.firstChild);
  newEl.id = 'detail-img';

  // 현재 언어로 desc/meta 가져오기 (객체면 언어별, 문자열이면 그대로)
  const lang = currentLang || 'ko';
  const desc = typeof data.desc === 'object' ? (data.desc[lang] || data.desc.ko || '') : (data.desc || '');
  const meta = typeof data.meta === 'object' && !Array.isArray(data.meta)
    ? (data.meta[lang] || data.meta.ko || [])
    : (data.meta || []);

  document.getElementById('detail-num').textContent = `No. ${String(_detailItemIdx).padStart(2, '0')}`;
  document.getElementById('detail-title').textContent = data.title;
  document.getElementById('detail-year').textContent = data.year;
  document.getElementById('detail-desc').innerHTML = desc.replace(/\n/g, '<br />');
  document.getElementById('detail-meta').innerHTML = meta.map(m => `<span>${m}</span>`).join('');

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
  const data = _detailSection === 'design' ? designData[_detailItemIdx] : bookData[_detailItemIdx];
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
