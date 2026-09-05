(() => {
  "use strict";

  const weddingDate = new Date("2027-01-17T00:00:00+09:00");
  const countdown = document.querySelector("#countdown");
  const toast = document.querySelector("#toast");
  const copyButton = document.querySelector("#copy-link");
  const shareButton = document.querySelector("#native-share");

  const updateCountdown = () => {
    const today = new Date();
    const todayInKorea = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    todayInKorea.setHours(0, 0, 0, 0);

    const remainingDays = Math.ceil((weddingDate - todayInKorea) / 86400000);
    if (remainingDays > 0) {
      countdown.textContent = `승준 ♥ 현정의 결혼식까지 ${remainingDays}일 남았습니다.`;
    } else if (remainingDays === 0) {
      countdown.textContent = "오늘, 저희 두 사람이 결혼합니다.";
    } else {
      countdown.textContent = "축복해 주신 모든 분께 감사드립니다.";
    }
  };

  const showMessage = (message) => {
    toast.textContent = message;
    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => {
      toast.textContent = "";
    }, 2400);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showMessage("초대장 링크를 복사했습니다.");
    } catch {
      const field = document.createElement("textarea");
      field.value = window.location.href;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      showMessage(copied ? "초대장 링크를 복사했습니다." : "링크 복사에 실패했습니다.");
    }
  };

  copyButton.addEventListener("click", copyLink);

  if (navigator.share) {
    shareButton.addEventListener("click", async () => {
      try {
        await navigator.share({
          title: "박승준 · 정현정 결혼합니다",
          text: "2027년 1월 17일 일요일, 더채플앳청담",
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== "AbortError") showMessage("공유하지 못했습니다. 링크 복사를 이용해 주세요.");
      }
    });
  } else {
    shareButton.textContent = "링크 공유";
    shareButton.addEventListener("click", copyLink);
  }

  updateCountdown();

  const envelope = document.querySelector("#envelope-shell");
  const updateEnvelope = () => {
    const viewport = Math.max(window.innerHeight, 1);
    const frameLinear = Math.min(Math.max(window.scrollY / 40, 0), 1);
    const frameProgress = frameLinear * frameLinear * (3 - 2 * frameLinear);
    const openProgress = Math.min(Math.max(window.scrollY / (viewport * 0.78), 0), 1);
    const dismissProgress = Math.min(Math.max((window.scrollY - viewport * 2.35) / (viewport * 0.5), 0), 1);
    envelope.style.setProperty("--frame-open", frameProgress.toFixed(3));
    envelope.style.setProperty("--open", openProgress.toFixed(3));
    envelope.style.setProperty("--dismiss", dismissProgress.toFixed(3));
  };

  window.addEventListener("scroll", updateEnvelope, { passive: true });
  window.addEventListener("resize", updateEnvelope);
  updateEnvelope();

  document.documentElement.classList.add("motion-ready");
  const revealTargets = document.querySelectorAll(
    ".section > *:not(.section-no), .person-card"
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((target) => {
      target.classList.add("reveal");
      observer.observe(target);
    });

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });

    document.querySelectorAll(".schedule, .location, .account").forEach((section) => {
      sectionObserver.observe(section);
    });
  }
})();
