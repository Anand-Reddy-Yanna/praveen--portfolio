import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, Copy, Check, Wand2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const contentTypes = [
  { value: "description", label: "Project Description", placeholder: "e.g., Brand Identity Design" },
  { value: "tagline", label: "Tagline / Headline", placeholder: "e.g., Graphic Design" },
  { value: "about", label: "About Me Text", placeholder: "e.g., Creative Professional" },
  { value: "content", label: "Project Details / Content", placeholder: "e.g., Logo Design Project" },
];

export default function AIBot() {
  const { toast } = useToast();
  const [type, setType] = useState("description");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMut = useMutation({
    mutationFn: (data: { prompt: string; type: string }) =>
      apiRequest("/api/ai/generate", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      setResult(data.content);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate content", variant: "destructive" });
    },
  });

  function handleGenerate() {
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please enter a topic or keyword", variant: "destructive" });
      return;
    }
    generateMut.mutate({ prompt, type });
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ title: "Copied!", description: "Content copied to clipboard", variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  }

  const currentType = contentTypes.find((t) => t.value === type);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold gradient-text">AI Content Assistant</h1>
          <p className="text-sm text-muted-foreground">Generate creative content for your portfolio</p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" /> Generate Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Content Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {contentTypes.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setType(ct.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    type === ct.value
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-border/50"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Topic / Keyword</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={currentType?.placeholder || "Enter a topic..."}
              className="mt-1.5"
            />
          </div>
          <Button
            onClick={handleGenerate}
            className="w-full gap-2"
            disabled={generateMut.isPending}
          >
            {generateMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generateMut.isPending ? "Generating..." : "Generate Content"}
          </Button>
        </CardContent>
      </Card>

      {/* Output Section */}
      {result && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Content</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-border/50 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            <p className="text-xs text-muted-foreground/50 mt-3">
              💡 Tip: Copy this content and paste it into the relevant field in Hero Settings, Projects, or Skills editors.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
