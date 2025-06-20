import { useStore } from '@nanostores/react';
import { Link } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames(
        'flex items-center bg-zama-surface p-5 border-b h-[var(--header-height)] shadow-sm',
        {
          'border-transparent': !chat.started,
          'border-zama-border': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-3 z-logo text-zama-text-primary cursor-pointer">
        <div className="h-8 w-8 bg-gradient-to-r from-zama-primary to-zama-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">Z</span>
        </div>
        <Link to="/" className="text-2xl font-bold text-zama-text-primary flex items-center">
          ZAMA
        </Link>
      </div>
      <span className="flex-1 px-4 truncate text-center text-zama-text-primary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      {chat.started && (
        <ClientOnly>
          {() => (
            <div className="mr-1">
              <HeaderActionButtons />
            </div>
          )}
        </ClientOnly>
      )}
    </header>
  );
}