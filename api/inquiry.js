export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram environment variables are missing.");
    return res.status(503).json({
      message: "상담 알림 설정이 아직 완료되지 않았습니다."
    });
  }

  const d = req.body || {};

  // Honeypot: real visitors never fill this.
  if (d.website) {
    return res.status(200).json({ ok: true });
  }

  const name = String(d.name || "").trim().slice(0, 80);
  const phone = String(d.phone || "").trim().slice(0, 40);
  const budget = String(d.budget || "미선택").trim().slice(0, 80);
  const experience = String(d.experience || "미선택").trim().slice(0, 80);
  const message = String(d.message || "없음").trim().slice(0, 2000);
  const consent = d.consent === "yes" || d.consent === true;

  const interests = Array.isArray(d.interests)
    ? d.interests.map(v => String(v).trim()).filter(Boolean).slice(0, 10)
    : d.interests
      ? [String(d.interests).trim()]
      : [];

  if (!name || !phone || !consent) {
    return res.status(400).json({
      message: "이름, 연락처, 개인정보 동의를 확인해주세요."
    });
  }

  // Basic phone input sanity check without enforcing one exact format.
  if (!/^[0-9+\-\s().]{8,24}$/.test(phone)) {
    return res.status(400).json({
      message: "연락처 형식을 확인해주세요."
    });
  }

  const now = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());

  const text = [
    "📩 신규 상담 신청",
    "",
    `👤 이름: ${name}`,
    `📞 연락처: ${phone}`,
    `💰 투자 가능 금액: ${budget}`,
    `📊 투자 경험: ${experience}`,
    `⭐ 관심 상품: ${interests.length ? interests.join(", ") : "미선택"}`,
    `📝 문의내용: ${message || "없음"}`,
    "",
    `🕒 접수시간: ${now}`,
    "✅ 개인정보 수집·이용 동의: 완료"
  ].join("\n");

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true
        })
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error("Telegram API error:", telegramData);
      return res.status(502).json({
        message: "상담 알림 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "상담 신청이 접수되었습니다."
    });
  } catch (error) {
    console.error("Telegram send failed:", error);
    return res.status(502).json({
      message: "상담 알림 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
    });
  }
}
