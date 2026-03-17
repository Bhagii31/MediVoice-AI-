import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mic, Zap, PhoneCall, Building2, Clock, RefreshCw,
  Radio, AlertCircle, CheckCircle2, Activity, Filter
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ConfidenceBadge({ confidence }: { confidence?: number }) {
  if (confidence === undefined || confidence === null) return null;
  const pct = Math.round(confidence * (confidence <= 1 ? 100 : 1));
  const color = pct >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    : pct >= 65 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {pct}% conf
    </span>
  );
}

function DetectionRow({ d, i }: { d: any; i: number }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${i * 40}ms` }}
      data-testid={`row-detection-${d._id}`}
    >
      <div className={`mt-0.5 flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm ${d.callInitiated ? "bg-purple-100 dark:bg-purple-900/50" : "bg-blue-100 dark:bg-blue-900/50"}`}>
        {d.callInitiated
          ? <PhoneCall className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          : <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-sm"
            data-testid={`text-trigger-word-${d._id}`}
          >
            <Zap className="h-3 w-3" />
            {d.triggerWord}
          </span>
          <ConfidenceBadge confidence={d.confidence} />
          {d.callInitiated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <CheckCircle2 className="h-3 w-3" /> Call Initiated
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span data-testid={`text-pharmacy-${d._id}`}>{d.pharmacyName}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo(d.timestamp)}</span>
          </span>
          <span className="text-muted-foreground/50">
            {new Date(d.timestamp).toLocaleString()}
          </span>
        </div>

        {d.context && (
          <p className="mt-2 text-xs text-muted-foreground italic bg-muted/60 rounded-lg px-3 py-2 border border-border/60 leading-relaxed">
            "{d.context}"
          </p>
        )}
      </div>
    </div>
  );
}

export default function TriggerWordsPage() {
  const queryClient = useQueryClient();
  const [filterPharmacy, setFilterPharmacy] = useState("");

  const { data, isLoading, dataUpdatedAt } = useQuery<any>({
    queryKey: ["/api/trigger-words"],
    refetchInterval: 10000,
  });

  const detections: any[] = data?.detections ?? [];

  const pharmacyNames = Array.from(new Set(detections.map((d: any) => d.pharmacyName))).sort();

  const filtered = filterPharmacy
    ? detections.filter((d: any) => d.pharmacyName === filterPharmacy)
    : detections;

  const callInitiatedCount = detections.filter((d: any) => d.callInitiated).length;
  const todayCount = detections.filter((d: any) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(d.timestamp) >= today;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-black">Trigger Detections</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Live feed of trigger words detected by Raspberry Pi mics across all pharmacies
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 flex-shrink-0"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/trigger-words"] })}
          data-testid="button-refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{isLoading ? "—" : detections.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Detections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{isLoading ? "—" : todayCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-md">
              <PhoneCall className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{isLoading ? "—" : callInitiatedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Calls Triggered</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Live indicator */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-blink" />
          <span>Auto-refreshes every 10s</span>
          {dataUpdatedAt ? <span>· Last: {new Date(dataUpdatedAt).toLocaleTimeString()}</span> : null}
        </div>
        {pharmacyNames.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={filterPharmacy}
              onChange={(e) => setFilterPharmacy(e.target.value)}
              className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="select-filter-pharmacy"
            >
              <option value="">All Pharmacies</option>
              {pharmacyNames.map((name) => (
                <option key={name as string} value={name as string}>{name as string}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Detections list */}
      <Card className="border-0 shadow-sm animate-fade-in-up">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Mic className="h-4 w-4 text-indigo-500" />
            Detection Feed
            {filtered.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">{filtered.length} events</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-muted-foreground">No trigger detections yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                When the Raspberry Pi mic detects a trigger word at a pharmacy, it will appear here automatically.
              </p>
              <div className="mt-2 text-xs text-muted-foreground bg-muted rounded-lg px-4 py-2 font-mono">
                POST /api/trigger-words
              </div>
            </div>
          ) : (
            filtered.map((d: any, i: number) => (
              <DetectionRow key={d._id} d={d} i={i} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Pi integration guide */}
      <Card className="border-0 shadow-sm bg-muted/40 animate-fade-in-up">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Raspberry Pi Integration</p>
          <p className="text-xs text-muted-foreground mb-2">From the Pi, POST to this endpoint when a trigger word is detected:</p>
          <pre className="text-xs bg-background rounded-lg p-3 border border-border overflow-x-auto text-foreground leading-relaxed">{`POST /api/trigger-words
{
  "pharmacyName": "CVS - Newark",
  "pharmacyId": "optional-mongo-id",
  "triggerWord": "prescription",
  "confidence": 0.92,
  "context": "...short snippet of speech...",
  "callInitiated": true
}`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
