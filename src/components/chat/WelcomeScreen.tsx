export function WelcomeScreen() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Refinex" className="size-10" />
        <p className="text-lg text-muted-foreground">今天有什么可以帮到你？</p>
      </div>
    </div>
  )
}
