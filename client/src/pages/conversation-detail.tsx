import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Building2, Store, Clock, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: conversation, isLoading } = useQuery<any>({ queryKey: [`/api/conversations/${id}`] });

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!conversation) return (
    <div className="p-6 text-center text-muted-foreground">Conversation not found.</div>
  );

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    initiated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/conversations">
          <Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">Call Detail</h1>
          <p className="text-xs text-muted-foreground">ID: {conversation._id}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={conversation.type === "inbound" ? "secondary" : "default"} className="capitalize gap-1">
                <Phone className="h-3 w-3" />{conversation.type}
              </Badge>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[conversation.status] || "bg-muted text-muted-foreground"}`}>
                {conversation.status?.replace("_", " ")}
              </span>
            </div>
            {conversation.pharmacyId && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{conversation.pharmacyId.name || conversation.pharmacyName}</span>
              </div>
            )}
            {conversation.pharmacyPhone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /><span>{conversation.pharmacyPhone}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {conversation.dealerId && (
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span>{conversation.dealerId.name || conversation.dealerId.companyName}</span>
              </div>
            )}
            {conversation.trigger && (
              <div className="text-sm">
                <span className="text-muted-foreground">Trigger: </span>
                <span className="capitalize">{conversation.trigger}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{new Date(conversation.createdAt).toLocaleString()}</span>
            </div>
            {conversation.duration && (
              <div className="text-sm text-muted-foreground">Duration: {conversation.duration}s</div>
            )}
          </div>
        </CardContent>
      </Card>

      {conversation.summary && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{conversation.summary}</CardContent>
        </Card>
      )}

      {conversation.stockRequests?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Stock Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversation.stockRequests.map((req: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                  <span className="font-medium">{req.medicineName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Qty: {req.quantity}</span>
                    <Badge variant="outline" className="text-xs capitalize">{req.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {conversation.messages?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversation Transcript ({conversation.messages.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversation.messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-muted text-foreground"
                      : msg.role === "assistant"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground text-xs italic"
                  }`}>
                    <p className="text-xs font-medium mb-1 opacity-70 capitalize">{msg.role === "user" ? "Pharmacist" : "MediVoice AI"}</p>
                    <p>{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
