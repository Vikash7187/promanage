"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FileSpreadsheet, FileImage, FileCode, Download, Clock, MoreHorizontal } from "lucide-react";

const documents = [
  { name: "Product Requirement - Phoenix v2.pdf", type: "pdf", size: "2.4 MB", updated: "2 days ago", project: "Phoenix v2" },
  { name: "QA Signoff Checklist.xlsx", type: "spreadsheet", size: "145 KB", updated: "5 days ago", project: "Phoenix v2" },
  { name: "Client Review Notes.docx", type: "doc", size: "890 KB", updated: "1 week ago", project: "Mercury Labs" },
  { name: "API Architecture Diagram.png", type: "image", size: "3.1 MB", updated: "1 week ago", project: "Platform" },
  { name: "Deployment Guide.md", type: "code", size: "12 KB", updated: "2 weeks ago", project: "Platform" },
];

const iconMap: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-rose-500" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  doc: <FileText className="h-5 w-5 text-sky-500" />,
  image: <FileImage className="h-5 w-5 text-amber-500" />,
  code: <FileCode className="h-5 w-5 text-violet-500" />,
};

const bgMap: Record<string, string> = {
  pdf: "bg-rose-50",
  spreadsheet: "bg-emerald-50",
  doc: "bg-sky-50",
  image: "bg-amber-50",
  code: "bg-violet-50",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Centralized documentation and project handover files.</p>
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Recent Documents</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {documents.map((doc) => (
            <div key={doc.name} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgMap[doc.type] || "bg-slate-50"}`}>
                {iconMap[doc.type] || <FileText className="h-5 w-5 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{doc.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span>{doc.size}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {doc.updated}
                  </span>
                </div>
              </div>
              <Badge className="hidden border border-slate-200 bg-white text-xs font-normal text-slate-500 sm:inline-flex">
                {doc.project}
              </Badge>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <Download className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
