    const fixedCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const input = document.getElementById('customExtensionInput');
    const addBtn = document.getElementById('addBtn');
    const charCount = document.getElementById('charCount');
    const extensionCount = document.getElementById('extensionCount');
    const customList = document.getElementById('customExtensionList');
    const showDbBtn = document.getElementById('showDb');
    const dbOutput = document.getElementById('dbOutput');

    let customExtensions = [];
    let fixedExtensions = [];

    // 입력 글자 수 실시간 업데이트
    input.addEventListener('input', () => {
      charCount.textContent = `${input.value.length}/20`;
    });

    // 초기 데이터 로드
    async function loadData() {
      const res = await fetch('/extensions');
      const data = await res.json();
      customExtensions = data.customExtensions || [];
      fixedExtensions = data.fixedExtensions || [];
      renderCustom();
      renderFixed();
      updateCount();
    }

    // 커스텀 확장자 표시
    function renderCustom() {
      customList.innerHTML = '';
      customExtensions.forEach(ext => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `${ext} <button class="remove-btn" data-ext="${ext}">x</button>`;
        customList.appendChild(tag);
      });
      // X 버튼 이벤트
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ext = btn.getAttribute('data-ext');
          customExtensions = customExtensions.filter(e => e !== ext);
          await saveAll();
          loadData();
        });
      });
    }

    // 고정 확장자 체크박스 표시
    function renderFixed() {
      fixedCheckboxes.forEach(cb => {
        cb.checked = fixedExtensions.includes(cb.value);
        cb.addEventListener('change', async () => {
          fixedExtensions = Array.from(fixedCheckboxes)
            .filter(c => c.checked)
            .map(c => c.value);
          await saveAll();
          loadData();
        });
      });
    }

    // 커스텀 개수 업데이트
    function updateCount() {
      extensionCount.textContent = `${customExtensions.length}/200`;
    }

    // 커스텀 추가
    addBtn.addEventListener('click', async () => {
      const ext = input.value.trim().toLowerCase();
      if (!ext) return;
      if (ext.length > 20) { alert('최대 20자까지 입력 가능합니다.'); return; }
      if (customExtensions.includes(ext)) { alert('이미 추가된 확장자입니다.'); return; }
      if (customExtensions.length >= 200) { alert('최대 200개까지만 추가 가능합니다.'); return; }
      customExtensions.push(ext);
      input.value = '';
      charCount.textContent = '0/20';
      await saveAll();
      loadData();
    });

    // 저장 (customExtensions, fixedExtensions)
    async function saveAll() {
      await fetch('/extensions', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ customExtensions, fixedExtensions })
      });
    }

    // DB 조회 버튼
    showDbBtn.addEventListener('click', async () => {
      const res = await fetch('/extensions');
      const data = await res.json();
      dbOutput.textContent = JSON.stringify(data, null, 2);
    });

    // 초기 실행
    window.addEventListener('DOMContentLoaded', loadData);