(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  const syncHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);
  };

  const setupHeader = () => {
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    const closeMenu = () => {
      nav?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    toggle?.addEventListener("click", () => {
      const isOpen = nav?.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });

    nav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        nav?.classList.contains("open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  };

  const setupRevealAnimations = () => {
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

    document.querySelectorAll(".reveal").forEach((element) => {
      if (revealObserver) {
        revealObserver.observe(element);
      } else {
        element.classList.add("visible");
      }
    });
  };

  const getFieldLabel = (form, fieldName) => {
    const field = form.elements.namedItem(fieldName);
    const labelElement = field?.id
      ? form.querySelector(`label[for="${field.id}"]`)
      : null;

    return (labelElement?.textContent || fieldName.replaceAll("_", " "))
      .replace(/\s*\*+\s*$/, "")
      .trim();
  };

  const buildMailtoUrl = (form, data) => {
    const recipient = form.dataset.recipient;
    const label = form.dataset.formLabel || "Contato pelo site";
    const lines = [];

    for (const [name, rawValue] of data.entries()) {
      if (/consent/i.test(name)) continue;

      const value = String(rawValue).trim();
      if (!value) continue;

      const readable = getFieldLabel(form, name);
      lines.push(`${readable}: ${value}`);
    }

    const sender =
      data.get("nome") || data.get("empresa") || data.get("name") || "";
    const subject = `${label}${sender ? " — " + sender : ""}`;
    const footer =
      document.documentElement.lang === "en"
        ? "Sent from the Boreal Plating website."
        : "Enviado pelo site da Boreal Plating.";

    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n") + "\n\n" + footer)}`;
  };

  const setupForms = () => {
    document.querySelectorAll("form[data-recipient]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
          return;
        }

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
        location.href = buildMailtoUrl(form, data);
      });
    });
  };

  setupHeader();
  setupRevealAnimations();
  setupForms();
})();
