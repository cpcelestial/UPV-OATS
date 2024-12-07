import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Contact } from '../types/profile'

interface ContactsSectionProps {
  contacts: Contact[]
}

export function ContactsSection({ contacts }: ContactsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Frequent Contacts</h2>
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={contact.avatarUrl} alt={contact.name} />
              <AvatarFallback>{contact.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{contact.name}</div>
              <div className="text-sm text-muted-foreground">{contact.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

