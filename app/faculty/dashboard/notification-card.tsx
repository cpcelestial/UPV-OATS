import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface NotificationCardProps {
  notification: {
    id: string
    user: {
      name: string
      avatar: string
    }
    action: string
    timestamp: Date
    isRead: boolean
    details?: string; 
  }
  showFullDetails?: boolean
  onShowDetails?: () => void
}

export function NotificationCard({
  notification,
  showFullDetails = false,
  onShowDetails
}: NotificationCardProps) {
  return (
    <Card className={`w-full ${notification.isRead ? 'bg-background' : 'bg-muted/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
            <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{notification.user.name}</span>
              {' '}
              {notification.action}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
            {showFullDetails && notification.details && (
              <p className="text-sm text-muted-foreground mt-2">{notification.details}</p>
            )}
          </div>
          {!showFullDetails && onShowDetails && (
            <Button
              variant="link"
              className="text-xs text-primary"
              onClick={onShowDetails}
            >
              See full details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
