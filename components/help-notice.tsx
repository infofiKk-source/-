"use client"

import { Phone } from "lucide-react"

export function HelpNotice() {
  return (
    <div className="mx-auto max-w-lg px-5 pb-4">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground mb-1">
              힘들면 도움을 요청하세요
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              자살예방상담전화 <span className="font-semibold text-primary">1393</span> (24시간)
              <br />
              청소년전화 <span className="font-semibold text-primary">1388</span> (24시간)
              <br />
              생명의전화 <span className="font-semibold text-primary">1588-9191</span> (24시간)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
