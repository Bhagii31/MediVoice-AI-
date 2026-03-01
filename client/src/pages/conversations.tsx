import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { MessageSquare, Search, Building2, ArrowRight, Mic } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ConversationCard({ convo }: { convo: any }) {
  const date = convo.timestamp ? new Date(convo.timestamp) : null;
  return (
    <Link href={`/conversations/${convo._id}`}>
      <Card className="hover-elevate cursor-pointer" data-testid={`card-conversation-${convo._id}`}>
        <CardContent className="flex items-center justify-between py-4 px-4 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
              <Mic className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate" data-testid={`text-convo-pharmacy-${convo._id}`}>
                {convo.pharmacy_name || convo.pharmacy || "Unknown Pharmacy"}
              </p>
              <p className="text-xs text-muted-foreground">
                {date ? date.toLocaleString() : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {convo.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${convo.type === "inbound" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"}`}>
                {convo.type}
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Conversations() {
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
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Conversations</h1>
        <p className="text-muted-foreground text-sm">AI voice call recordings from pharmacies</p>
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
            <p className="text-muted-foreground">No conversations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((c: any) => <ConversationCard key={c._id} convo={c} />)}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            data-testid="button-prev-page"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} total</span>
          <button
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={page === data.totalPages}
            data-testid="button-next-page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
