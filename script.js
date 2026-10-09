      (function () {
        document.documentElement.dataset.theme = "dark";

        const screenOrder = [
          "hero",
          "about",
          "experience",
          "projects",
          "stack",
          "achievements",
          "github",
          "ask",
          "contact",
        ];
        const screenIds = new Set(screenOrder);
        const menuMusic = document.getElementById("main-menu-bgm");
        const portfolioMusic = document.getElementById("portfolio-bgm");
        const menuFogVideo = document.querySelector(".hero-fog-video");
        const navigationToggle = document.querySelector(".navtoggle");
        const soundTargetSelector =
          "a[href], button, [role='button'], input[type='button'], input[type='submit'], input[type='reset'], summary";
        let interfaceAudioContext;
        const playInterfaceSound = (soundType) => {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) {
            console.warn("Web Audio is unavailable; interface sounds are disabled.");
            return;
          }
          interfaceAudioContext ??= new AudioContextClass();
          const context = interfaceAudioContext;
          const playTone = () => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const isClick = soundType === "click";
            const now = context.currentTime;
            const duration = isClick ? 0.08 : 0.045;
            oscillator.type = isClick ? "triangle" : "sine";
            oscillator.frequency.setValueAtTime(isClick ? 260 : 620, now);
            if (isClick) oscillator.frequency.exponentialRampToValueAtTime(170, now + duration);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(isClick ? 0.006 : 0.0025, now + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(now);
            oscillator.stop(now + duration);
          };
          if (context.state === "running") {
            playTone();
          } else {
            context.resume().then(playTone).catch((error) => {
              console.warn("Unable to play an interface sound.", error);
            });
          }
        };
        document.addEventListener("pointerover", (event) => {
          if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
          const control = event.target.closest(soundTargetSelector);
          if (
            control &&
            !(event.relatedTarget instanceof Node && control.contains(event.relatedTarget))
          ) {
            playInterfaceSound("hover");
          }
        });
        document.addEventListener("click", (event) => {
          if (!(event.target instanceof Element)) return;
          if (event.target.closest(soundTargetSelector)) playInterfaceSound("click");
        });
        const setNavigationOpen = (open) => {
          document.querySelector("header")?.classList.toggle("nav-open", open);
          navigationToggle?.setAttribute("aria-expanded", String(open));
          navigationToggle?.setAttribute(
            "aria-label",
            open ? "Close section navigation" : "Open section navigation",
          );
          const icon = navigationToggle?.querySelector(
            ".material-symbols-outlined",
          );
          if (icon) icon.textContent = open ? "close" : "menu";
        };
        navigationToggle?.addEventListener("click", () => {
          setNavigationOpen(
            navigationToggle.getAttribute("aria-expanded") !== "true",
          );
        });
        const startMenuFog = () => {
          if (document.body.dataset.screen !== "hero" || !menuFogVideo.paused) return;
          const playback = menuFogVideo.play();
          if (playback) {
            playback.catch((error) => {
              if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
                console.warn("Unable to play the main menu fog video.", error);
              }
            });
          }
        };
        menuFogVideo.addEventListener("canplay", startMenuFog);
        document.addEventListener("click", startMenuFog);
        let activeMusic = null;
        const startActiveMusic = () => {
          if (!activeMusic || !activeMusic.paused) return;
          const track = activeMusic;
          const playback = track.play();
          if (playback) {
            playback.catch((error) => {
              if (
                activeMusic === track &&
                error.name !== "NotAllowedError" &&
                error.name !== "AbortError"
              ) {
                console.warn("Unable to play the portfolio background music.", error);
              }
            });
          }
        };
        const syncMusicWithScreen = (screenId) => {
          const nextMusic = screenId === "hero" ? menuMusic : portfolioMusic;
          if (activeMusic !== nextMusic) {
            [menuMusic, portfolioMusic].forEach((track) => track.pause());
            nextMusic.currentTime = 0;
            activeMusic = nextMusic;
          }
          startActiveMusic();
        };
        document.addEventListener("click", startActiveMusic);
        const readScreenFromHash = () => {
          const requestedScreen = window.location.hash.slice(1);
          return screenIds.has(requestedScreen) ? requestedScreen : "hero";
        };
        const showScreen = (screenId, moveFocus = false) => {
          const enteringNewScreen = document.body.dataset.screen !== screenId;
          setNavigationOpen(false);
          document.body.dataset.screen = screenId;
          syncMusicWithScreen(screenId);
          if (screenId === "hero") {
            startMenuFog();
          } else {
            menuFogVideo.pause();
          }
          document.querySelectorAll("main > section").forEach((section) => {
            section.hidden = section.id !== screenId;
          });
          if (enteringNewScreen) {
            const activeSection = document.getElementById(screenId);
            activeSection.classList.remove("screen-enter");
            void activeSection.offsetWidth;
            activeSection.classList.add("screen-enter");
          }
          document.querySelectorAll(".navlinks a").forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${screenId}`,
            );
          });
          window.scrollTo(0, 0);
          if (moveFocus) {
            const focusTarget =
              screenId === "hero"
                ? document.querySelector(".hero-menu-list a")
                : document.querySelector(`#${screenId} .kicker`);
            if (focusTarget) {
              if (screenId !== "hero") focusTarget.tabIndex = -1;
              focusTarget.focus({ preventScroll: true });
            }
          }
        };
        const navigateToScreen = (screenId, moveFocus = false) => {
          if (screenId === document.body.dataset.screen) return;
          window.history.pushState(null, "", `#${screenId}`);
          showScreen(screenId, moveFocus);
        };
        if (!screenIds.has(window.location.hash.slice(1))) {
          window.history.replaceState(null, "", "#hero");
        }
        showScreen(readScreenFromHash());
        document.querySelectorAll(".hero-menu-list a, .screen-back, .brand, .navlinks a, .nav-cta").forEach((link) => {
          link.addEventListener("click", (event) => {
            const targetScreen = link.getAttribute("href")?.slice(1);
            if (!targetScreen || !screenIds.has(targetScreen)) return;
            event.preventDefault();
            navigateToScreen(targetScreen, true);
          });
        });
        window.addEventListener("popstate", () => {
          showScreen(readScreenFromHash(), true);
        });

        const streakCount = document.getElementById("duolingo-streak-count");
        if (streakCount) {
          const streakStorageKey = "duolingo-streak-state";
          const today = new Date();
          const todayKey = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
          ].join("-");
          const storedState = window.localStorage.getItem(streakStorageKey);
          let streak = 267;
          if (storedState) {
            try {
              const parsedState = JSON.parse(storedState);
              if (
                Number.isInteger(parsedState.streak) &&
                parsedState.streak >= 267 &&
                typeof parsedState.lastUpdated === "string"
              ) {
                streak = parsedState.streak;
                if (parsedState.lastUpdated !== todayKey) {
                  streak += 1;
                }
              }
            } catch (error) {
              console.warn("Unable to read the saved Duolingo streak.", error);
            }
          }
          streakCount.textContent = String(streak);
          window.localStorage.setItem(
            streakStorageKey,
            JSON.stringify({ streak, lastUpdated: todayKey }),
          );
        }

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

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
          ctx.fillStyle = "#d4d4d0";
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

        /* ---------- interactive skill constellations ---------- */
        const constellationPositions = [
          [18, 22],
          [50, 14],
          [82, 22],
          [25, 50],
          [75, 50],
          [18, 80],
          [50, 87],
          [82, 80],
          [50, 40],
          [50, 68],
        ];
        const skillDescriptions = {
          JavaScript: "Adds interactive behavior and dynamic features to web interfaces.",
          TypeScript: "Adds static typing to JavaScript to make larger applications easier to maintain.",
          Java: "A general-purpose, object-oriented language used for application development.",
          Python: "Used for scripting, data workflows, and backend development.",
          Dart: "The programming language used to build Flutter applications.",
          Kotlin: "A modern JVM language used for Android and application development.",
          Laravel: "A PHP framework for building structured web applications and APIs.",
          Angular: "A TypeScript framework for building component-based web applications.",
          FastAPI: "A Python framework for building typed, high-performance APIs.",
          React: "A component-based library for building interactive user interfaces.",
          Vite: "A fast development server and build tool for modern frontend projects.",
          "Tailwind CSS": "A utility-first CSS framework for building custom interfaces.",
          Flutter: "A cross-platform UI toolkit for building mobile and web applications.",
          MySQL: "A relational database used to store and query structured application data.",
          PostgreSQL: "An open-source relational database with advanced querying features.",
          pgvector: "A PostgreSQL extension for storing and searching vector embeddings.",
          MongoDB: "A document database for storing flexible, JSON-like records.",
          "Classification and clustering": "Machine-learning approaches for grouping data and predicting categories.",
          Jira: "A project-tracking tool for managing tasks, issues, and delivery workflows.",
          ClickUp: "A workspace for organizing projects, tasks, and team collaboration.",
          "Google Workspace": "A suite of tools for documents, spreadsheets, communication, and collaboration.",
          Illustration: "Creates visual artwork and illustrations for digital projects.",
          Figma: "A collaborative design tool for interface design and prototyping.",
          "Video and photo editing": "Edits visual media for presentations and digital content.",
          Indonesian: "Native fluency for everyday and professional communication.",
          English: "Proficient fluency for written and spoken communication.",
        };
        const stackCategories = [
          ...document.querySelectorAll("#stack .stack-col"),
        ];
        const stackGrid = document.querySelector("#stack .stack-grid");
        const stackNavigation = document.createElement("nav");
        const stackPrevious = document.createElement("button");
        const stackPosition = document.createElement("span");
        const stackNext = document.createElement("button");
        let activeStackCategory = 0;
        const showStackCategory = (index) => {
          activeStackCategory = Math.max(
            0,
            Math.min(index, stackCategories.length - 1),
          );
          stackCategories.forEach((category, categoryIndex) => {
            const isActive = categoryIndex === activeStackCategory;
            category.hidden = !isActive;
            category.inert = !isActive;
            category.setAttribute("aria-hidden", String(!isActive));
          });
          const activeCategory = stackCategories[activeStackCategory];
          const categoryName =
            activeCategory.querySelector("h3")?.textContent.trim() || "";
          const accent = getComputedStyle(activeCategory)
            .getPropertyValue("--stack-accent")
            .trim();
          stackGrid.style.setProperty("--active-stack-accent", accent);
          const constellation = activeCategory.querySelector(
            ".stack-constellation",
          );
          if (constellation) {
            const lines = constellation.querySelector(
              ".stack-constellation-lines",
            );
            const path = lines?.querySelector("path");
            if (path) {
                path.style.transition = "none";
                path.style.strokeDashoffset = "1";
              void path.getBoundingClientRect();
              requestAnimationFrame(() => {
                if (!activeCategory.hidden) {
                  path.style.transition = "";
                  path.style.strokeDashoffset = "0";
                }
              });
            }
          }
          stackPosition.textContent = categoryName;
        };
        const moveStackCategory = (direction) => {
          const nextIndex =
            (activeStackCategory + direction + stackCategories.length) %
            stackCategories.length;
          showStackCategory(nextIndex);
          stackGrid.focus({ preventScroll: true });
        };

        stackNavigation.className = "stack-navigation";
        stackNavigation.setAttribute("aria-label", "Skill categories");
        stackPrevious.type = "button";
        stackPrevious.className = "stack-navigation-button";
        stackPrevious.textContent = "←";
        stackPrevious.setAttribute("aria-label", "Previous skill category");
        stackPosition.className = "stack-navigation-position";
        stackPosition.setAttribute("aria-live", "polite");
        stackNext.type = "button";
        stackNext.className = "stack-navigation-button";
        stackNext.textContent = "→";
        stackNext.setAttribute("aria-label", "Next skill category");
        stackNavigation.append(stackPrevious, stackPosition, stackNext);
        stackGrid.after(stackNavigation);
        stackGrid.tabIndex = -1;
        stackPrevious.addEventListener("click", () => moveStackCategory(-1));
        stackNext.addEventListener("click", () => moveStackCategory(1));

        stackCategories.forEach((category) => {
          const heading = category.querySelector("h3");
          const constellation = category.querySelector(".bars");
          if (!heading || !constellation) return;
          const skills = [...constellation.querySelectorAll(".bar-row")];
          const detail = document.createElement("div");
          const detailName = document.createElement("strong");
          const detailLevel = document.createElement("span");
          const detailDescription = document.createElement("p");
          const detailTrack = document.createElement("div");
          const detailFill = document.createElement("span");
          detail.className = "stack-skill-detail";
          detail.setAttribute("aria-live", "polite");
          detailName.className = "stack-skill-detail-name";
          detailLevel.className = "stack-skill-detail-level";
          detailDescription.className = "stack-skill-detail-description";
          detailTrack.className = "stack-skill-detail-track";
          detailFill.className = "stack-skill-detail-fill";
          detailTrack.setAttribute("aria-hidden", "true");
          detailTrack.append(detailFill);
          detail.append(
            detailName,
            detailLevel,
            detailDescription,
            detailTrack,
          );
          constellation.classList.add("stack-constellation");
          constellation.setAttribute("role", "group");
          constellation.setAttribute(
            "aria-label",
            `${heading.textContent.trim()} skills`,
          );

          const points = skills.map((skill, index) => {
            const stackName = skill.querySelector(".stack-name");
            const skillName =
              stackName?.getAttribute("title") ||
              stackName?.querySelector(".sr-only")?.textContent.trim() ||
              stackName?.textContent.trim() ||
              "Skill";
            const level = skill.querySelector(".lvl")?.textContent.trim() || "";
            const percentage = Number(
              skill.querySelector(".bar-fill")?.dataset.pct || 0,
            );
            const [x, y] =
              constellationPositions[index % constellationPositions.length];
            const button = document.createElement("button");
            const core = document.createElement("span");
            const label = document.createElement("span");
            const icon = stackName?.querySelector("i, .material-symbols-outlined");
            button.type = "button";
            button.className = "stack-node";
            button.style.setProperty("--node-x", `${x}%`);
            button.style.setProperty("--node-y", `${y}%`);
            button.setAttribute(
              "aria-label",
              `${skillName}, ${level}. Select for details.`,
            );
            button.setAttribute("aria-pressed", "false");
            core.className = "stack-node-core";
            label.className = "stack-node-label";
            if (icon) {
              const iconCopy = icon.cloneNode(true);
              iconCopy.setAttribute("aria-hidden", "true");
              core.append(iconCopy);
            } else {
              core.textContent = "✦";
              core.setAttribute("aria-hidden", "true");
            }
            label.textContent = skillName;
            button.append(core, label);
            button.addEventListener("click", () => {
              points.forEach((point) => {
                point.button.setAttribute(
                  "aria-pressed",
                  String(point.button === button),
                );
              });
              detailName.textContent = skillName;
              detailLevel.textContent = `${level} · ${percentage}%`;
              detailDescription.textContent =
                skillDescriptions[skillName] ||
                `Practical experience using ${skillName} in projects and coursework.`;
              detailFill.style.width = `${percentage}%`;
            });
            skill.replaceWith(button);
            return { button, x, y };
          });

          const lines = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          lines.classList.add("stack-constellation-lines");
          lines.setAttribute("viewBox", "0 0 100 100");
          lines.setAttribute("preserveAspectRatio", "none");
          lines.setAttribute("aria-hidden", "true");
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          const center = points.reduce(
            (sum, point) => ({
              x: sum.x + point.x / points.length,
              y: sum.y + point.y / points.length,
            }),
            { x: 0, y: 0 },
          );
          const connectedPoints = [...points].sort(
            (first, second) =>
              Math.atan2(first.y - center.y, first.x - center.x) -
              Math.atan2(second.y - center.y, second.x - center.x),
          );
          const pathData = connectedPoints
            .map((point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
            )
            .join(" ") + " Z";
          path.setAttribute("d", pathData);
          path.setAttribute("pathLength", "1");
          path.style.strokeDasharray = "1 1";
          path.style.strokeDashoffset = "1";
          lines.append(path);
          constellation.prepend(lines);
          category.append(detail);
          points[0]?.button.click();
        });
        showStackCategory(0);

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

        /* ---------- interactive experience journal ---------- */
        const experiencePlanets = document.querySelectorAll(
          ".solar-system .tl-item",
        );
        const experiencePanel = document.querySelector(
          ".experience-detail-panel",
        );
        const experienceList = document.getElementById(
          "experience-journal-list",
        );
        const experienceEntries = new Map();
        const selectExperience = (planet) => {
          experienceEntries.forEach((button, entry) => {
            const selected = entry === planet;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-current", String(selected));
          });
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
          const frame = document.createElement("div");
          frame.className = "experience-journal-frame";
          frame.innerHTML = `
            <span class="quest-corner quest-corner-top-right" aria-hidden="true"></span>
            <span class="quest-corner quest-corner-bottom-left" aria-hidden="true"></span>
          `;
          const heading = document.createElement("div");
          heading.className = "experience-journal-heading";
          const detailLogo = logo.cloneNode();
          detailLogo.className = "experience-journal-logo";
          detailLogo.loading = "eager";
          const title = document.createElement("div");
          title.className = "experience-journal-title";
          const titleText = document.createElement("h3");
          titleText.className = "detail-panel-title";
          titleText.textContent = role.textContent.trim();
          const meta = document.createElement("p");
          meta.className = "detail-panel-meta";
          meta.textContent = `${org.textContent.trim()} · ${date.textContent.trim()}`;
          title.append(titleText, meta);
          heading.append(detailLogo, title);

          const descriptionText = document.createElement("p");
          descriptionText.className = "detail-panel-copy";
          descriptionText.textContent = description.textContent.trim();

          frame.append(heading, descriptionText);
          const tags = planet.querySelector(".tl-tags")?.cloneNode(true);
          if (tags) {
            tags.className = "experience-journal-tags";
            frame.appendChild(tags);
          }
          experiencePanel.replaceChildren(frame);
          experiencePanel.classList.add("has-selection");
        };
        experiencePlanets.forEach((planet) => {
          const role = planet.querySelector(".tl-role");
          const org = planet.querySelector(".tl-org");
          const date = planet.querySelector(".tl-date");
          const button = document.createElement("button");
          button.type = "button";
          button.className = "experience-journal-entry";
          const label = document.createElement("span");
          label.className = "experience-journal-entry-title";
          label.textContent = role.textContent.trim();
          const organization = document.createElement("span");
          organization.className = "experience-journal-entry-org";
          organization.textContent = org.textContent.trim();
          const period = document.createElement("span");
          period.className = "experience-journal-entry-date";
          period.textContent = date.textContent.trim();
          button.append(label, organization, period);
          button.addEventListener("click", () => selectExperience(planet));
          experienceList.appendChild(button);
          experienceEntries.set(planet, button);
        });
        if (experiencePlanets.length) selectExperience(experiencePlanets[0]);

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
          HAMIM: [
            "assets/projects/hamim/hamim%20(2).jpeg",
            "assets/projects/hamim/hamim%20(3).jpeg",
          ],
          "Maqdis Connect": [
            "assets/projects/mq/mq%20(1).jpeg",
            "assets/projects/mq/mq%20(2).jpeg",
          ],
          Obatin: [
            "assets/projects/obatin/obatin2.jpeg",
            "assets/projects/obatin/obatin3.jpeg",
          ],
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

        document.querySelectorAll(".card-link").forEach((link) => {
          const icon = link.querySelector(".material-symbols-outlined");
          if (!icon) return;
          if (link.href.includes("play.google.com")) {
            icon.className = "fa-brands fa-google-play";
            icon.textContent = "";
            icon.setAttribute("aria-hidden", "true");
            return;
          }
          if (link.href.includes("github.com")) {
            icon.className = "fa-brands fa-github";
            icon.textContent = "";
            icon.setAttribute("aria-hidden", "true");
          }
        });

        function closeLightbox() {
          lightbox.classList.remove("open");
          lbContent.innerHTML = "";
        }
        lbClose.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => {
          if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            if (lightbox.classList.contains("open")) {
              closeLightbox();
            } else {
              navigateToScreen("hero", true);
            }
            return;
          }
          if (
            lightbox.classList.contains("open") ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.target instanceof HTMLElement &&
              (event.target.isContentEditable ||
                event.target.matches("input, select, textarea"))
          ) {
            return;
          }
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          if (document.body.dataset.screen === "stack") {
            event.preventDefault();
            moveStackCategory(event.key === "ArrowRight" ? 1 : -1);
            return;
          }
          const currentIndex = screenOrder.indexOf(document.body.dataset.screen);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex =
            (currentIndex + direction + screenOrder.length) % screenOrder.length;
          event.preventDefault();
          navigateToScreen(screenOrder[nextIndex], true);
        });

        /* ---------- project filter ---------- */
        const filterBtns = document.querySelectorAll(".filter-btn");
        const projectCards = [
          ...document.querySelectorAll("#projects .project-grid .card"),
        ];
        const cards = document.querySelectorAll("#project-grid .card");
        const ongoingGrid = document.querySelector(
          "#projects .ongoing-project-grid",
        );
        const ongoingTitle = ongoingGrid?.previousElementSibling;
        const finishedTitle = document.querySelector(
          "#project-grid",
        )?.previousElementSibling;
        const projectGrid = document.getElementById("project-grid");
        const projectQuestList = document.getElementById("project-quest-list");
        const projectQuestDetail = document.getElementById("project-quest-detail");
        const projectQuestButtons = new Map();
        let selectedQuestProject = null;

        const selectQuestProject = (card) => {
          selectedQuestProject = card;
          projectQuestButtons.forEach((button, project) => {
            const selected = project === card;
            button.classList.toggle("active", selected);
            button.setAttribute("aria-current", String(selected));
          });

          const title = card.querySelector(".card-title")?.textContent.trim() ?? "";
          const category = card.querySelector(".card-cat")?.textContent.trim() ?? "";
          const role = card.querySelector(".card-role")?.textContent.trim() ?? "";
          const description = card.querySelector(".card-desc")?.textContent.trim() ?? "";
          const isOngoing = card.closest(".ongoing-project-grid") !== null;
          const media = card.querySelector(".card-media")?.cloneNode(true);
          const stack = card.querySelector(".card-stack")?.cloneNode(true);
          const metrics = card.querySelector(".card-metrics")?.cloneNode(true);
          const links = [...card.querySelectorAll(".card-link")].map((link) =>
            link.cloneNode(true),
          );

          projectQuestDetail.replaceChildren();
          const frame = document.createElement("div");
          frame.className = "project-quest-frame";
          frame.innerHTML = `
            <span class="quest-corner quest-corner-top-right" aria-hidden="true"></span>
            <span class="quest-corner quest-corner-bottom-left" aria-hidden="true"></span>
          `;

          const detailMedia = document.createElement("div");
          detailMedia.className = "project-quest-media";
          if (media) {
            media.className = "project-quest-media-content";
            media.querySelectorAll("img").forEach((image) => {
              image.loading = "eager";
            });
            detailMedia.appendChild(media);
          }

          const heading = document.createElement("h3");
          heading.className = "project-quest-title";
          heading.textContent = title;

          const metadata = document.createElement("div");
          metadata.className = "project-quest-meta";
          const categoryLabel = document.createElement("span");
          categoryLabel.textContent = category;
          const statusLabel = document.createElement("span");
          statusLabel.textContent = isOngoing ? "IN PROGRESS" : "COMPLETED";
          metadata.append(categoryLabel, statusLabel);

          const copy = document.createElement("div");
          copy.className = "project-quest-copy";
          if (role) {
            const roleLabel = document.createElement("p");
            roleLabel.className = "project-quest-role";
            roleLabel.textContent = role;
            copy.appendChild(roleLabel);
          }
          const descriptionText = document.createElement("p");
          descriptionText.className = "project-quest-description";
          descriptionText.textContent = description;
          copy.appendChild(descriptionText);

          const footer = document.createElement("div");
          footer.className = "project-quest-footer";
          const footerLabel = document.createElement("p");
          footerLabel.className = "project-quest-footer-label";
          footerLabel.textContent = "TOOLS & OBJECTIVES";
          footer.appendChild(footerLabel);
          if (stack) {
            stack.classList.add("project-quest-stack");
            footer.appendChild(stack);
          }
          if (metrics) {
            metrics.classList.add("project-quest-metrics");
            footer.appendChild(metrics);
          }
          if (links.length) {
            const actionLinks = document.createElement("div");
            actionLinks.className = "project-quest-links";
            links.forEach((link) => actionLinks.appendChild(link));
            footer.appendChild(actionLinks);
          }

          const galleryButton = document.createElement("button");
          galleryButton.type = "button";
          galleryButton.className = "project-quest-gallery";
          galleryButton.textContent = "OPEN GALLERY";
          galleryButton.addEventListener("click", () => openProject(card));

          frame.append(detailMedia, heading, metadata, copy, footer, galleryButton);
          projectQuestDetail.appendChild(frame);
        };

        projectCards.forEach((card, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "project-quest-entry";
          button.dataset.category = card.dataset.cat ?? "";
          const title = card.querySelector(".card-title")?.textContent.trim() ?? `Project ${index + 1}`;
          const category = card.querySelector(".card-cat")?.textContent.trim() ?? "";
          const label = document.createElement("span");
          label.className = "project-quest-entry-title";
          label.textContent = title;
          const sublabel = document.createElement("span");
          sublabel.className = "project-quest-entry-category";
          sublabel.textContent = category;
          button.append(label, sublabel);
          button.addEventListener("click", () => selectQuestProject(card));
          projectQuestList.appendChild(button);
          projectQuestButtons.set(card, button);
        });

        const updateProjectLayout = () => {
          const visibleCards = [...cards].filter((card) => card.style.display !== "none");
          projectGrid.classList.toggle("single-result", visibleCards.length === 1);
          const ongoingVisible = [...(ongoingGrid?.querySelectorAll(".card") ?? [])]
            .some((card) => card.style.display !== "none");
          const finishedVisible = visibleCards.length > 0;
          if (ongoingGrid) ongoingGrid.style.display = ongoingVisible ? "" : "none";
          if (ongoingTitle) ongoingTitle.style.display = ongoingVisible ? "" : "none";
          if (projectGrid) projectGrid.style.display = finishedVisible ? "" : "none";
          if (finishedTitle) finishedTitle.style.display = finishedVisible ? "" : "none";

          projectCards.forEach((card) => {
            const button = projectQuestButtons.get(card);
            if (button) button.hidden = card.style.display === "none";
          });
          const selectedIsVisible =
            selectedQuestProject && selectedQuestProject.style.display !== "none";
          if (!selectedIsVisible) {
            const firstVisible = projectCards.find(
              (card) => card.style.display !== "none",
            );
            if (firstVisible) selectQuestProject(firstVisible);
            else {
              selectedQuestProject = null;
              projectQuestDetail.replaceChildren();
            }
          }
        };
        filterBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const f = btn.dataset.filter;
            projectCards.forEach((c) => {
              c.style.display =
                f === "all" || c.dataset.cat === f ? "" : "none";
            });
            updateProjectLayout();
          });
        });
        const defaultProjectFilter = document.querySelector(
          '#projects .filter-btn[data-filter="product"]',
        );
        if (defaultProjectFilter) defaultProjectFilter.click();
        updateProjectLayout();

        /* ---------- ask ren ---------- */
        const KB = [
          {
            k: ["who is ren", "about ren", "introduce", "tell me about ren"],
            a: "I'm Ren, an Informatics Engineering student who likes building things and figuring out how they can actually be useful. I started more on the technical side, but over time I got more interested in product, project management, and working with people. So now I'm kind of in the middle of all three.",
          },
          {
            k: ["technolog", "stack", "tools", "tech"],
            a: "I mostly work with web and mobile development, Python, AI, and databases. I've used things like Laravel, FastAPI, Flutter, JavaScript, and Python in different projects. I've also worked with AI, including NLP and chatbot projects. I'm not really attached to one specific tech stack though. Usually I just pick whatever makes the most sense for what I'm trying to build.",
          },
          {
            k: ["project", "built", "work on", "portfolio"],
            a: "Quite a few, honestly 😭. I've worked on web and mobile apps, AI and chatbot projects, an AR learning app for kids, financial education products, and some community projects. One of my recent ones was a village profile website for Desa Cikanyere, which I built together with Sidik during KKN.",
          },
          {
            k: [
              "dev or product",
              "development or product",
              "focused on",
              "more focused",
            ],
            a: "Product, probably. But I still really enjoy development. Having a technical background helps me understand what the developers are dealing with, while my project experience taught me to think about users, priorities, and the bigger picture. I like being somewhere in between the two.",
          },
          {
            k: [
              "data",
              "experience with data",
              "analytics",
              "ml",
              "machine learning",
            ],
            a: "I've worked with data mostly through my academic and project work. My current thesis, for example, combines sentiment analysis and stock price prediction using IndoBERT and LSTM. I've also worked with dashboards and data analysis in other projects. What I enjoy most is taking a bunch of data and trying to turn it into something that actually tells us something useful.",
          },
          {
            k: ["good project manager", "good pm", "why a good", "makes ren"],
            a: "I wouldn't say I'm a \"good PM\" just because I've had the title 😭. I think what helps me is that I've actually been on both sides. I've built things myself, but I've also managed teams, planned projects, talked with stakeholders, and dealt with things not going according to plan. For me, being a PM is mostly about keeping people aligned and making sure everyone understands what we're building and why we're building it.",
          },
          {
            k: ["leadership", "lead", "team"],
            a: "A lot of it actually came from AIESEC. I've led teams, organized programs, worked with external partners, and handled projects with quite a few moving parts. Before that, I was also involved in student organizations back in high school. I wouldn't say leadership made me someone who always knows what to do. If anything, it taught me how to listen, communicate, delegate, and figure things out together with the team.",
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

        /* ---------- language preference ---------- */
        const languageModal = document.getElementById("language-modal");
        const languageButtons = document.querySelectorAll("[data-language]");
        const translations = {
          id: {
            nav: ["Tentang", "Pengalaman", "Proyek", "Keahlian", "Pencapaian", "GitHub", "Tanya Ren", "Kontak"],
            menu: ["Tentang", "Pengalaman", "Proyek", "Keahlian & teknologi", "Pencapaian", "GitHub", "Tanya Ren", "Kontak"],
            menuHint: "Pilih tujuan untuk melanjutkan",
            menuIntro: "Produk · kode · data.",
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
            filters: ["Produk dan Dampak", "Web dan Aplikasi", "Data dan Machine Learning", "Seni"],
            stack: "Keahlian teknis",
            stackTitle: "Teknologi yang saya gunakan.",
            stackLede: "Alat untuk merencanakan, membangun, dan mengevaluasi pekerjaan.",
            achievements: "Pencapaian and kepemimpinan",
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
          document.querySelector(".hero-menu-kicker").textContent = "Portofolio · Bandung, Indonesia";
          document.querySelector(".hero-menu-intro").innerHTML =
            `${t.menuIntro}<span>${t.heroEyebrow}</span>`;
          document.querySelectorAll(".hero-menu-list a span").forEach((item, index) => {
            if (t.menu[index]) item.textContent = t.menu[index];
          });
          document.querySelector(".hero-menu-hint").textContent = t.menuHint;
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
          const filterIcons = ["rocket_launch", "code", "monitoring", "draw"];
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
        else if (!savedLanguage) setLanguageWidgetState(false);
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