import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";

gsap.registerPlugin(ScrollTrigger);

const members = [
  {
    name: "Yuebi",
    mark: "悦",
    index: "01",
    code: "MAIN DEVELOPER",
    role: "主要开发者 · 项目创始成员",
    bio: "负责网站主要开发。热衷 C++ 与 Web，也喜欢听歌、敲代码。",
    details: [
      "你好呀，我是悦笔，2026 届毕业生，也是学生目录项目创建者之一。",
      "我热衷于探索计算机领域的知识，尤其喜欢 C++ 和 Web 开发，也对区块链、人工智能与计算机网络保持实践和兴趣。这个网站由我独立开发。",
      "是一个旅行者、开拓者、探索者、绳匠。开发过各类软件项目，欢迎访问 GitHub 主页交流。",
      "如需联系，欢迎发邮件；邮件回复可能稍慢，但我会及时查看。",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/yuebittt" },
      { label: "个人博客 ↗", href: "https://yuebittt.github.io" },
      { label: "邮件", href: "mailto:yuebity@outlook.com" },
    ],
  },
  {
    name: "Strohmeier",
    mark: "S",
    index: "02",
    code: "DEVELOPER",
    role: "开发者",
    bio: "团队开发成员，参与项目建设。",
    details: ["Strohmeier 是团队中的开发者。虽然目前公开信息较少，但他一直为项目的发展贡献力量。"],
    links: [],
  },
  {
    name: "Leo",
    mark: "L",
    index: "03",
    code: "DEVELOPER",
    role: "开发者 · 服务器维护",
    bio: "曾负责服务器维护，目前已转学；喜欢无人机。",
    details: [
      "Leo 曾负责服务器维护，是团队的技术支持成员。他参与网站的日常维护，帮助保障项目稳定运行；目前已转学。",
      "除了技术工作，他也喜欢无人机飞行，是个热爱科技和户外活动的人。",
    ],
    links: [
      { label: "GitHub ↗", href: "https://github.com/liyang090811" },
      { label: "邮件", href: "mailto:wxliloveyou@outlook.com" },
    ],
  },
  {
    name: "辰艾",
    mark: "辰",
    index: "04",
    code: "DEVELOPER",
    role: "开发者 · 服务器维护",
    bio: "负责服务器维护，平时喜欢玩《第五人格》。",
    details: [
      "辰艾是目前负责服务器维护的开发者，也会参与网站日常维护和更新。",
      "平时喜欢玩《第五人格》，自称“学牲”，对技术工作一直很上心。",
    ],
    links: [
      { label: "GitHub ↗", href: "https://github.com/zmmmawzfl" },
      { label: "邮件", href: "mailto:hekaiyu2009@outlook.com" },
    ],
  },
  {
    name: "菀妙海",
    mark: "海",
    index: "05",
    code: "DEVELOPER",
    role: "开发者 · 功能建设",
    bio: "参与开发聊天室与联网工具，欢迎交流。",
    details: [
      "菀妙海参与开发聊天室和联网工具 InternetRepair。聊天室是他的得意之作，功能丰富，投入了不少时间。",
      "他之前还开发过手表课程表，Minecraft 和音游也是日常爱好。欢迎通过 GitHub 或邮件交流。",
    ],
    links: [
      { label: "GitHub ↗", href: "https://github.com/stormsnow2233" },
      { label: "邮件", href: "mailto:storm_snow@outlook.com" },
    ],
  },
  {
    name: "等待贤士中",
    mark: "?",
    index: "06",
    code: "OPEN POSITION",
    role: "未来的开发者",
    bio: "说不定，正在看这个网站的你，未来就会出现在这里。欢迎加入我们。",
    details: ["说不定，正在看这个网站的你，未来就会出现在这里。欢迎加入我们，一起把新的想法做成作品。"],
    links: [],
  },
];

const aboutStats = [
  ["05", "开发与维护成员"],
  ["WEB", "持续迭代的网站项目"],
  ["∞", "仍在前进的好奇心"],
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><i /><i /></span>;
}

