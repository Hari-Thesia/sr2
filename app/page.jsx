"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Building2, Check, Compass, Lock, MapPin, MessageCircle,
  PencilRuler, Route, Ruler, ShieldCheck, Waves, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  PROJECT CONFIG — replace placeholders with brochure / RERA figures */
/* ------------------------------------------------------------------ */
const PROJECT = {
  landParcel: "35 acres", // PLACEHOLDER – confirm with SR Group
  lakeEdge: "1.2 km", // PLACEHOLDER – confirm with SR Group
  reraNo: "[Gujarat RERA registration no. to be added]",
};

const IMAGES = {
  hero: "/images/hero-dusk.png",
  aerial: "/images/aerial-lakefront.jpg",
  pool: "/images/clubhouse-pool.jpg",
  villa: "/images/gallery-extra.jpg",
};

/* ------------------------------------------------------------------ */
/*  MASTER PLAN DATA — 13 x 11 grid, 7 x 7 lake in the middle          */
/*  94 ring plots + 1 "peninsula" plot on the lake's south-east corner */
/* ------------------------------------------------------------------ */
const COLS = 13;
const ROWS = 11;
const LAKE = { r1: 3, r2: 9, c1: 4, c2: 10 };
const inLake = (r, c) => r >= LAKE.r1 && r <= LAKE.r2 && c >= LAKE.c1 && c <= LAKE.c2;

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPlots() {
  const rand = mulberry32(95);
  const cells = [];
  for (let r = 1; r <= ROWS; r++)
    for (let c = 1; c <= COLS; c++) if (!inLake(r, c)) cells.push({ r, c, peninsula: false });
  cells.push({ r: LAKE.r2, c: LAKE.c2, peninsula: true });

  const plots = cells.map((cell, i) => {
    const { r, c, peninsula } = cell;
    const lakefront = peninsula || (r >= 2 && r <= 10 && c >= 3 && c <= 11);
    const v = r < LAKE.r1 ? "South" : r > LAKE.r2 ? "North" : "";
    const h = c < LAKE.c1 ? "East" : c > LAKE.c2 ? "West" : "";
    const dir = peninsula ? "North-West" : [v, h].filter(Boolean).join("-");
    const corner = (r === 1 || r === ROWS) && (c === 1 || c === COLS);
    const type = peninsula
      ? "Lake Peninsula"
      : lakefront
      ? "Natural Lakefront"
      : corner
      ? "Premium Corner"
      : "Garden Court";
    // 800+ sq. yd. parcels, matching the headline stat
    const area = 800 + Math.floor(rand() * 7) * 50 + (lakefront ? 100 : 0) + (peninsula ? 200 : 0);
    return {
      id: i + 1, r, c, peninsula, lakefront, type, area,
      orientation: lakefront ? `Lake Facing (${dir})` : `${dir}-Facing`,
      status: "sold",
    };
  });

  // Exactly 12 lakefront plots available, 2 VIP; the peninsula is VIP.
  const lake = plots.filter((p) => p.lakefront && !p.peninsula);
  for (let i = lake.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [lake[i], lake[j]] = [lake[j], lake[i]];
  }
  lake.forEach((p, i) => (p.status = i < 12 ? "available" : i < 14 ? "vip" : "sold"));
  plots.find((p) => p.peninsula).status = "vip";
  plots
    .filter((p) => !p.lakefront)
    .forEach((p) => {
      const x = rand();
      p.status = x < 0.36 ? "available" : x < 0.4 ? "vip" : "sold";
    });
  return plots;
}

const STATUS = {
  available: {
    label: "Available", tip: "Available", tipColor: "text-avail",
    detail: "Available for Site Visit Registration",
    cell: "border-avail/70 bg-avail/15 text-avail hover:bg-avail/35 hover:shadow-[0_0_18px_rgba(16,185,129,.45)]",
    dot: "bg-avail",
  },
  sold: {
    label: "Sold / Reserved", tip: "Reserved", tipColor: "text-resv",
    detail: "Sold / Reserved — join the resale waitlist",
    cell: "border-edge bg-[#1d1f24] text-zinc-600 hover:border-zinc-500",
    dot: "bg-resv",
  },
  vip: {
    label: "VIP Reserved", tip: "VIP Reserved", tipColor: "text-gold",
    detail: "VIP Reserved — waitlist open for cancellations",
    cell: "border-gold/80 bg-gold/15 text-gold hover:bg-gold/35 hover:shadow-[0_0_18px_rgba(224,192,104,.45)]",
    dot: "bg-gold",
  },
  held: {
    label: "Hold requested", tip: "Hold requested", tipColor: "text-gold",
    detail: "Hold requested — our team will call you shortly",
    cell: "border-dashed border-gold bg-transparent text-gold",
    dot: "bg-gold",
  },
};

