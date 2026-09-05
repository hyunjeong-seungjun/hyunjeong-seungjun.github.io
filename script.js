(() => {
  "use strict";

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const resetScrollPosition = () => {
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  window.addEventListener("pageshow", resetScrollPosition);
  window.addEventListener("load", resetScrollPosition, { once: true });

  if (window.top !== window.self) {
    document.documentElement.replaceChildren();
    return;
  }

  const weddingDate = new Date("2027-01-17T00:00:00+09:00");
  const countdown = document.querySelector("#countdown");
  const toast = document.querySelector("#toast");
  const copyButton = document.querySelector("#copy-link");
  const shareButton = document.querySelector("#native-share");
  const captureShield = document.querySelector("#capture-shield");
  const invitationUrl = "https://hyunjeong-seungjun.github.io/";
  const protectedImagePath = atob("YXNzZXRzL2ltYWdlcy9vcHRpbWl6ZWQvbWFpbi1tb2JpbGUuanBnP3Y9Y2xlYW4tMQ==");

  const visiblePhotoAreas = new Set();

  if ("IntersectionObserver" in window) {
    const photoVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visiblePhotoAreas.add(entry.target);
        else visiblePhotoAreas.delete(entry.target);
      });
    }, { threshold: 0.01 });

    document.querySelectorAll(".cover-frame, .gallery-photo").forEach((area) => {
      photoVisibilityObserver.observe(area);
    });
  }

  const preventPhotoPinch = (event) => {
    if (visiblePhotoAreas.size) event.preventDefault();
  };
  document.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) preventPhotoPinch(event);
  }, { passive: false });
  document.addEventListener("gesturestart", preventPhotoPinch, { passive: false });
  document.addEventListener("gesturechange", preventPhotoPinch, { passive: false });

  const protectedImage = new Image();
  protectedImage.decoding = "async";
  protectedImage.addEventListener("load", () => {
    document.querySelectorAll("[data-protected-canvas]").forEach((canvas) => {
      const context = canvas.getContext("2d", { alpha: false });
      context.drawImage(protectedImage, 0, 0, canvas.width, canvas.height);
      canvas.dataset.ready = "true";
    });
  }, { once: true });
  protectedImage.src = protectedImagePath;

  const isProtectedTarget = (target) => Boolean(
    target.closest?.(".cover-frame, .gallery-photo, img, canvas")
  );

  let captureShieldTimer;
  const activateCaptureShield = () => {
    window.clearTimeout(captureShieldTimer);
    captureShield.classList.add("is-active");
    captureShield.setAttribute("aria-hidden", "false");
  };
  const releaseCaptureShield = (notify = false) => {
    captureShieldTimer = window.setTimeout(() => {
      captureShield.classList.remove("is-active");
      captureShield.setAttribute("aria-hidden", "true");
      if (notify) showMessage("화면 캡처가 제한되어 있습니다.");
    }, 500);
  };

  ["contextmenu", "dragstart", "selectstart", "auxclick"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (isProtectedTarget(event.target)) event.preventDefault();
    });
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "printscreen") {
      event.preventDefault();
      activateCaptureShield();
      releaseCaptureShield(true);
      return;
    }
    const blockedDeveloperShortcut = event.key === "F12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (event.ctrlKey && ["u", "s"].includes(key));
    const blockedZoomShortcut = event.ctrlKey && ["+", "-", "=", "0"].includes(key);
    if (blockedDeveloperShortcut || blockedZoomShortcut) event.preventDefault();
  });

  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });
  document.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault(), { passive: false });
  });

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
      await navigator.clipboard.writeText(invitationUrl);
      showMessage("초대장 링크를 복사했습니다.");
    } catch {
      const field = document.createElement("textarea");
      field.value = invitationUrl;
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

  shareButton.addEventListener("click", async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: "박승준 · 정현정 결혼합니다",
        text: "2027년 1월 17일 오후 2시, 더채플앳청담 커티지홀",
        url: invitationUrl
      });
    } catch (error) {
      if (error.name !== "AbortError") showMessage("공유하지 못했습니다. 링크 복사를 이용해 주세요.");
    }
  });

  updateCountdown();

  const envelope = document.querySelector("#envelope-shell");
  const envelopeFramePath = document.querySelector("#envelope-frame-path");
  const envelopePocketPath = document.querySelector("#envelope-pocket-path");
  const envelopeFoldShadowPath = document.querySelector("#envelope-fold-shadow-path");
  const updateEnvelope = () => {
    const viewport = Math.max(window.innerHeight, 1);
    const frameLinear = Math.min(Math.max(window.scrollY / 40, 0), 1);
    const frameProgress = frameLinear * frameLinear * (3 - 2 * frameLinear);
    const openProgress = Math.min(Math.max(window.scrollY / (viewport * 0.78), 0), 1);
    const pocketLinear = Math.min(Math.max(window.scrollY / (viewport * 0.42), 0), 1);
    const pocketProgress = pocketLinear * pocketLinear * (3 - 2 * pocketLinear);
    const dismissProgress = Math.min(Math.max((window.scrollY - viewport * 0.45) / (viewport * 0.25), 0), 1);
    const inset = 3 * (1 - frameProgress);
    const top = 4 * (1 - frameProgress);
    const shoulder = 69 + openProgress * 3;
    const valley = 78 + openProgress * 3;
    const flapTip = valley - 2.2;
    envelopeFramePath.setAttribute(
      "d",
      `M0 0H100V100H0Z M${inset.toFixed(3)} ${top.toFixed(3)}H${(100 - inset).toFixed(3)}V100H${inset.toFixed(3)}Z`
    );
    envelopePocketPath.setAttribute(
      "d",
      `M0 ${shoulder.toFixed(3)}C28 ${(shoulder + 5).toFixed(3)} 40 ${valley.toFixed(3)} 50 ${valley.toFixed(3)}C60 ${valley.toFixed(3)} 72 ${(shoulder + 5).toFixed(3)} 100 ${shoulder.toFixed(3)}V100H0Z`
    );
    envelopeFoldShadowPath.setAttribute(
      "d",
      `M0 100L44 ${valley.toFixed(3)}C46 ${(valley - 1).toFixed(3)} 47 ${flapTip.toFixed(3)} 50 ${flapTip.toFixed(3)}C53 ${flapTip.toFixed(3)} 54 ${(valley - 1).toFixed(3)} 56 ${valley.toFixed(3)}L100 100Z`
    );
    const pocketTransform = `translate(0 ${(pocketProgress * 40).toFixed(3)})`;
    envelopePocketPath.setAttribute("transform", pocketTransform);
    envelopeFoldShadowPath.setAttribute("transform", pocketTransform);
    envelope.style.setProperty("--frame-open", frameProgress.toFixed(3));
    envelope.style.setProperty("--open", openProgress.toFixed(3));
    envelope.style.setProperty("--pocket-dismiss", pocketProgress.toFixed(3));
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
