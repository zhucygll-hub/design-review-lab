import { PortfolioReviewScope as PortfolioReviewScopeType } from '@/types'

interface PortfolioReviewScopeProps {
  scope: PortfolioReviewScopeType
}

function formatPages(pages: number[]) {
  if (pages.length <= 12) return pages.join('、')
  return `${pages.slice(0, 12).join('、')} 等 ${pages.length} 页`
}

export default function PortfolioReviewScope({ scope }: PortfolioReviewScopeProps) {
  const isFull = scope.strategy === 'full_pdf'

  return (
    <section className="report-section">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="report-kicker">评审范围</p>
          <h2 className="report-title mt-1 text-xl">
            {isFull ? '已评审完整作品集' : '已进行智能抽样评审'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F4EFE6]/48">
            {scope.note}
          </p>
        </div>
        <div className="report-inline-panel min-w-[220px] p-4">
          <p className="text-xs text-[#F4EFE6]/36">页面覆盖</p>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/66">
            共 {scope.totalPages} 页，重点分析 {scope.analyzedPageCount} 页
          </p>
        </div>
      </div>

      {!isFull && scope.analyzedPages.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#F4EFE6]/8 bg-[#F4EFE6]/[0.025] p-4">
          <p className="text-xs text-[#F4EFE6]/36">重点页码</p>
          <p className="mt-2 text-sm leading-6 text-[#F4EFE6]/62">
            第 {formatPages(scope.analyzedPages)} 页
          </p>
          <p className="mt-2 text-xs leading-5 text-[#F4EFE6]/36">
            这样做可以覆盖开头、中段和结尾项目，避免只分析作品集前几页，同时控制等待时间和调用成本。
          </p>
        </div>
      )}
    </section>
  )
}
