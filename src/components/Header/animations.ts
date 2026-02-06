import { gsap } from "gsap";

let scrollHandler: (() => void) | null = null;
let requestId: number | null = null;

let tlScroll: gsap.core.Timeline | null = null;
let tlFadeIn: gsap.core.Timeline | null = null;

let mm: gsap.MatchMedia | null = null;

export const init = (isHomepage = false) => {
  const animationStart = 0;
  const animationEnd = 200;

  tlFadeIn = gsap
    .timeline()
    // .fromTo("header", { autoAlpha: 0 }, { duration: 0.2, autoAlpha: 1 })
    .fromTo("main", { autoAlpha: 0 }, { duration: 0.2, autoAlpha: 1 }, "<");

  // Fade-in: consider fromTo if you keep Tailwind's `invisible`
  tlFadeIn = gsap
    .timeline()
    .fromTo("header", { autoAlpha: 0 }, { duration: 0.2, autoAlpha: 1 })
    .fromTo("main", { autoAlpha: 0 }, { duration: 0.2, autoAlpha: 1 }, "<");

  // If not homepage, don't create scroll behavior at all
  if (!isHomepage) return;

  tlScroll = gsap.timeline({ paused: true }).addLabel("start");

  function update() {
    const progress = (window.scrollY - animationStart) / animationEnd;

    if (!tlScroll) return;

    // clamp progress so we don't leave it in a weird state
    const clamped = Math.max(0, Math.min(1, progress));
    tlScroll.progress(clamped);

    const spacer = document.getElementById("header-spacer");
    if (spacer) spacer.style.height = `${clamped * animationEnd}px`;

    requestId = null;
  }

  mm = gsap.matchMedia();

  mm.add("(min-width: 40rem)", () => {
    tlScroll!
      .from(
        "header > div > h1",
        {
          duration: 3,
          fontSize: "3rem",
          marginLeft: "50%",
          translateX: "-50%",
          ease: "power3.out",
        },
        "start"
      )
      .from(
        "header > div > p",
        { duration: 2, opacity: 1, ease: "linear" },
        "start"
      )
      .from(
        "header > div > p",
        { duration: 2, height: "auto", ease: "linear" },
        "start+=1"
      )
      .from(
        "header > div > p",
        { duration: 3, margin: "5rem 0 0 0", ease: "linear" },
        "start"
      );
  });

  mm.add("(max-width: 40rem)", () => {
    tlScroll!
      .from(
        "header > div > h1",
        {
          duration: 3,
          fontSize: "2.5rem",
          marginLeft: "50%",
          ease: "linear",
        },
        "start"
      )
      .from(
        "header > div > p",
        { duration: 3, marginTop: "5rem", ease: "linear" },
        "start"
      )
      .from(
        "header > div > p",
        { duration: 2, opacity: 1, ease: "linear" },
        "start"
      )
      .from(
        "header > div > p",
        { duration: 2, height: "auto", ease: "linear" },
        "start"
      );
  });

  // ✅ store the function reference so we can remove it later
  scrollHandler = () => {
    if (requestId == null) requestId = requestAnimationFrame(update);
    update();
  };

  window.addEventListener("scroll", scrollHandler);

  update();
};

export const cleanup = () => {
  // ✅ remove scroll listener
  if (scrollHandler) {
    window.removeEventListener("scroll", scrollHandler);
    scrollHandler = null;
  }

  // cancel rAF
  if (requestId != null) {
    cancelAnimationFrame(requestId);
    requestId = null;
  }

  // ✅ revert matchMedia (kills media handlers and related animations)
  if (mm) {
    mm.revert();
    mm = null;
  }

  // ✅ revert scroll timeline styles, then kill
  if (tlScroll) {
    tlScroll.seek(0).kill(); // returns to start state before killing :contentReference[oaicite:2]{index=2}
    tlScroll = null;
  }

  if (tlFadeIn) {
    tlFadeIn.kill();
    tlFadeIn = null;
  }

  // ✅ belt-and-suspenders: remove inline styles GSAP may have left
  // gsap.set(["header > div > h1", "header > div > p"], { clearProps: "all" }); // :contentReference[oaicite:3]{index=3}
};
