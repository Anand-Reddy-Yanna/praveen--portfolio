import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Messages() {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => apiRequest("/api/messages"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/messages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message deleted", variant: "success" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-heading font-bold gradient-text">Messages</h1>
        {messages && messages.length > 0 && (
          <span className="bg-primary/20 text-primary text-xs font-mono px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        )}
      </div>

      {messages && messages.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm">Contact form submissions will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages?.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <Card key={msg.id} className="glass-card glass-card-hover transition-all duration-200">
                <CardContent className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        <span className="font-heading font-semibold text-sm">{msg.name}</span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-muted-foreground text-xs">{msg.email}</span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                      >
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteMut.mutate(msg.id)}
                        disabled={deleteMut.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Message Preview / Full */}
                  <div className="mt-3">
                    {isExpanded ? (
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-border/50 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
