import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Building2, Mic, Bot, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  const backHref = location.startsWith("/dealer") ? "/dealer/conversations" : location.startsWith("/pharmacy") ? "/pharmacy/conversations" : "/conversations";
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

  const pharmacyName = conversation.pharmacy_name || conversation.pharmacy || "Unknown Pharmacy";
  const ts = conversation.timestamp ? new Date(conversation.timestamp).toLocaleString() : "—";

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">Call Detail</h1>
          <p className="text-xs text-muted-foreground">ID: {conversation._id}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold" data-testid="text-convo-pharmacy">{pharmacyName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{ts}</span>
            </div>
            {conversation.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${conversation.type === "inbound" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"}`}>
                {conversation.type}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {conversation.status && (
              <p className="text-sm"><span className="text-muted-foreground">Status: </span>{conversation.status}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {(conversation.pharmacist_text || conversation.ai_response) && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mic className="h-4 w-4" />Call Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {conversation.pharmacist_text && conversation.pharmacist_text !== "CALL_ENDED" && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <User className="h-3 w-3" />Pharmacist
                </div>
                <p className="text-sm bg-muted rounded p-3">{conversation.pharmacist_text}</p>
              </div>
            )}
            {conversation.ai_response && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Bot className="h-3 w-3" />MediVoice AI
                </div>
                <p className="text-sm bg-primary/10 rounded p-3">{conversation.ai_response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {conversation.summary && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{conversation.summary}</CardContent>
        </Card>
      )}

      {conversation.transcript && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Full Transcript</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{conversation.transcript}</CardContent>
        </Card>
      )}

      {conversation.messages?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Conversation Messages ({conversation.messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversation.messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
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
