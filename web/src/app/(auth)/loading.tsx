import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function AuthLoading() {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="px-8 pt-8">
        <Skeleton className="mx-auto h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4 px-8">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-8 pb-8">
        <Skeleton className="h-12 w-full" />
      </CardFooter>
    </Card>
  )
}
