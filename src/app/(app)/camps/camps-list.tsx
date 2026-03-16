"use client";

import { useState } from "react";
import Link from "next/link";
import { createCamp, deleteCamp } from "@/server/actions/camps";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Tent, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Camp = {
  id: string;
  name: string;
  createdAt: Date;
  seasons: {
    id: string;
    name: string;
    year: number | null;
  }[];
};

export function CampsList({ initialCamps }: { initialCamps: Camp[] }) {
  const [camps, setCamps] = useState(initialCamps);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    const result = await createCamp(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.camp) {
      setCamps((prev) => [{ ...result.camp, seasons: [] } as Camp, ...prev]);
      setOpen(false);
      toast.success("Camp created");
    }
  }

  async function handleDelete(campId: string, campName: string) {
    if (!confirm(`Delete "${campName}" and all its data? This can't be undone.`)) {
      return;
    }

    const removed = camps.find((c) => c.id === campId);
    setCamps((prev) => prev.filter((c) => c.id !== campId));

    const result = await deleteCamp(campId);
    if (result.error) {
      if (removed) setCamps((prev) => [...prev, removed]);
      toast.error(result.error);
      return;
    }

    toast.success("Camp deleted");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            New Camp
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new camp</DialogTitle>
              <DialogDescription>
                Give your camp a name to get started. You&apos;ll set up seasons
                and budgets next.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="camp-name">Camp name</Label>
                  <Input
                    id="camp-name"
                    name="name"
                    placeholder="e.g. Camp Sunshine"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create camp"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {camps.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Tent className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">No camps yet</CardTitle>
            <CardDescription>
              Create your first camp to start building a financial forecast.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {camps.map((camp) => (
            <Card
              key={camp.id}
              className="group relative transition-colors hover:border-primary/30"
            >
              <Link href={`/camps/${camp.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">Open {camp.name}</span>
              </Link>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Tent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{camp.name}</CardTitle>
                      <CardDescription>
                        {camp.seasons.length > 0
                          ? `${camp.seasons[0].name}${camp.seasons[0].year ? ` (${camp.seasons[0].year})` : ""}`
                          : "No seasons yet"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-20 h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(camp.id, camp.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
