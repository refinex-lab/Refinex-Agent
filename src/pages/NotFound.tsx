import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function Component() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">页面不存在</p>
      <Button asChild variant="outline">
        <Link to="/">返回首页</Link>
      </Button>
    </div>
  )
}
