import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const clients = [
  { name: "Mercury Labs", email: "contact@mercurylabs.io", phone: "+1 (555) 123-4567", location: "San Francisco, CA", projects: 4, status: "Active" },
  { name: "Northwind Systems", email: "hello@northwind.dev", phone: "+1 (555) 987-6543", location: "Seattle, WA", projects: 2, status: "Active" },
  { name: "Beryl Finance", email: "team@berylfinance.com", phone: "+1 (555) 456-7890", location: "New York, NY", projects: 3, status: "On Hold" },
  { name: "Aurora Health", email: "dev@aurora.health", phone: "+1 (555) 222-3333", location: "Boston, MA", projects: 1, status: "Active" },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
        <p className="mt-1 text-sm text-slate-500">Manage client organizations and active engagements.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <Card key={client.name} className="group relative overflow-hidden rounded-2xl border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{client.name}</h3>
                  <p className="text-xs text-slate-500">{client.location}</p>
                </div>
              </div>
              <Badge
                className={
                  client.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                }
              >
                {client.status}
              </Badge>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                {client.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {client.phone}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-700">{client.projects} active projects</span>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-violet-50 hover:text-violet-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
