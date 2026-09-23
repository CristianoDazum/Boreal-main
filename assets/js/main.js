(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  const syncHeader = () =>
    header?.classList.toggle("scrolled", window.scrollY > 18);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const closeMenu = () => {
    nav?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(Boolean(open)));
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (
      nav?.classList.contains("open") &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    )
      closeMenu();
  });

  const revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12 },
        )
      : null;
  document
    .querySelectorAll(".reveal")
    .forEach((el) =>
      revealObserver ? revealObserver.observe(el) : el.classList.add("visible"),
    );

  document.querySelectorAll("form[data-recipient]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const consent = form.querySelector('input[name="consent"]');
      if (consent && !consent.checked) {
        consent.focus();
        consent.setCustomValidity(
          "É necessário consentir com o tratamento dos dados antes do envio.",
        );
        consent.reportValidity();
        consent.setCustomValidity("");
        return;
      }

      const data = new FormData(form);
      const recipient = form.dataset.recipient;
      const label = form.dataset.formLabel || "Contato pelo site";
      const lines = [];
      for (const [name, raw] of data.entries()) {
        if (/consent/i.test(name)) continue;
        const value = String(raw).trim();
        if (!value) continue;
        const field = form.elements.namedItem(name);
        const labelEl = field?.id
          ? form.querySelector(`label[for="${field.id}"]`)
          : null;
        const readable = (labelEl?.textContent || name.replaceAll("_", " "))
          .replace(/\s*\*+\s*$/, "")
          .trim();
        lines.push(`${readable}: ${value}`);
      }
      const sender =
        data.get("nome") || data.get("empresa") || data.get("name") || "";
      const subject = `${label}${sender ? " — " + sender : ""}`;
      const footer =
        document.documentElement.lang === "en"
          ? "Sent from the Boreal Plating website."
          : "Enviado pelo site da Boreal Plating.";
      location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n") + "\n\n" + footer)}`;
    });
  });
})();