const EXPERIENCE = [
  {
    icon: PencilRuler,
    title: "Designed by Apurva Amin",
    text: "A low, earth-toned villa language by Architect Apurva Amin that sits quietly beside the water.",
    caption: "Architecture by Apurva Amin",
  },
  {
    icon: Waves,
    title: "Private Natural Lake Access",
    text: "A shared natural lake with a promenade, an amphitheatre and a boating edge at your doorstep.",
    caption: "Promenade, amphitheatre and boating edge",
  },
  {
    icon: Route,
    title: "20 Mins from SG Highway",
    text: "Reach SG Highway in about twenty minutes, then return to stillness at the water.",
    caption: "Connected, yet far from the noise",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const cleanPhone = (v) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
const validPhone = (v) => /^[6-9]\d{9}$/.test(cleanPhone(v));
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const inputCls =
  "w-full rounded-md border border-edge bg-char px-4 py-3 text-white placeholder:text-zinc-600 focus:border-gold";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Page() {
  const basePlots = useMemo(buildPlots, []);
  const [holds, setHolds] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [feature, setFeature] = useState(0);

  const plots = useMemo(
    () => basePlots.map((p) => (holds[p.id] ? { ...p, status: "held" } : p)),
    [basePlots, holds]
  );
  const selected = plots.find((p) => p.id === selectedId) || null;
  const hovered = plots.find((p) => p.id === hoverId) || null;
  const focus = hovered || selected;

  const lakeLeft = plots.filter((p) => p.lakefront && p.status === "available").length;
  const totalLeft = plots.filter((p) => p.status === "available").length;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dimmed = (p) =>
    (filter === "available" && p.status !== "available") ||
    (filter === "lakefront" && !p.lakefront);

  const F = EXPERIENCE[feature];

  return (
    <div className="min-h-screen bg-char text-zinc-200">
      {/* ---------- Ticker + header ---------- */}
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-center gap-2 border-b border-gold/30 bg-[#0d0e10] px-3 py-2 text-center text-xs text-gold sm:text-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-avail opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-avail" />
          </span>
          {lakeLeft > 0
            ? `Phase 1 Allocation: Only ${lakeLeft} Lakefront Plots Remaining.`
            : "Phase 1 lakefront plots are fully allocated — join the waitlist."}
        </div>
        <header className="border-b border-white/10 bg-char/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <a href="#top" className="flex items-baseline gap-2">
              <span className="font-display text-xl text-white sm:text-2xl">The Lake Side</span>
              <span className="hidden text-xs text-zinc-400 sm:inline">by SR Group</span>
            </a>
            <nav className="hidden gap-7 text-sm text-zinc-400 md:flex">
              <a className="hover:text-gold" href="#experience">Experience</a>
              <a className="hover:text-gold" href="#masterplan">Master plan</a>
              <a className="hover:text-gold" href="#gallery">Gallery</a>
              <a className="hover:text-gold" href="#verify">Pricing</a>
            </nav>
            <button
              onClick={() => scrollToId("masterplan")}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-char shadow-[0_6px_20px_-8px_rgba(224,192,104,.6)] transition hover:brightness-110"
            >
              Lock Your Preferred Plot
            </button>
          </div>
        </header>
      </div>

      {/* ---------- 1. Hero ---------- */}
      <section id="top" className="relative">
        <div className="relative isolate overflow-hidden">
          <img
            src={IMAGES.hero}
            alt="Lakeside villas at dusk, reflected in the natural lake at The Lake Side"
            className="kenburns absolute inset-0 -z-20 h-full w-full object-cover"
          />
          {/* cinematic overlays: depth gradient, side vignette, tonal wash */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-char via-char/70 to-black/40" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_30%_100%,rgba(18,19,22,.85)_0%,transparent_60%)]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

          <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-4 pb-32 pt-32 sm:px-6 sm:pb-40">
            <p className="mb-5 flex items-center gap-3 text-xs text-gold">
              <span className="h-px w-10 bg-gold/70" />
              Phase 1 · SR Group · Sanand
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[1.02] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,.6)] sm:text-7xl">
              Ninety-five villas.
              <br />
              <span className="italic text-gold">One shared lake.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
              Choose your plot on a live master plan, study its size and facing, and reserve a private
              site visit in two taps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToId("masterplan")}
                className="group inline-flex items-center gap-2 rounded-md bg-gold px-7 py-3.5 font-semibold text-char shadow-[0_14px_40px_-10px_rgba(224,192,104,.65)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Open Master Plan
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollToId("verify")}
                className="inline-flex items-center gap-2 rounded-md border border-gold/50 bg-white/[0.06] px-7 py-3.5 font-medium text-gold backdrop-blur-md transition hover:border-gold hover:bg-gold/10"
              >
                Get Pricing Matrix
              </button>
            </div>
          </div>
        </div>

        {/* Floating glass stats bar, straddling the bottom edge of the hero */}
        <div className="absolute bottom-0 left-1/2 z-20 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 translate-y-1/2">
          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/15 bg-white/[0.07] py-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl sm:py-6">
            {[
              [Building2, "95", "Luxury Villas"],
              [Ruler, "800+", "Sq. Yd. Land Parcels"],
              [MapPin, "Sanand,", "Gujarat"],
            ].map(([Icon, value, label]) => (
              <div key={label} className="flex flex-col items-center px-2 text-center sm:flex-row sm:justify-center sm:gap-4 sm:px-6 sm:text-left">
                <Icon className="mb-1 h-4 w-4 text-gold sm:mb-0 sm:h-6 sm:w-6" strokeWidth={1.4} />
                <div>
                  <p className="font-display text-xl leading-none text-white sm:text-4xl">{value}</p>
                  <p className="mt-1 text-[10px] leading-tight text-zinc-300 sm:text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 2. The Lakefront Experience ---------- */}
      <section id="experience" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <figure className="relative overflow-hidden rounded-2xl border border-gold/20 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
            <img
              src={IMAGES.pool}
              alt="Infinity-edge pool cascading toward the natural lake"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white backdrop-blur-md">
              <span key={feature} className="fade-in">{F.caption}</span>
              <span className="font-mono text-xs text-gold">0{feature + 1} / 03</span>
            </figcaption>
          </figure>

          <div>
            <p className="flex items-center gap-3 text-xs text-gold">
              <span className="h-px w-10 bg-gold/70" /> Experience
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">
              The Lakefront Experience
            </h2>
            <p className="mt-4 max-w-lg text-zinc-400">
              Every villa is oriented to the water. Mornings begin on the promenade; evenings end
              with the lake turning amber beside you.
            </p>

            <ul className="mt-8 space-y-3">
              {EXPERIENCE.map((item, i) => {
                const Icon = item.icon;
                const active = i === feature;
                return (
                  <li key={item.title}>
                    <button
                      onMouseEnter={() => setFeature(i)}
                      onFocus={() => setFeature(i)}
                      onClick={() => setFeature(i)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                        active
                          ? "border-gold/50 bg-gold/[0.06] shadow-[0_0_40px_-15px_rgba(224,192,104,.5)]"
                          : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${active ? "border-gold bg-gold/10" : "border-gold/40"}`}>
                        <Icon className="h-5 w-5 text-gold" strokeWidth={1.4} />
                      </span>
                      <span>
                        <span className="block font-display text-xl text-white sm:text-2xl">{item.title}</span>
                        <span className="mt-1 block text-sm text-zinc-400">{item.text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 3. Master plan — sales terminal ---------- */}
      <section id="masterplan" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs text-gold">
              <span className="h-px w-10 bg-gold/70" /> Master plan
            </p>
            <h2 className="mt-3 font-display text-4xl text-white sm:text-5xl">Select your plot</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              {totalLeft} of 95 plots are currently available, {lakeLeft} of them on the lake edge.
              Schematic layout, not to scale.
            </p>
          </div>
          <div role="group" aria-label="Filter plots" className="flex gap-2 text-sm">
            {[["all", "All plots"], ["available", "Available"], ["lakefront", "Lakefront"]].map(([k, label]) => (
              <button
                key={k}
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
                className={`rounded-full border px-3 py-1.5 transition ${
                  filter === k ? "border-gold bg-gold/15 text-gold" : "border-edge text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Terminal */}
          <div className="overflow-hidden rounded-xl border border-edge bg-[#0f1013] shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
            {/* terminal title bar */}
            <div className="flex items-center justify-between border-b border-edge bg-panel px-3 py-2 font-mono text-[10px] text-zinc-500 sm:px-4 sm:text-xs">
              <span className="flex items-center gap-2">
                <span className="flex gap-1">
                  <i className="h-2 w-2 rounded-full bg-resv/70" /><i className="h-2 w-2 rounded-full bg-gold/70" /><i className="h-2 w-2 rounded-full bg-avail/70" />
                </span>
                LAKESIDE // MASTERPLAN · PH-1
              </span>
              <span className="flex items-center gap-2 text-avail">
                <span className="h-1.5 w-1.5 rounded-full bg-avail motion-safe:animate-pulse" /> LIVE · {totalLeft} AVAIL
              </span>
            </div>

            <div
              className="p-2 sm:p-5"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(224,192,104,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(224,192,104,.04) 1px,transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              <div
                className="relative grid gap-[3px] sm:gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                  aspectRatio: `${COLS} / ${ROWS}`,
                }}
                onMouseLeave={() => setHoverId(null)}
              >
                <div
                  className="lake-surface relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-200/10 shadow-[inset_0_0_60px_rgba(0,0,0,.45)]"
                  style={{ gridColumn: `${LAKE.c1} / ${LAKE.c2 + 1}`, gridRow: `${LAKE.r1} / ${LAKE.r2 + 1}` }}
                >
                  <img src={IMAGES.aerial} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
                  <div className="relative text-center">
                    <p className="font-display text-xl text-white/90 sm:text-4xl">Natural Lake</p>
                    <p className="mt-1 text-[10px] text-cyan-100/70 sm:text-xs">Promenade · amphitheatre · boating</p>
                  </div>
                </div>

                {plots.map((p) => {
                  const s = STATUS[p.status];
                  const isSel = p.id === selectedId;
                  const vpos = p.r <= 3 ? "top-full mt-2" : "bottom-full mb-2";
                  const hpos = p.c <= 3 ? "left-0" : p.c >= COLS - 2 ? "right-0" : "left-1/2 -translate-x-1/2";
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      onMouseEnter={() => setHoverId(p.id)}
                      onFocus={() => setHoverId(p.id)}
                      aria-label={`Plot ${p.id}, ${p.type}, ${p.area} square yards, ${s.label}`}
                      aria-pressed={isSel}
                      className={`group relative z-10 flex items-center justify-center rounded-[4px] border text-[8px] font-semibold leading-none transition duration-150 hover:z-30 focus-visible:z-30 sm:rounded-md sm:text-xs ${s.cell} ${
                        dimmed(p) ? "opacity-20" : ""
                      } ${isSel ? "z-20 scale-110 border-gold ring-2 ring-gold" : ""}`}
                      style={{ gridColumn: p.c, gridRow: p.r }}
                    >
                      {p.id}
                      {p.status === "sold" && (
                        <span className="absolute right-[2px] top-[2px] h-[3px] w-[3px] rounded-full bg-resv sm:h-1 sm:w-1" />
                      )}
                      {/* hover tooltip */}
                      <span
                        role="tooltip"
                        className={`pointer-events-none absolute w-max min-w-[140px] rounded-md border border-gold/30 bg-[#0b0c0e]/95 px-3 py-2 text-left font-mono text-[11px] font-normal leading-snug text-zinc-300 opacity-0 shadow-[0_14px_40px_-8px_rgba(0,0,0,.9)] backdrop-blur transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:hidden ${vpos} ${hpos}`}
                      >
                        <span className="block text-white">Plot #{p.id}</span>
                        <span className="block text-zinc-400">{p.area} Sq. Yd.</span>
                        <span className={`block ${s.tipColor}`}>● {s.tip}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* terminal status line */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-edge bg-panel px-3 py-2.5 font-mono text-[10px] text-zinc-400 sm:px-4 sm:text-xs">
              <span>
                SEL&nbsp;›&nbsp;
                {focus ? (
                  <span className="text-white">
                    #{focus.id} · {focus.area} SQ.YD. · <span className={STATUS[focus.status].tipColor}>{STATUS[focus.status].tip.toUpperCase()}</span>
                  </span>
                ) : (
                  <span>— hover or tap a plot<span className="motion-safe:animate-pulse">_</span></span>
                )}
              </span>
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-avail/70 bg-avail/20" />Available</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-edge bg-[#1d1f24]" />Reserved</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-gold/80 bg-gold/20" />VIP</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border border-dashed border-gold" />Hold</span>
              </span>
            </div>
          </div>

          {/* Glass detail card */}
          <aside className="h-fit rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md lg:sticky lg:top-32">
            {focus ? (
              <>
                <p className="font-mono text-xs text-zinc-500">{hovered ? "Previewing" : "Selected"}</p>
                <p className="mt-1 font-display text-3xl text-white">Plot #{focus.id}</p>
                <p className="text-sm text-gold">{focus.type}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-zinc-500">Area</dt><dd>{focus.area} sq. yd.</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Facing</dt><dd className="text-right">{focus.orientation}</dd></div>
                  <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className={STATUS[focus.status].tipColor}>{STATUS[focus.status].tip}</dd></div>
                </dl>
              </>
            ) : (
              <>
                <Compass className="h-6 w-6 text-gold" strokeWidth={1.4} />
                <p className="mt-3 font-display text-3xl text-white">Choose a plot</p>
                <p className="mt-2 text-sm text-zinc-400">Hover to preview. Select to see full details and request a hold.</p>
              </>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-center">
              <div><p className="font-display text-4xl text-avail">{totalLeft}</p><p className="text-xs text-zinc-500">plots available</p></div>
              <div><p className="font-display text-4xl text-gold">{lakeLeft}</p><p className="text-xs text-zinc-500">on the lake edge</p></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Gallery ---------- */}
      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-16 sm:px-6 sm:pb-24">
        <h2 className="font-display text-4xl text-white sm:text-5xl">Life around the water</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
          {[
            [IMAGES.aerial, "Aerial view of the lake promenade, amphitheatre and villas", "Lake promenade, amphitheatre and clubhouse lawn", "sm:col-span-2 sm:row-span-2"],
            [IMAGES.hero, "Lakeside villas glowing at dusk", "Dusk at the water's edge", ""],
            [IMAGES.villa, "Villa facade with hanging planters and brick accents", "Villa elevation, earthy materials", ""],
          ].map(([src, alt, cap, cls]) => (
            <figure key={cap} className={`group relative overflow-hidden rounded-xl border border-edge ${cls}`}>
              <img src={src} alt={alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-xs text-zinc-200 sm:text-sm">{cap}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500">Project designed by Architect Apurva Amin. Images are artistic impressions.</p>
      </section>

      {/* ---------- Project facts ---------- */}
      <section id="features" className="border-y border-edge bg-panel/60">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            ["95", "Villa plots"],
            [PROJECT.landParcel, "Total land parcel"],
            ["20 mins", "From SG Highway"],
            [PROJECT.lakeEdge, "Natural lake edge"],
          ].map(([v, l]) => (
            <div key={l} className="border-l border-gold/40 px-5 py-4">
              <p className="font-display text-4xl text-white sm:text-5xl">{v}</p>
              <p className="mt-1 text-sm text-zinc-400">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Lead form ---------- */}
      <section id="verify" className="mx-auto max-w-3xl scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-2xl border border-gold/30 bg-white/[0.04] p-6 shadow-[0_30px_80px_-30px_rgba(224,192,104,.25)] backdrop-blur-md sm:p-10">
          <h2 className="font-display text-3xl text-white sm:text-4xl">
            Verify availability and receive custom pricing on WhatsApp
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Share two details. We confirm the plots you like and send the pricing matrix.</p>
          <LeadForm />
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-edge bg-[#0d0e10]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-display text-2xl text-white">The Lake Side</p>
            <p className="text-sm text-gold">by SR Group · Building Values</p>
            <p className="mt-2 text-sm text-zinc-500">Sanand, Gujarat</p>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-zinc-500">
            <p>RERA: {PROJECT.reraNo}</p>
            <p>
              Plot availability shown on this page is indicative and may change without notice. Master
              plan, dimensions, images and amenities are artistic impressions and subject to change by
              the developer or approving authorities. This is not an offer or contract. Please verify
              all details with the sales team before booking.
            </p>
            <p>© {new Date().getFullYear()} SR Group. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Drawer
        plot={selected}
        onClose={() => setSelectedId(null)}
        onHold={(id, info) => setHolds((h) => ({ ...h, [id]: info }))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer — right side on desktop, bottom sheet on mobile             */
/* ------------------------------------------------------------------ */
function Drawer({ plot, onClose, onHold }) {
  const open = !!plot;
  const closeRef = useRef(null);
  const [step, setStep] = useState("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setStep("idle");
    setErr("");
    if (open) closeRef.current?.focus();
  }, [plot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = plot ? STATUS[plot.status] : null;
  const canHold = plot && (plot.status === "available" || plot.status === "vip");

  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!validPhone(phone)) return setErr("Enter a valid 10-digit mobile number.");
    // TODO: POST { plotId, name, phone } to your CRM / API route here.
    onHold(plot.id, { name: name.trim(), phone: cleanPhone(phone) });
    setStep("done");
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={plot ? `Plot ${plot.id} details` : "Plot details"}
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-panel/95 p-6 shadow-2xl backdrop-blur-xl transition-[transform,visibility] duration-300 ease-out sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-2xl ${
          open ? "visible translate-x-0 translate-y-0" : "invisible translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
      >
        {plot && (
          <>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-3xl text-white">
                Plot #{plot.id} <span className="text-gold">— {plot.type}</span>
              </h3>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close plot details"
                className="rounded-md border border-edge p-2 text-zinc-400 hover:border-gold hover:text-gold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-6 divide-y divide-white/10 rounded-lg border border-white/10 text-sm">
              <div className="flex justify-between px-4 py-3"><dt className="text-zinc-500">Area</dt><dd className="text-white">{plot.area} sq. yd.</dd></div>
              <div className="flex justify-between px-4 py-3"><dt className="text-zinc-500">Orientation</dt><dd className="text-white">{plot.orientation}</dd></div>
              <div className="flex justify-between gap-6 px-4 py-3">
                <dt className="text-zinc-500">Current status</dt>
                <dd className="flex items-center gap-2 text-right text-white">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  {s.detail}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              {step === "idle" && (
                <button
                  disabled={!canHold}
                  onClick={() => setStep("form")}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-char shadow-[0_10px_30px_-10px_rgba(224,192,104,.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-edge disabled:text-zinc-500 disabled:shadow-none"
                >
                  <Lock className="h-4 w-4" />
                  {canHold ? "Hold This Plot (Request Call Back)" : plot.status === "held" ? "Hold requested" : "This plot is not available"}
                </button>
              )}
              {step === "form" && (
                <form onSubmit={submit} className="space-y-3" noValidate>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={inputCls} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number" inputMode="tel" autoComplete="tel" className={inputCls} />
                  {err && <p role="alert" className="text-sm text-resv">{err}</p>}
                  <button className="w-full rounded-md bg-gold px-5 py-3 font-semibold text-char hover:brightness-110">
                    Request call back for Plot #{plot.id}
                  </button>
                </form>
              )}
              {step === "done" && (
                <div role="status" className="flex items-start gap-3 rounded-md border border-avail/40 bg-avail/10 p-4 text-sm text-avail">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  Hold requested for Plot #{plot.id}. Our team will call you on WhatsApp shortly to confirm a site visit.
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Lead form                                                          */
/* ------------------------------------------------------------------ */
function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState({});
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!validPhone(phone)) next.phone = "Enter a valid 10-digit mobile number.";
    setErr(next);
    if (Object.keys(next).length) return;
    // TODO: POST { name, phone: cleanPhone(phone) } to your API / CRM / WhatsApp Business flow.
    setDone(true);
  };

  if (done)
    return (
      <div role="status" className="mt-6 flex items-start gap-3 rounded-md border border-avail/40 bg-avail/10 p-5 text-avail">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        Thank you, {name.trim().split(" ")[0]}. We are checking availability and will send your pricing
        matrix to +91 {cleanPhone(phone)} on WhatsApp.
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="block text-sm text-zinc-400">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 ${inputCls}`} />
        {err.name && <span role="alert" className="mt-1 block text-resv">{err.name}</span>}
      </label>
      <label className="block text-sm text-zinc-400">
        WhatsApp number
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="98765 43210" className={`mt-1 ${inputCls}`} />
        {err.phone && <span role="alert" className="mt-1 block text-resv">{err.phone}</span>}
      </label>
      <button className="flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-char shadow-[0_10px_30px_-10px_rgba(224,192,104,.6)] hover:brightness-110 sm:col-span-2">
        <MessageCircle className="h-4 w-4" />
        Send me availability and pricing
      </button>
      <p className="text-xs text-zinc-500 sm:col-span-2">By submitting you agree to be contacted on WhatsApp about The Lake Side.</p>
    </form>
  );
}
