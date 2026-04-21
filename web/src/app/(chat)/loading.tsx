import { Skeleton } from '@/components/ui/skeleton'

export default function ChatLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Skeleton className="h-12 w-3/4 max-w-md" />
      <Skeleton className="h-24 w-5/6 max-w-lg" />
      <Skeleton className="ml-auto h-12 w-1/2 max-w-md" />
      <Skeleton className="h-24 w-5/6 max-w-lg" />
    </div>
  )
}
