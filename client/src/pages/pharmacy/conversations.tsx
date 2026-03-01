import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { MessageSquare, Search, ArrowRight, Mic, Phone, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PharmacyConversations() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/conversations", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("pharmacy", search);
      const res = await fetch(`/api/conversations?${params}`);
      return res.json();
    }
  });

  const conversations = data?.conversations || [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Call History</h1>
        <p className="text-muted-foreground text-sm">All your conversations with MediVoice AI</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by pharmacy name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          data-testid="input-search-conversation"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No call history yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Use "Call AI Assistant" to start your first conversation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((c: any) => (
            <Link key={c._id} href={`/pharmacy/conversations/${c._id}`}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-conversation-${c._id}`}>
                <CardContent className="flex items-center justify-between py-4 px-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`text-convo-pharmacy-${c._id}`}>
                        {c.pharmacy_name || "MediVoice AI Call"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.ai_response?.slice(0, 80) || (c.timestamp ? new Date(c.timestamp).toLocaleString() : "—")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : ""}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            data-testid="button-prev-page"
          >Previous</button>
          <span className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages}</span>
          <button
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={page === data.totalPages}
            data-testid="button-next-page"
          >Next</button>
        </div>
      )}
    </div>
  );
}
