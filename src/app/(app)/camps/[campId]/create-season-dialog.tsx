"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeason } from "@/server/actions/seasons";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateSeasonDialog({ campId }: { campId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createSeason(campId, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.season) {
      setOpen(false);
      toast.success("Season created");
      router.push(`/camps/${campId}/seasons/${result.season.id}/setup`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        New Season
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new season</DialogTitle>
          <DialogDescription>
            Set up the basic parameters for this budget season.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season-name">Season name</Label>
                <Input
                  id="season-name"
                  name="name"
                  placeholder="e.g. Summer 2026"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="season-year">Year (optional)</Label>
                <Input
                  id="season-year"
                  name="year"
                  type="number"
                  placeholder="2026"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Camp capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                placeholder="e.g. 500"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of campers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuition">Tuition per camper</Label>
              <Input
                id="tuition"
                name="tuitionPerCamper"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 3000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment">Baseline enrollment %</Label>
              <Input
                id="enrollment"
                name="baselineEnrollmentPercent"
                type="number"
                min={0}
                max={100}
                step="0.1"
                placeholder="e.g. 90"
                required
              />
              <p className="text-xs text-muted-foreground">
                Expected enrollment as a percentage of capacity
              </p>
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
              {loading ? "Creating..." : "Create season"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
