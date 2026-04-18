import { NextResponse } from "next/server";

type ResearchSignalItem = {
  id: string;
  title: string;
  journal: string;
  year: number | null;
  doi: string | null;
  url: string;
  source: "crossref" | "fallback";
};

type ResearchSignalPayload = {
  updated_at: string;
  next_refresh_at: string;
  source: "crossref" | "fallback";
  signals: ResearchSignalItem[];
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CROSSREF_URL =
  "https://api.crossref.org/works?rows=8&sort=published&order=desc&filter=type:journal-article,from-pub-date:2020-01-01&query=nursing%20student%20burnout%20sleep%20stress";

let cachedPayload: ResearchSignalPayload | null = null;
let cachedAtMs = 0;

const FALLBACK_SIGNALS: ResearchSignalItem[] = [
  {
    id: "fallback-1",
    title: "Burnout prevalence among nursing students: a systematic review and meta-analysis",
    journal: "Nurse Education Today",
    year: 2022,
    doi: "10.1016/j.nedt.2022.105353",
    url: "https://doi.org/10.1016/j.nedt.2022.105353",
    source: "fallback"
  },
  {
    id: "fallback-2",
    title: "Nursing student burnout and associated risk factors: an integrative review",
    journal: "Journal of Professional Nursing",
    year: 2023,
    doi: null,
    url: "https://www.sciencedirect.com/journal/journal-of-professional-nursing",
    source: "fallback"
  },
  {
    id: "fallback-3",
    title: "Sleep, stress, and academic pressure in healthcare student populations",
    journal: "BMC Nursing",
    year: 2024,
    doi: null,
    url: "https://bmcnurs.biomedcentral.com/",
    source: "fallback"
  }
];

function toCrossrefSignals(payload: unknown): ResearchSignalItem[] {
  const message = (payload as { message?: { items?: Array<Record<string, unknown>> } })?.message;
  const items = Array.isArray(message?.items) ? message.items : [];

  return items
    .map((item, index) => {
      const titleList = Array.isArray(item.title) ? item.title : [];
      const containerTitleList = Array.isArray(item["container-title"]) ? item["container-title"] : [];
      const title = typeof titleList[0] === "string" ? titleList[0] : "Untitled research item";
      const journal = typeof containerTitleList[0] === "string" ? containerTitleList[0] : "Unknown journal";
      const doi = typeof item.DOI === "string" ? item.DOI : null;

      const issued = (item.issued as { "date-parts"?: number[][] } | undefined)?.["date-parts"];
      const year = Array.isArray(issued) && Array.isArray(issued[0]) && typeof issued[0][0] === "number" ? issued[0][0] : null;

      const url = doi ? `https://doi.org/${doi}` : typeof item.URL === "string" ? item.URL : "https://www.crossref.org/";

      return {
        id: doi ?? `crossref-${index}`,
        title,
        journal,
        year,
        doi,
        url,
        source: "crossref" as const
      };
    })
    .filter((item) => item.title.length > 0)
    .slice(0, 8);
}

function buildPayload(signals: ResearchSignalItem[], source: "crossref" | "fallback"): ResearchSignalPayload {
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + ONE_DAY_MS);
  return {
    updated_at: now.toISOString(),
    next_refresh_at: nextRefresh.toISOString(),
    source,
    signals
  };
}

export async function GET() {
  const nowMs = Date.now();

  if (cachedPayload && nowMs - cachedAtMs < ONE_DAY_MS) {
    return NextResponse.json(cachedPayload);
  }

  try {
    const response = await fetch(CROSSREF_URL, {
      headers: {
        "User-Agent": "burnout-sentinel/1.0 (research-signal-feed)"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      throw new Error(`Crossref responded with ${response.status}`);
    }

    const payload = await response.json();
    const signals = toCrossrefSignals(payload);

    if (signals.length === 0) {
      throw new Error("Crossref returned no signal items");
    }

    cachedPayload = buildPayload(signals, "crossref");
    cachedAtMs = nowMs;
    return NextResponse.json(cachedPayload);
  } catch {
    cachedPayload = buildPayload(FALLBACK_SIGNALS, "fallback");
    cachedAtMs = nowMs;
    return NextResponse.json(cachedPayload);
  }
}