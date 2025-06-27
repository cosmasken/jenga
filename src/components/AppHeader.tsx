import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export const AppHeader = () => {
  const { user, handleLogOut } = useDynamicContext();

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">JENGA</div>
        <div>
          {user ? (
            <button 
              onClick={() => handleLogOut()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Disconnect
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
