document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }



  // 사이트 전체 상담 버튼 문구 통일
  const consultationLabels = [
    '상담 신청', '상담신청', '상담 신청하기',
    '상담문의', '상담 문의', '상담문의하기',
    '지금 상담문의하기', '지금 상담문의', '상담 문의하기'
  ];

  document.querySelectorAll('a[href*="inquiry"], button[type="submit"]').forEach((el) => {
    const current = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const isInquiryLink = el.tagName === 'A' && (el.getAttribute('href') || '').includes('inquiry');
    const isInquirySubmit = el.tagName === 'BUTTON' && el.closest('#inquiryForm');

    if (
      isInquirySubmit ||
      (isInquiryLink && consultationLabels.some(label => current.includes(label)))
    ) {
      el.textContent = '무료상담신청';
      el.setAttribute('aria-label', '무료상담신청');
    }
  });

  const form = document.querySelector('#inquiryForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(form);
    const payload = {};

    for (const [key, value] of fd.entries()) {
      if (payload[key] !== undefined) {
        payload[key] = Array.isArray(payload[key])
          ? [...payload[key], value]
          : [payload[key], value];
      } else {
        payload[key] = value;
      }
    }

    if (!payload.consent) {
      status.textContent = '개인정보 수집 및 이용 동의가 필요합니다.';
      status.style.color = '#b42318';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '접수 중...';
    status.textContent = '상담 신청을 전송하고 있습니다...';
    status.style.color = '#64748b';

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || '전송에 실패했습니다.');
      }

      status.textContent = '상담 신청이 정상 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.';
      status.style.color = '#18794e';
      form.reset();
    } catch (error) {
      status.textContent = error.message || '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      status.style.color = '#b42318';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = '무료상담신청';
    }
  });
});