function App() {
  const rootRef = useRef(null);
  const dialogRef = useRef(null);
  const modalTimelineRef = useRef(null);
  const visualRef = useRef(null);
  const cursorRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioEnabledRef = useRef(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const selected = members[selectedIndex];

  function playFeedback(kind = "select") {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const frequency = kind === "confirm" ? 740 : 460;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.32, now + 0.075);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.17);
    } catch {
      audioContextRef.current = null;
    }
  }

  function selectMember(index) {
    const normalizedIndex = (index + members.length) % members.length;
    setSelectedIndex(normalizedIndex);
    playFeedback("select");
    requestAnimationFrame(() => {
      document.querySelector(`[data-member-index="${normalizedIndex}"]`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }

  function openProfile() {
    playFeedback("confirm");
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.showModal();
    modalTimelineRef.current?.kill();
    const content = dialog.querySelector(".modal-content");
    const profileItems = dialog.querySelectorAll(".modal-kicker, .modal-name, .modal-role, .modal-body p, .modal-links");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(dialog, { autoAlpha: 0, y: 18, scale: 0.975, transformOrigin: "50% 50%" });
    gsap.set(content, { autoAlpha: 0, y: 12 });
    modalTimelineRef.current = gsap.timeline({ defaults: { overwrite: true } })
      .to(dialog, { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: "power3.out" })
      .to(content, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, "-=0.24")
      .fromTo(profileItems, { autoAlpha: 0, y: 12 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.035,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
      }, "-=0.16");
  }

  function closeProfile() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    modalTimelineRef.current?.kill();

    const finishClose = () => {
      dialog.close();
      gsap.set([dialog, dialog.querySelector(".modal-content")], { clearProps: "all" });
      modalTimelineRef.current = null;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }

    const content = dialog.querySelector(".modal-content");
    modalTimelineRef.current = gsap.timeline({ onComplete: finishClose })
      .to(content, { autoAlpha: 0, y: 8, duration: 0.16, ease: "power2.in" })
      .to(dialog, { autoAlpha: 0, y: 10, scale: 0.985, duration: 0.2, ease: "power2.in" }, "-=0.08");
  }

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .fromTo(".hero-kicker", { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.55 })
          .fromTo(".hero-wordmark, .hero-title", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.76, stagger: 0.12 }, "-=0.16")
          .fromTo(".hero-copy, .hero-actions", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 }, "-=0.34")
          .fromTo(".hero-scene", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, "-=0.9");

        gsap.utils.toArray("[data-reveal]").forEach((element) => {
          gsap.fromTo(element, { autoAlpha: 0, y: 32 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 84%", once: true },
          });
        });

        gsap.to(".hero-scene-back", {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 },
        });

        const directoryTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".directory-marquee",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            pin: ".directory-marquee-screen",
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        directoryTimeline
          .to(".directory-marquee-track", { xPercent: -50, ease: "none", force3D: true }, 0)
          .fromTo(".directory-marquee-rule", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);

        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".team",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            pin: ".team-pin-screen",
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = Math.round(self.progress * 100);
              root.querySelector(".pin-progress")?.setAttribute("aria-valuenow", String(progress));
              root.querySelector(".pin-progress-label").textContent = `${String(progress).padStart(2, "0")} / 100`;
            },
          },
        });
        pinTimeline
          .fromTo(".visual-planes", { scale: 0.72, rotation: -8 }, { scale: 1.34, rotation: 7, ease: "none", force3D: true }, 0)
          .fromTo(".visual-plane.plane-one", { xPercent: -16, yPercent: 12 }, { xPercent: 13, yPercent: -9, ease: "none", force3D: true }, 0)
          .fromTo(".visual-plane.plane-two", { xPercent: 18, yPercent: 14 }, { xPercent: -12, yPercent: -10, ease: "none", force3D: true }, 0)
          .fromTo(".visual-ring", { scale: 0.35, autoAlpha: 0.35 }, { scale: 1.28, autoAlpha: 1, ease: "none", force3D: true }, 0.08)
          .fromTo(".visual-label, .visual-index", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.08, ease: "none" }, 0.18)
          .fromTo(".operator-name, .operator-role, .operator-details", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.08, ease: "none" }, 0.3)
          .fromTo(".operator-actions", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: "none" }, 0.48)
          .to(".pin-progress-fill", { scaleX: 1, ease: "none" }, 0);
      }, root);
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    if (!visualRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(".operator-meta", { autoAlpha: 0, x: -12 }, {
        autoAlpha: 1,
        x: 0,
        duration: 0.32,
        ease: "power2.out",
        clearProps: "all",
      });
      gsap.fromTo(".operator-monogram", { autoAlpha: 0, scale: 0.88, rotate: -5 }, {
        autoAlpha: 1,
        scale: 1,
        rotate: 0,
        duration: 0.58,
        ease: "back.out(1.5)",
        force3D: true,
      });
    }, rootRef);
    return () => context.revert();
  }, [selectedIndex]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)").matches) return undefined;
    const root = rootRef.current;
    const quickSetters = Array.from(root.querySelectorAll("[data-depth]")).map((layer) => {
      const depth = Number(layer.dataset.depth);
      return {
        x: gsap.quickTo(layer, "x", { duration: 0.75, ease: "power3.out" }),
        y: gsap.quickTo(layer, "y", { duration: 0.75, ease: "power3.out" }),
        depth,
      };
    });
    const cursorX = cursorRef.current ? gsap.quickTo(cursorRef.current, "x", { duration: 0.16, ease: "power2.out" }) : null;
    const cursorY = cursorRef.current ? gsap.quickTo(cursorRef.current, "y", { duration: 0.16, ease: "power2.out" }) : null;

    function onPointerMove(event) {
      const horizontal = event.clientX / window.innerWidth - 0.5;
      const vertical = event.clientY / window.innerHeight - 0.5;
      quickSetters.forEach((setter) => {
        setter.x(horizontal * setter.depth * -38);
        setter.y(vertical * setter.depth * -30);
      });
      cursorX?.(event.clientX);
      cursorY?.(event.clientY);
    }

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => root.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor || window.matchMedia("(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)").matches) return undefined;
    const onPointerOver = (event) => {
      if (event.target.closest("a, button, [role='tab']")) cursor.classList.add("is-hovering");
    };
    const onPointerOut = (event) => {
      if (event.target.closest("a, button, [role='tab']")) cursor.classList.remove("is-hovering");
    };
    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerout", onPointerOut);
    return () => {
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return (
    <div className="site-shell" ref={rootRef}>
      <div className="cursor-orbit" ref={cursorRef} aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="开发团队 - 关于我们">
          <BrandMark />
          <span className="brand-name"><strong>开发团队</strong><small>ABOUT OUR TEAM</small></span>
        </a>
        <div className="header-controls">
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span />
          </button>
        </div>
        <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label="主导航">
          <a href="#about" onClick={() => setMenuOpen(false)}>关于我们</a>
          <a href="#team" onClick={() => setMenuOpen(false)}>开发成员</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>联系</a>
          <a className="nav-home" href="/index.html">返回首页 <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-scene" aria-hidden="true">
            <div className="hero-scene-back parallax-layer" data-depth="1.6" />
            <div className="hero-scene-mid parallax-layer" data-depth="1" />
            <div className="hero-scene-front parallax-layer" data-depth="0.55" />
            <span className="scene-coordinate">35° 41' 22.8\" N / 139° 41' 30.1\" E</span>
          </div>
          <div className="hero-content">
            <p className="eyebrow hero-kicker">SITE DEVELOPMENT TEAM</p>
            <div className="hero-wordmark"><strong>TEAM</strong><span>DEVELOPMENT / 01</span></div>
            <h1 id="hero-heading" className="hero-title">每一份热爱，<br />都能抵达更远的前线。</h1>
            <p className="hero-copy">这里记录着参与网站开发与维护的成员。<br />从一行代码开始，把想法一点点变成真实的作品。</p>
            <div className="hero-actions">
              <a className="action primary" href="#team">认识开发成员 <span aria-hidden="true">↓</span></a>
              <a className="action" href="#about">了解我们 <span aria-hidden="true">↘</span></a>
            </div>
          </div>
          <span className="hero-index">ENDMINISTRATION · TEAM FILE / 01</span>
          <span className="hero-scroll" aria-hidden="true">SCROLL <i /></span>
        </section>

        <section className="about section" id="about">
          <div className="section-inner about-grid">
            <div data-reveal>
              <p className="section-kicker">WHO WE ARE</p>
              <h2 className="section-title">关于我们<span>AN INDEPENDENT WEB PROJECT</span></h2>
            </div>
            <div className="about-copy" data-reveal>
              <div className="about-copy-top"><span className="about-index">01 / PROJECT PROFILE</span><span className="about-status">ACTIVE</span></div>
              <p className="lead">我们是一群参与网站开发、工具建设与服务器维护的成员。</p>
              <p>有人负责页面与功能，有人维护服务，也有人一起把新的想法做出来。我们用各自擅长的方式，让这个项目持续运转。</p>
              <div className="data-strip" aria-label="团队概况">
                {aboutStats.map(([value, label]) => <div className="data-item" key={value}><strong>{value}</strong><span>{label}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="directory-marquee" aria-label="学生目录">
          <div className="directory-marquee-screen">
            <span className="directory-marquee-code">STUDENT DIRECTORY / ABOUT THE PROJECT</span>
            <div className="directory-marquee-window">
              <div className="directory-marquee-track">
                <h2 className="directory-marquee-title"><span>//</span> 学生目录</h2>
                <h2 className="directory-marquee-title" aria-hidden="true"><span>//</span> 学生目录</h2>
              </div>
            </div>
            <span className="directory-marquee-rule" aria-hidden="true" />
            <span className="directory-marquee-index" aria-hidden="true">SD / 2026</span>
          </div>
        </section>

        <section className="team section" id="team">
          <div className="team-pin-screen">
          <div className="section-inner team-inner">
            <div className="team-heading" data-reveal>
              <div>
                <p className="section-kicker">OPERATORS / DEVELOPER FILES</p>
                <h2 className="section-title">开发成员<span>THE PEOPLE BEHIND THE PROJECT</span></h2>
              </div>
              <p className="team-note">选择成员查看档案。每一位成员都在不同的位置上，为项目的开发与维护贡献力量。</p>
            </div>

            <div className="team-browser">
              <section className="operator-stage" aria-label="当前成员档案">
                <div className="operator-copy">
                  <p className="operator-meta"><span>{selected.index} / {selected.code}</span></p>
                  <h3 className="operator-name">{selected.name}</h3>
                  <p className="operator-role">{selected.role}</p>
                  <div className="operator-details">
                    {selected.details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  <div className="operator-actions">
                    <button className="profile-open" type="button" onClick={openProfile}>打开完整档案 <span aria-hidden="true">↗</span></button>
                    <div className="operator-contact">
                      {selected.links.map((link) => <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>{link.label}</a>)}
                    </div>
                  </div>
                </div>
                <div className="operator-visual" ref={visualRef} aria-hidden="true">
                  <div className="visual-planes">
                    <span className="visual-plane plane-one parallax-layer" data-depth="1.1" />
                    <span className="visual-plane plane-two parallax-layer" data-depth="0.7" />
                    <span className="visual-ring parallax-layer" data-depth="1.45" />
                  </div>
                  <span className="visual-label">OPERATOR / {selected.index}</span>
                  <span className="operator-monogram">{selected.mark}</span>
                  <span className="visual-index">DEVELOPER FILES · 2026</span>
                </div>
              </section>

              <div className="roster-selector">
                <div className="team-grid" role="tablist" aria-label="选择开发成员">
                  {members.map((member, index) => (
                    <button
                      className={`member-card${index === selectedIndex ? " is-selected" : ""}`}
                      type="button"
                      role="tab"
                      aria-selected={index === selectedIndex}
                      aria-label={`选择 ${member.name}`}
                      data-member-index={index}
                      key={member.index}
                      onClick={() => selectMember(index)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                          event.preventDefault();
                          selectMember(index + 1);
                          document.querySelector(`[data-member-index="${(index + 1) % members.length}"]`)?.focus();
                        }
                        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                          event.preventDefault();
                          const previousIndex = (index - 1 + members.length) % members.length;
                          selectMember(previousIndex);
                          document.querySelector(`[data-member-index="${previousIndex}"]`)?.focus();
                        }
                      }}
                    >
                      <span className="member-symbol">{member.mark}</span>
                      <span className="member-name">{member.name}</span>
                    </button>
                  ))}
                </div>
                <p className="roster-position" aria-live="polite"><span>{String(selectedIndex + 1).padStart(2, "0")}</span> / {String(members.length).padStart(2, "0")}</p>
              </div>
            </div>
            <div className="pin-scroll-readout" aria-hidden="true"><span>SCROLL TO EXPLORE</span><span className="pin-progress-label">00 / 100</span></div>
          </div>
          <div className="pin-progress" role="progressbar" aria-label="档案浏览进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span className="pin-progress-fill" /></div>
          </div>
        </section>

        <dialog className="member-modal" ref={dialogRef} aria-labelledby="modal-name" onClick={(event) => {
          if (event.target === dialogRef.current) closeProfile();
        }} onCancel={(event) => {
          event.preventDefault();
          closeProfile();
        }}>
          <div className="modal-content">
            <button className="modal-close" type="button" aria-label="关闭成员档案" onClick={closeProfile}>×</button>
            <p className="modal-kicker">DEVELOPER PROFILE / {selected.index}</p>
            <h2 className="modal-name" id="modal-name">{selected.name}</h2>
            <p className="modal-role">{selected.role}</p>
            <div className="modal-body">{selected.details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            {selected.links.length > 0 && <div className="modal-links"><h3>联系方式</h3><div className="modal-contact-icons">{selected.links.map((link) => <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>{link.label}</a>)}</div></div>}
          </div>
        </dialog>

        <section className="closing" id="contact">
          <div className="closing-inner" data-reveal>
            <h2 className="closing-title">继续前进，直到前线。<small>THANK YOU FOR BEING HERE</small></h2>
            <a className="action" href="mailto:yuebity@outlook.com">联系主要开发者 <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>
      <footer className="site-footer">本页面是不是非常好看？！<br />© 2026 学生目录</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
