import { getCamps } from "@/server/actions/camps";
import { CampsList } from "./camps-list";

export default async function CampsPage() {
  const camps = await getCamps();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Camps</h1>
        <p className="text-muted-foreground">
          Manage your camps and financial forecasts
        </p>
      </div>
      <CampsList initialCamps={camps} />
    </div>
  );
}
