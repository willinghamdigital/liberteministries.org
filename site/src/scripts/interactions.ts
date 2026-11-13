const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const animated = document.querySelectorAll<HTMLElement>(".elementor-invisible");
if (document.documentElement.classList.contains("motion-ready")) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        const settings = JSON.parse(
          (target as HTMLElement).dataset.settings || "{}",
        );
        target.classList.remove("elementor-invisible");
        target.classList.add(
          "animated",
          settings._animation || settings.animation || "fadeInUp",
        );
        observer.unobserve(target);
      });
    },
    { threshold: 0.01 },
  );
  animated.forEach((element) => observer.observe(element));
} else
  animated.forEach((element) =>
    element.classList.remove("elementor-invisible"),
  );

const menu = document.querySelector<HTMLDialogElement>("#mobile-menu");
const menuTriggers = document.querySelectorAll<HTMLAnchorElement>(
  'a[href="#mobile-menu"]',
);
menu
  ?.querySelectorAll<HTMLAnchorElement>(".menu-item-has-children > a")
  .forEach((link) => {
    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", (event) => {
      const parent = link.parentElement!;
      if (
        !parent.classList.contains("submenu-open") ||
        (event.target as Element).closest(".sub-arrow")
      ) {
        event.preventDefault();
        const open = parent.classList.toggle("submenu-open");
        link.setAttribute("aria-expanded", String(open));
      }
    });
  });
menuTriggers.forEach((trigger) =>
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    menu?.showModal();
    document.body.classList.add("menu-open");
    menuTriggers.forEach((link) => link.setAttribute("aria-expanded", "true"));
  }),
);
menu
  ?.querySelector(".native-menu-close")
  ?.addEventListener("click", () => menu.close());
menu?.addEventListener("click", (event) => {
  const bounds = menu.getBoundingClientRect();
  if (
    event.target === menu &&
    (event.clientX < bounds.left || event.clientX > bounds.right)
  )
    menu.close();
});
menu?.addEventListener("close", () => {
  document.body.classList.remove("menu-open");
  menuTriggers.forEach((link) => link.setAttribute("aria-expanded", "false"));
});

document
  .querySelectorAll<HTMLElement>(".pp-advanced-accordion")
  .forEach((accordion) => {
    accordion.classList.add("native-accordion");
    const titles = accordion.querySelectorAll<HTMLElement>(
      ".pp-accordion-tab-title",
    );
    const toggle = (title: HTMLElement) => {
      const open = title.getAttribute("aria-expanded") !== "true";
      titles.forEach((item) => {
        const active = item === title && open;
        item.setAttribute("aria-expanded", String(active));
        item.classList.toggle("pp-accordion-tab-active", active);
        item.parentElement?.classList.toggle(
          "pp-accordion-item-active",
          active,
        );
        document
          .getElementById(item.getAttribute("aria-controls") || "")
          ?.classList.toggle("is-open", active);
      });
    };
    titles.forEach((title) => {
      title.setAttribute("aria-expanded", "false");
      title.addEventListener("click", () => toggle(title));
      title.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle(title);
        }
      });
    });
  });
document.documentElement.classList.add("ui-ready");

document
  .querySelectorAll<HTMLElement>(".elementskit-testimonial-slider")
  .forEach((carousel) => {
    carousel.classList.add("native-carousel");
    const track = carousel.querySelector<HTMLElement>(".swiper-wrapper");
    const slides = carousel.querySelectorAll<HTMLElement>(".swiper-slide");
    const dots = carousel.querySelector<HTMLElement>(".slick-dots");
    if (!track || !dots) return;
    let index = 0,
      paused = false;
    const count = () =>
      Math.max(
        1,
        slides.length - (innerWidth > 1024 ? 3 : innerWidth >= 768 ? 2 : 1) + 1,
      );
    const show = (next: number) => {
      index = next % count();
      track.scrollTo({
        left: (slides[0]?.offsetWidth || 0) * index,
        behavior: reducedMotion.matches ? "instant" : "smooth",
      });
      dots.querySelectorAll("button").forEach((button, i) => {
        button.setAttribute("aria-current", String(i === index));
        button.parentElement?.classList.toggle("slick-active", i === index);
      });
    };
    const render = () => {
      dots.replaceChildren();
      for (let i = 0; i < count(); i++) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `Show testimonial ${i + 1}`);
        button.setAttribute("aria-current", String(i === 0));
        button.addEventListener("click", () => show(i));
        li.append(button);
        dots.append(li);
      }
      dots.hidden = count() === 1;
      show(0);
    };
    render();
    window.addEventListener("resize", render);
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "carousel-pause";
    pause.textContent = "Pause testimonials";
    pause.addEventListener("click", () => {
      paused = !paused;
      pause.textContent = paused ? "Play testimonials" : "Pause testimonials";
    });
    carousel.append(pause);
    const syncPause = () =>
      (pause.hidden = count() === 1 || reducedMotion.matches);
    syncPause();
    window.addEventListener("resize", syncPause);
    setInterval(() => {
      if (
        !paused &&
        !reducedMotion.matches &&
        !document.hidden &&
        !carousel.matches(":hover, :focus-within") &&
        count() > 1
      )
        show(index + 1);
    }, 5000);
  });
