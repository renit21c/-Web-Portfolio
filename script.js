      (function () {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        /* ---------- star cursor and click sparks ---------- */
        const starCursor = document.querySelector(".star-cursor");
        const cursorSparks = document.querySelector(".cursor-sparks");
        const cursorGlow = document.querySelector(".cursor-glow");
        const finePointer = window.matchMedia(
          "(hover: hover) and (pointer: fine)",
        ).matches;
        if (
          starCursor &&
          cursorSparks &&
          cursorGlow &&
          finePointer &&
          !reduceMotion
        ) {
          let cursorFrame;
          let cursorX = -100;
          let cursorY = -100;
          const setCursorPosition = () => {
            starCursor.style.setProperty("--cursor-x", `${cursorX}px`);
            starCursor.style.setProperty("--cursor-y", `${cursorY}px`);
            starCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
          };
          const createTrailStar = (event) => {
            const trailStar = document.createElement("span");
            const colors = ["#dbe1ff", "#b9c7ff", "#7887e8", "#ffffff"];
            trailStar.className = "cursor-trail-star";
            trailStar.textContent = "✦";
            trailStar.style.left = `${event.clientX}px`;
            trailStar.style.top = `${event.clientY}px`;
            trailStar.style.setProperty(
              "--trail-size",
              `${7 + Math.random() * 9}px`,
            );
            trailStar.style.setProperty(
              "--trail-color",
              colors[Math.floor(Math.random() * colors.length)],
            );
            cursorSparks.append(trailStar);
            trailStar.addEventListener("animationend", () => trailStar.remove(), {
              once: true,
            });
          };
          const moveCursor = (event) => {
            cursorX = event.clientX - 11;
            cursorY = event.clientY - 11;
            cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(-50%, -50%, 0)`;
            cursorGlow.classList.add("is-visible");
            createTrailStar(event);
            if (!cursorFrame) {
              cursorFrame = window.requestAnimationFrame(() => {
                setCursorPosition();
                cursorFrame = undefined;
              });
            }
          };
          const createSparks = (event) => {
            starCursor.classList.add("is-clicking");
            window.setTimeout(() => {
              starCursor.classList.remove("is-clicking");
              setCursorPosition();
            }, 180);
            const sparkCount = 8;
            for (let index = 0; index < sparkCount; index += 1) {
              const spark = document.createElement("span");
              const angle = (Math.PI * 2 * index) / sparkCount;
              const distance = 16 + Math.random() * 16;
              spark.className = "cursor-spark";
              spark.style.left = `${event.clientX - 2.5}px`;
              spark.style.top = `${event.clientY - 2.5}px`;
              spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
              spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
              cursorSparks.append(spark);
              spark.addEventListener("animationend", () => spark.remove(), {
                once: true,
              });
            }
          };
          document.addEventListener("pointermove", moveCursor, { passive: true });
          document.addEventListener("pointerleave", () => {
            cursorGlow.classList.remove("is-visible");
          });
          document.addEventListener("pointerdown", createSparks);
          document.addEventListener("pointerover", (event) => {
            const target = event.target.closest("a, button, [role='button'], summary");
            const relatedTarget =
              event.relatedTarget instanceof Element ? event.relatedTarget : null;
            if (target && !target.contains(relatedTarget)) {
              starCursor.classList.add("is-hovering");
            }
          });
          document.addEventListener("pointerout", (event) => {
            const target = event.target.closest("a, button, [role='button'], summary");
            const relatedTarget =
              event.relatedTarget instanceof Element ? event.relatedTarget : null;
            if (target && !target.contains(relatedTarget)) {
              starCursor.classList.remove("is-hovering");
            }
          });
        }

        /* ---------- starfield ---------- */
        const canvas = document.getElementById("stars");
        const ctx = canvas.getContext("2d");
        let stars = [];
        function resize() {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
        function makeStars() {
          const count = Math.floor((canvas.width * canvas.height) / 9000);
          stars = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.2,
            a: Math.random() * 0.6 + 0.2,
            speed: Math.random() * 0.015 + 0.003,
          }));
        }
        function drawStars() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          for (const s of stars) {
            ctx.globalAlpha = s.a;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            if (!reduceMotion) {
              s.a += (Math.random() - 0.5) * 0.02;
              s.a = Math.max(0.15, Math.min(0.85, s.a));
            }
          }
          ctx.globalAlpha = 1;
          if (!reduceMotion) requestAnimationFrame(drawStars);
        }
        resize();
        makeStars();
        drawStars();
        window.addEventListener("resize", () => {
          resize();
          makeStars();
        });

        /* ---------- continuously playing hero video ---------- */
        const heroVideo = document.querySelector(".hero-video");
        if (heroVideo) {
          heroVideo.addEventListener(
            "loadeddata",
            () => {
              if (heroVideo.currentTime === 0) {
                heroVideo.currentTime = 0.01;
              }
            },
            { once: true },
          );
          heroVideo.play().catch((error) => {
            if (error.name !== "AbortError") {
              console.error("Unable to autoplay the hero video.", error);
            }
          });
        }

        /* ---------- seamless collaboration marquee ---------- */
        const collabTrack = document.querySelector(".collab-track");
        const collabGroup = document.querySelector(".collab-group");
        const setCollabDistance = () => {
          if (collabTrack && collabGroup) {
            collabTrack.style.setProperty(
              "--collab-distance",
              `-${collabGroup.getBoundingClientRect().width}px`,
            );
          }
        };
        setCollabDistance();
        window.addEventListener("resize", setCollabDistance);
        if (collabTrack && collabGroup) {
          let marqueeOffset = 0;
          let previousTime = 0;
          const animateCollab = (time) => {
            if (!previousTime) previousTime = time;
            const elapsed = time - previousTime;
            const groupWidth = collabGroup.getBoundingClientRect().width;
            marqueeOffset = (marqueeOffset + elapsed * 0.025) % groupWidth;
            collabTrack.style.transform = `translate3d(-${marqueeOffset}px, 0, 0)`;
            previousTime = time;
            window.requestAnimationFrame(animateCollab);
          };
          window.requestAnimationFrame(animateCollab);
        }
        /* ---------- scroll reveal ---------- */
        const revealEls = document.querySelectorAll(".reveal");
        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("in");
                  io.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.12 },
          );
          revealEls.forEach((el) => io.observe(el));
        } else {
          revealEls.forEach((el) => el.classList.add("in"));
        }

        /* ---------- animated skill bars ---------- */
        const barFills = document.querySelectorAll(".bar-fill");
        barFills.forEach((el) =>
          el.style.setProperty("--target-pct", el.dataset.pct + "%"),
        );
        if ("IntersectionObserver" in window) {
          const barIO = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("filled");
                  barIO.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.2 },
          );
          barFills.forEach((el) => barIO.observe(el));
        } else {
          barFills.forEach((el) => el.classList.add("filled"));
        }

        /* ---------- expandable stack details ---------- */
        document.querySelectorAll(".stack-col .bar-row").forEach((row) => {
          row.tabIndex = 0;
          row.setAttribute("role", "button");
          row.setAttribute("aria-expanded", "false");
          const toggleDetails = () => {
            const expanded = row.classList.toggle("is-expanded");
            row.setAttribute("aria-expanded", String(expanded));
          };
          row.addEventListener("click", toggleDetails);
          row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleDetails();
            }
          });
        });

        /* ---------- compact details and count-up metrics ---------- */
        function addDetails(selector, label) {
          document.querySelectorAll(selector).forEach((content) => {
            const details = document.createElement("details");
            details.className = "more";
            const summary = document.createElement("summary");
            summary.textContent = label;
            content.replaceWith(details);
            details.append(summary, content);
          });
        }

        addDetails(".tl-desc", "Read role details");
        addDetails(".ach-card > p", "Read more");

        /* ---------- interactive experience solar system ---------- */
        const experiencePlanets = document.querySelectorAll(
          ".solar-system .tl-item",
        );
        const experiencePanel = document.querySelector(
          ".experience-detail-panel",
        );
        const selectExperience = (planet) => {
          experiencePlanets.forEach((item) => {
            const selected = item === planet;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-expanded", String(selected));
          });
          const logo = planet.querySelector(".tl-logo");
          const role = planet.querySelector(".tl-role");
          const org = planet.querySelector(".tl-org");
          const date = planet.querySelector(".tl-date");
          const description = planet.querySelector("details.more p");
          experiencePanel.innerHTML = `
            <img class="detail-panel-logo" src="${logo.src}" alt="${logo.alt}" />
            <h3 class="detail-panel-title">${role.textContent}</h3>
            <p class="detail-panel-meta">${org.textContent} · ${date.textContent}</p>
            <p class="detail-panel-copy">${description.textContent}</p>
          `;
          experiencePanel.classList.add("has-selection");
        };
        experiencePlanets.forEach((planet) => {
          planet.tabIndex = 0;
          planet.setAttribute("role", "button");
          planet.setAttribute("aria-expanded", "false");
          planet.addEventListener("click", () => selectExperience(planet));
          planet.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectExperience(planet);
            }
          });
        });

        /* ---------- music player ---------- */
        const musicPlayer = document.getElementById("music-player");
        const musicToggle = document.querySelector(".music-toggle");
        const musicIcon = musicToggle.querySelector(
          ".material-symbols-outlined",
        );
        const setMusicState = (isPlaying) => {
          musicToggle.setAttribute("aria-pressed", String(isPlaying));
          musicToggle.setAttribute(
            "aria-label",
            isPlaying ? "Pause Forever Young" : "Play Forever Young",
          );
          musicToggle.setAttribute(
            "title",
            isPlaying ? "Pause Forever Young" : "Play Forever Young",
          );
          musicIcon.textContent = isPlaying ? "pause" : "play_arrow";
        };
        musicToggle.addEventListener("click", () => {
          if (musicPlayer.paused) {
            musicPlayer.play().catch((error) => {
              setMusicState(false);
              console.error("Unable to play Forever Young.", error);
            });
          } else {
            musicPlayer.pause();
            setMusicState(false);
          }
        });
        musicPlayer.addEventListener("play", () => setMusicState(true));
        musicPlayer.addEventListener("pause", () => setMusicState(false));
        musicPlayer.addEventListener("ended", () => setMusicState(false));

        const metricEls = document.querySelectorAll(".stat b, .card-metrics b");
        const animateMetric = (el) => {
          if (el.dataset.animated) return;
          const match = el.textContent.trim().match(/^([\d.]+)(.*)$/);
          if (!match) return;
          const target = Number(match[1]);
          if (!Number.isFinite(target)) return;
          el.dataset.animated = "true";
          el.classList.add("count-up");
          const suffix = match[2];
          const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
          const start = performance.now();
          const duration = 1100;
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };

        if ("IntersectionObserver" in window) {
          const metricIO = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  animateMetric(entry.target);
                  metricIO.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.4 },
          );
          metricEls.forEach((el) => metricIO.observe(el));
        } else {
          metricEls.forEach(animateMetric);
        }

        /* ---------- mobile nav ---------- */
        // (kept simple: nav collapses via CSS on narrow screens; links remain reachable via anchor)

        /* ---------- project detail modal ---------- */
        const lightbox = document.getElementById("lightbox");
        const lbContent = lightbox.querySelector(".lb-content");
        const lbClose = lightbox.querySelector(".lb-close");
        const projectGalleries = {
          "SIPK Praja": ["assets/hero/hero-code.jpg", "assets/hero/hero-sketch.jpg"],
          HAMIM: ["assets/projects/maqdis-connect.jpg", "assets/projects/obatin.jpg"],
          "Maqdis Connect": ["assets/projects/hamim.jpg", "assets/projects/obatin.jpg"],
          Obatin: ["assets/projects/hamim.jpg", "assets/projects/maqdis-connect.jpg"],
          SawalaEdu: ["assets/hero/hero-code.jpg", "assets/hero/hero-sketch.jpg"],
          "Classification Model": [
            "assets/projects/cm/cm2.png",
            "assets/projects/cm/cm3.png",
          ],
          "K-Means Clustering": [
            "assets/projects/kmeans/k2.png",
            "assets/projects/kmeans/k3.png",
          ],
          "Cikanyere Ville": [
            "assets/projects/cikanyereville/c2.png",
            "assets/projects/cikanyereville/c3.png",
          ],
          "AIESEC Future Leaders": ["assets/projects/afl/afl2.jpeg"],
          "Green Leaders": [
            "assets/projects/gl/gl2.jpeg",
            "assets/projects/gl/gl3.jpg",
          ],
          iGreen: [
            "assets/projects/igreen/igreen2.jpeg",
            "assets/projects/igreen/igreen3.jpeg",
          ],
          "Digital Illustration": [
            "assets/projects/art/art2.png",
            "assets/projects/art/art3.jpg",
          ],
        };
        const openProject = (card) => {
          lbContent.innerHTML = "";
          const modal = document.createElement("div");
          modal.className = "project-modal";

          const title = card.querySelector(".card-title")?.textContent.trim() || "";
          const mainMedia = card.querySelector(".card-media").cloneNode(true);
          mainMedia.className = "project-modal-media";
          mainMedia.querySelectorAll("img").forEach((image) => image.removeAttribute("loading"));
          const gallery = [
            mainMedia.querySelector("img")?.src,
            ...(projectGalleries[title] || []),
          ].filter(Boolean);
          const mediaWrap = document.createElement("div");
          mediaWrap.className = "project-modal-gallery";
          let mainImage;
          if (gallery.length === 0) {
            mediaWrap.appendChild(mainMedia);
          } else {
            mainImage = document.createElement("img");
            mainImage.className = "project-modal-main-image";
            mainImage.src = gallery[0];
            mainImage.alt = `${title} project preview`;
            mediaWrap.appendChild(mainImage);
          }
          if (gallery.length > 1) {
            const thumbs = document.createElement("div");
            thumbs.className = "project-modal-thumbs";
            gallery.forEach((src, index) => {
              const thumb = document.createElement("button");
              thumb.type = "button";
              thumb.className = "project-modal-thumb";
              if (index === 0) thumb.classList.add("active");
              const image = document.createElement("img");
              image.src = src;
              image.alt = `${title} preview ${index + 1}`;
              thumb.appendChild(image);
              thumb.addEventListener("click", () => {
                if (mainImage) mainImage.src = src;
                thumbs.querySelectorAll(".project-modal-thumb").forEach((item) => item.classList.remove("active"));
                thumb.classList.add("active");
              });
              thumbs.appendChild(thumb);
            });
            mediaWrap.appendChild(thumbs);
          }

          const copy = document.createElement("div");
          copy.className = "project-modal-copy";
          [
            ".card-top",
            ".card-role",
            ".card-desc",
            ".card-stack",
            ".card-metrics",
            ".card-link",
          ].forEach((selector) => {
            const element = card.querySelector(selector);
            if (element) copy.appendChild(element.cloneNode(true));
          });

          modal.append(mediaWrap, copy);
          lbContent.appendChild(modal);
          lightbox.classList.add("open");
        };

        document.querySelectorAll("#project-grid .card").forEach((card) => {
          card.tabIndex = 0;
          card.setAttribute("role", "button");
          card.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            openProject(card);
          });
          card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openProject(card);
            }
          });
        });
        function closeLightbox() {
          lightbox.classList.remove("open");
          lbContent.innerHTML = "";
        }
        lbClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
          if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") closeLightbox();
        });

        /* ---------- project filter ---------- */
        const filterBtns = document.querySelectorAll(".filter-btn");
        const cards = document.querySelectorAll("#project-grid .card");
        const projectGrid = document.getElementById("project-grid");
        const updateProjectLayout = () => {
          const visibleCards = [...cards].filter((card) => card.style.display !== "none");
          projectGrid.classList.toggle("single-result", visibleCards.length === 1);
        };
        filterBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const f = btn.dataset.filter;
            cards.forEach((c) => {
              c.style.display =
                f === "all" || c.dataset.cat === f ? "" : "none";
            });
            updateProjectLayout();
          });
        });
        updateProjectLayout();

        /* ---------- ask ren ---------- */
        const KB = [
          {
            k: ["who is ren", "about ren", "introduce", "tell me about ren"],
            a: "Ren (Suma Renata Wijaya) is a final-year Informatics Engineering student and Data Specialist Intern at IPDN, based in Bandung. He's aspiring toward product/project management, but works across full-stack web, mobile, and data, planning roadmaps, building the product, and reading the numbers behind it.",
          },
          {
            k: ["technolog", "stack", "tools", "tech"],
            a: "On the build side: JavaScript/TypeScript, Java, Python, Dart, and Kotlin, with Laravel, Angular, FastAPI, React/Vite/Tailwind, and Flutter as frameworks. For data: MySQL, PostgreSQL with pgvector, and MongoDB, plus classification and clustering work in Python. For product/PM: Jira, ClickUp, and Google Workspace. For design: Figma, illustration, and video/photo editing.",
          },
          {
            k: ["project", "built", "work on", "portfolio"],
            a: "A mix of things: SIPK Praja (an AI-assisted case-management system at IPDN), HAMIM and Maqdis Connect (apps for Yayasan Maqdis), Obatin (a Flutter medication app for elderly users), SawalaEdu (a boarding-school monitoring platform), plus product/impact initiatives like AIESEC Future Leaders, Green Leaders, and iGreen.",
          },
          {
            k: [
              "dev or product",
              "development or product",
              "focused on",
              "more focused",
            ],
            a: "Genuinely both. Ren's roles have been project- and product-management-titled (Project Manager Intern, Local Head of Product Dev), but the SIPK Praja work and the GitHub repos show he's just as comfortable writing the code himself, which is deliberate: understanding the build makes him a better PM, and vice versa.",
          },
          {
            k: [
              "data",
              "experience with data",
              "analytics",
              "ml",
              "machine learning",
            ],
            a: "Ren's data experience spans a classification model and a K-Means clustering project from coursework, plus hands-on database work with MySQL, MongoDB, and PostgreSQL with pgvector on SIPK Praja, where structured data is used to power an AI-assisted investigation system.",
          },
          {
            k: ["good project manager", "good pm", "why a good", "makes ren"],
            a: "Ren pairs planning discipline, tracking work in Jira/ClickUp and managing 5+ external stakeholders on iGreen, with real delivery experience leading a 15-person team on Green Leaders and growing AIESEC Future Leaders to 190+ participants and 15M+ IDR in revenue. He also builds the products himself, so he can scope and de-risk technical work realistically.",
          },
          {
            k: ["leadership", "lead", "team"],
            a: "Ren's leadership experience combines AIESEC and project management work. At AIESEC in Bandung, Ren served as Local Head of Product Development, leading the Future Leaders programme to 190+ participants and 15M+ IDR in revenue, and led a 15-person cross-functional team on Green Leaders, a 6-week SDG 13 climate-action initiative. Ren also built leadership through PM roles at Yayasan Maqdis and Mizan Publishing, coordinating stakeholders, delivery plans, and cross-functional teams to move product initiatives forward.",
          },
          {
            k: ["contact", "reach", "hire", "email"],
            a: "Best ways to reach Ren: sumastudy101@gmail.com, LinkedIn at linkedin.com/in/sumarenata, or GitHub at github.com/renit21c. Links are all in the Contact section below.",
          },
          {
            k: ["ipdn", "sipk"],
            a: "At IPDN, Ren is a Data Specialist Intern working on SIPK Praja, a case-management and AI-assisted disciplinary investigation system for students (Praja). It runs on React/Vite/Tailwind, Laravel/Sanctum, FastAPI, and PostgreSQL with pgvector, and a current focus is mapping national regulation into a structured rule catalog.",
          },
          {
            k: ["student", "education", "university", "study"],
            a: "Ren is a final-year Informatics Engineering student, currently balancing coursework with an internship at IPDN and a track record of product/PM roles across student organisations and partner initiatives.",
          },
        ];
        const FALLBACK =
          "That's a bit outside what's on this page. Try asking about Ren's experience, projects, tech stack, or leadership background, or reach him directly through the Contact section.";

        function findAnswer(q) {
          const s = q.toLowerCase();
          for (const entry of KB) {
            if (entry.k.some((k) => s.includes(k))) return entry.a;
          }
          return FALLBACK;
        }

        const log = document.getElementById("ask-log");

        function addQuestion(q) {
          const div = document.createElement("div");
          div.className = "msg-q";
          div.textContent = q;
          log.appendChild(div);
          log.scrollTop = log.scrollHeight;
        }

        function typeAnswer(text) {
          const div = document.createElement("div");
          div.className = "msg-a";
          log.appendChild(div);
          if (reduceMotion) {
            div.textContent = text;
            log.scrollTop = log.scrollHeight;
            return;
          }
          const caret = document.createElement("span");
          caret.className = "caret";
          let i = 0;
          const speed = 14;
          function step() {
            div.textContent = text.slice(0, i);
            div.appendChild(caret);
            log.scrollTop = log.scrollHeight;
            i++;
            if (i <= text.length) {
              setTimeout(step, speed);
            } else {
              caret.remove();
            }
          }
          step();
        }

        function ask(q) {
          if (!q.trim()) return;
          addQuestion(q.trim());
          setTimeout(() => typeAnswer(findAnswer(q)), 260);
        }

        document.querySelectorAll(".suggest-btn").forEach((btn) => {
          btn.addEventListener("click", () => ask(btn.dataset.q));
        });

        /* ---------- rotating hero greeting ---------- */
        const heroGreeting = document.querySelector(".hero-greeting");
        const greetings = [
          "Hi, I'm Ren.",
          "Halo, saya Ren.",
          "你好，我是 Ren。",
          "こんにちは、Renです。",
          "Hola, soy Ren.",
        ];
        let greetingIndex = 0;
        if (heroGreeting) {
          if (reduceMotion) {
            heroGreeting.textContent = greetings[0];
          } else {
            let characterIndex = 0;
            let deleting = false;
            const typeGreeting = () => {
              const greeting = greetings[greetingIndex];
              characterIndex += deleting ? -1 : 1;
              heroGreeting.textContent = greeting.slice(0, characterIndex);

              let delay = deleting ? 48 : 92;
              if (!deleting && characterIndex === greeting.length) {
                delay = 1500;
                deleting = true;
              } else if (deleting && characterIndex === 0) {
                deleting = false;
                greetingIndex = (greetingIndex + 1) % greetings.length;
                delay = 350;
              }
              window.setTimeout(typeGreeting, delay);
            };
            heroGreeting.textContent = "";
            typeGreeting();
          }
        }

        /* ---------- language preference ---------- */
        const languageModal = document.getElementById("language-modal");
        const languageButtons = document.querySelectorAll("[data-language]");
        const translations = {
          id: {
            nav: ["Tentang", "Pengalaman", "Proyek", "Keahlian", "Tanya Ren"],
            cta: "Hubungi saya",
            heroEyebrow: "Intern Data Specialist di IPDN · Bandung, Indonesia",
            heroTitle: "Saya mengubah <em>ide</em> menjadi produk yang bisa digunakan.",
            heroSub: "Saya menggabungkan produk, kode, dan data untuk membuat solusi yang benar-benar berguna.",
            work: "Lihat karya",
            ask: "Kenali saya lebih dekat",
            aboutKicker: "Tentang",
            aboutTitle: "Memahami produk, sekaligus mampu membangunnya.",
            aboutText: "Saya mahasiswa tingkat akhir Teknik Informatika yang tertarik pada manajemen produk dan proyek, dengan kemampuan teknis untuk ikut membangun. Saya terbiasa menyusun dan memantau roadmap di Jira atau ClickUp, sekaligus mengerjakan proyek web, mobile, dan data/ML. Bagi saya, memahami proses pembuatannya adalah bagian penting dari menjadi manajer yang lebih baik.",
            stats: ["Proyek IT", "Proyek non-IT", "Orang dalam tim"],
            experience: "Pengalaman",
            experienceTitle: "Pengalaman menerapkan semuanya.",
            projects: "Proyek",
            projectsTitle: "Proyek di bidang produk, teknologi, dan komunitas.",
            browse: "Pilih berdasarkan kategorinya.",
            ongoing: "Proyek yang sedang dikerjakan",
            finished: "Proyek yang sudah selesai",
            filters: ["Semua", "Produk dan Dampak", "Web dan Aplikasi", "Data dan Machine Learning", "Seni"],
            stack: "Keahlian teknis",
            stackTitle: "Teknologi yang saya gunakan.",
            stackLede: "Alat untuk merencanakan, membangun, dan mengevaluasi pekerjaan.",
            achievements: "Pencapaian dan kepemimpinan",
            github: "Aktivitas GitHub",
            githubTitle: "Setahun berkarya secara terbuka.",
            githubLead: "Aktivitas kontribusi terbaru dari",
            githubUpdated: "Diperbarui berdasarkan aktivitas GitHub",
            githubProfile: "Lihat profil GitHub",
            achievementsTitle: "Kolaborasi yang baik tetap menjadi bagian penting dari pekerjaan.",
            askKicker: "Tanya tentang Ren",
            askTitle: "Ingin tahu lebih banyak?",
            askLede: "Pilih pertanyaan untuk mengenal pengalaman Ren lebih dekat.",
            contact: "Kontak",
            contactTitle: "Mari kerjakan sesuatu bersama.",
            contactMeta: "Berbasis di Bandung, Indonesia. Terbuka untuk peluang di bidang produk, manajemen proyek, dan pengembangan full-stack.",
            footer: "Dibuat dengan Plus Jakarta Sans.",
            languageTitle: "Pilih bahasa",
            languagePrompt: "Anda ingin menggunakan bahasa Inggris atau bahasa Indonesia?",
            english: "Bahasa Inggris",
            indonesian: "Bahasa Indonesia",
            achievementTitles: [
              "Memimpin Pengembangan Produk Lokal di AIESEC Bandung",
              "Memimpin tim berisi 15 orang di Green Leaders",
              "Menjaga kolaborasi dengan 3 desa dan 3 sekolah",
              "Mengubah regulasi menjadi sistem di IPDN"
            ],
            achievementDetails: [
              "Mengelola fungsi Product Development lokal dan program utama AIESEC Future Leaders selama 2,5 bulan, hingga menjangkau 190+ peserta dan menghasilkan pendapatan lebih dari 15 juta rupiah.",
              "Mengarahkan tim lintas fungsi dalam program aksi iklim SDG 13 selama 6 minggu bersama PwC, Indika Foundation, dan Greenpeace, sekaligus mengamankan pendanaan lebih dari 9 juta rupiah.",
              "Mengelola 5+ mitra eksternal untuk iGreen dan menjaga program keberlanjutan selama 4 minggu hingga meraih skor kepuasan relawan 9,0 serta profit lebih dari 3 juta rupiah.",
              "Memetakan regulasi pemerintah ke dalam rule engine terstruktur untuk SIPK Praja, dengan pendekatan produk pada masalah teknis yang penting dan berisiko tinggi."
            ]
          }
        };
        function applyLanguage(language) {
          document.documentElement.lang = language;
          localStorage.setItem("portfolio-language", language);
          if (language === "en") {
            window.location.reload();
            return;
          }
          const t = translations.id;
          document.querySelector("#language-title").textContent = t.languageTitle;
          document.querySelector(".language-card p").textContent = t.languagePrompt;
          document.querySelector("[data-language='en']").textContent = t.english;
          document.querySelector("[data-language='id']").textContent = t.indonesian;
          const navlinks = document.querySelectorAll(".navlinks a");
          t.nav.forEach((text, index) => { if (navlinks[index]) navlinks[index].textContent = text; });
          document.querySelector(".nav-cta").textContent = t.cta;
          document.querySelector(".hero-eyebrow").lastChild.textContent = ` ${t.heroEyebrow}`;
          document.querySelector(".hero-tagline").innerHTML = t.heroTitle;
          document.querySelector(".hero-sub").textContent = t.heroSub;
          document.querySelector(".btn-primary").lastChild.textContent = ` ${t.work}`;
          document.querySelector(".btn-ghost").lastChild.textContent = ` ${t.ask}`;
          document.querySelector("#about .kicker").textContent = t.aboutKicker;
          document.querySelector("#experience .kicker").textContent = t.experience;
          document.querySelector("#projects .kicker").textContent = t.projects;
          document.querySelector("#stack .kicker").textContent = t.stack;
          document.querySelector("#achievements .kicker").textContent = t.achievements;
          document.querySelector(".github-kicker").textContent = t.github;
          document.querySelector(".github-title").textContent = t.githubTitle;
          const githubLead = document.querySelector(".github-lede");
          if (githubLead) {
            const profileLink = githubLead.querySelector("a");
            githubLead.textContent = `${t.githubLead} `;
            if (profileLink) {
              githubLead.appendChild(profileLink);
              githubLead.append(".");
            }
          }
          document.querySelector(".github-updated").textContent = t.githubUpdated;
          document.querySelector(".github-profile-link").textContent = t.githubProfile;
          document.querySelector("#achievements h2").textContent = t.achievementsTitle;
          document.querySelector("#ask .kicker").textContent = t.askKicker;
          document.querySelector("#contact .kicker").textContent = t.contact;
          document.querySelector("#about h2").textContent = t.aboutTitle;
          document.querySelector(".about-copy p").textContent = t.aboutText;
          document.querySelectorAll(".stat span").forEach((el, index) => { el.textContent = t.stats[index]; });
          document.querySelector("#experience h2").textContent = t.experienceTitle;
          document.querySelector("#experience .lede").textContent = "Beberapa peran dan tanggung jawab yang pernah saya jalankan.";
          document.querySelector("#projects h2").textContent = t.projectsTitle;
          document.querySelector("#projects .lede").textContent = t.browse;
          const filterIcons = ["auto_awesome", "rocket_launch", "code", "monitoring", "draw"];
          document.querySelectorAll("#projects .filter-btn").forEach((button, index) => {
            button.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${filterIcons[index]}</span> ${t.filters[index]}`;
          });
          document.querySelector("#projects .project-group-title").textContent = t.ongoing;
          document.querySelectorAll("#projects .project-group-title")[1].textContent = t.finished;
          document.querySelector("#stack h2").textContent = t.stackTitle;
          document.querySelector("#stack .lede").textContent = t.stackLede;
          document.querySelector("#ask h2").textContent = t.askTitle;
          document.querySelector("#ask .lede").textContent = t.askLede;
          document.querySelectorAll(".ach-card h3").forEach((el, index) => {
            el.textContent = t.achievementTitles[index];
          });
          document.querySelectorAll(".ach-card p").forEach((paragraph, index) => {
            paragraph.textContent = t.achievementDetails[index];
          });
          document.querySelector("#contact h2").textContent = t.contactTitle;
          document.querySelector(".contact-meta").textContent = t.contactMeta;
          document.querySelector("footer .wrap span:last-child").textContent = t.footer;
        }
        const savedLanguage = localStorage.getItem("portfolio-language");
        const languageToggle = document.querySelector(".language-toggle");
        const setLanguageWidgetState = (open) => {
          languageModal.classList.toggle("open", open);
          languageToggle.setAttribute("aria-expanded", String(open));
        };
        if (savedLanguage === "id") applyLanguage("id");
        else if (!savedLanguage) setLanguageWidgetState(true);
        languageToggle.addEventListener("click", () => {
          setLanguageWidgetState(!languageModal.classList.contains("open"));
        });
        languageButtons.forEach((button) => {
          button.addEventListener("click", () => {
            setLanguageWidgetState(false);
            applyLanguage(button.dataset.language);
          });
        });
      })();