import { NextRequest, NextResponse } from "next/server";

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
  page: number;
  page_size: number;
  has_more: boolean;
  signals: ResearchSignalItem[];
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 8;
const MAX_PAGE_SIZE = 16;
const CROSSREF_BASE_URL = "https://api.crossref.org/works";
const CROSSREF_QUERY_PARAMS =
  "sort=published&order=desc&filter=type:journal-article,from-pub-date:2020-01-01&query=nursing%20student%20burnout%20sleep%20stress";

const cache = new Map<string, { payload: ResearchSignalPayload; cachedAtMs: number }>();

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
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=nursing+student+burnout+integrative+review",
    source: "fallback"
  },
  {
    id: "fallback-3",
    title: "Sleep, stress, and academic pressure in healthcare student populations",
    journal: "BMC Nursing",
    year: 2024,
    doi: null,
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+stress+healthcare+students",
    source: "fallback"
  }
];

function normalizeUrl(rawUrl: unknown, title: string, doi: string | null) {
  if (doi) {
    return `https://doi.org/${doi}`;
  }

  if (typeof rawUrl === "string") {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      // ignore invalid URL and use fallback below
    }
  }

  return `https://search.crossref.org/?q=${encodeURIComponent(title)}`;
}

function toCrossrefSignals(payload: unknown, offset: number): ResearchSignalItem[] {
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

      const url = normalizeUrl(item.URL, title, doi);

      return {
        id: doi ?? `crossref-${offset + index}`,
        title,
        journal,
        year,
        doi,
        url,
        source: "crossref" as const
      };
    })
    .filter((item) => item.title.length > 0)
    .slice(0, MAX_PAGE_SIZE);
}

function buildPayload(
  signals: ResearchSignalItem[],
  source: "crossref" | "fallback",
  page: number,
  pageSize: number,
  hasMore: boolean
): ResearchSignalPayload {
  const now = new Date();
  const nextRefresh = new Date(now.getTime() + ONE_DAY_MS);
  return {
    updated_at: now.toISOString(),
    next_refresh_at: nextRefresh.toISOString(),
    source,
    page,
    page_size: pageSize,
    has_more: hasMore,
    signals
  };
}

export async function GET(request: NextRequest) {
  const pageRaw = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSizeRaw = Number(request.nextUrl.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const pageSize = Number.isFinite(pageSizeRaw)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSizeRaw)))
    : DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const cacheKey = `${page}:${pageSize}`;
  const nowMs = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && nowMs - cached.cachedAtMs < ONE_DAY_MS) {
    return NextResponse.json(cached.payload);
  }

  try {
    const crossrefUrl = `${CROSSREF_BASE_URL}?rows=${pageSize}&offset=${offset}&${CROSSREF_QUERY_PARAMS}`;

    const response = await fetch(crossrefUrl, {
      headers: {
        "User-Agent": "burnout-sentinel/1.0 (research-signal-feed)"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      throw new Error(`Crossref responded with ${response.status}`);
    }

    const payload = (await response.json()) as {
      message?: { items?: Array<Record<string, unknown>> };
    };
    const signals = toCrossrefSignals(payload, offset);
    const itemCount = Array.isArray(payload.message?.items) ? payload.message.items.length : 0;
    const hasMore = itemCount >= pageSize;

    if (signals.length === 0) {
      throw new Error("Crossref returned no signal items");
    }

    const nextPayload = buildPayload(signals, "crossref", page, pageSize, hasMore);
    cache.set(cacheKey, { payload: nextPayload, cachedAtMs: nowMs });
    return NextResponse.json(nextPayload);
  } catch {
    const startIndex = offset;
    const signals = FALLBACK_SIGNALS.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < FALLBACK_SIGNALS.length;
    const fallbackPayload = buildPayload(signals, "fallback", page, pageSize, hasMore);
    cache.set(cacheKey, { payload: fallbackPayload, cachedAtMs: nowMs });
    return NextResponse.json(fallbackPayload);
  }
}