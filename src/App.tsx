import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Refinex Agent</CardTitle>
          <CardDescription>项目初始化成功</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">开始使用</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
