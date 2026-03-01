import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { MessageSquare, Phone, Search, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function CallTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === "inbound" ? "secondary" : "default"} className="capitalize text-xs gap-1">
      <Phone className="h-3 w-3" />{type}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    initiated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function Conversations() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const params: Record<string, string> = {};
  if (typeFilter !== "all") params.type = typeFilter;

  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/conversations", params],
  });

  const conversations = data?.conversations || [];
  const filtered = conversations.filter((c: any) =>
    c.pharmacyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.trigger?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Conversations</h1>
        <p className="text-muted-foreground text-sm">All inbound and outbound AI call logs</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by pharmacy or trigger..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-conversation" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40" data-testid="select-type-filter">
            <SelectValue placeholder="Call type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Calls</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No conversations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c: any) => (
            <Link key={c._id} href={`/conversations/${c._id}`}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-conversation-${c._id}`}>
                <CardContent className="flex items-center justify-between py-4 px-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CallTypeBadge type={c.type} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.pharmacyName || "Unknown Pharmacy"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.trigger || c.summary || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleString()}
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
        <p className="text-xs text-muted-foreground text-center">
          Page {data.page} of {data.totalPages} — {data.total} total conversations
        </p>
      )}
    </div>
  );
}
