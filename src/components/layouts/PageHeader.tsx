
import React from 'react';
import { BackButton } from '../vibe/BackButton';
import { LogoutButton } from '../auth/LogoutButton';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => {
  return (
    <header className="p-4 md:p-8 flex justify-between items-center shrink-0">
      <BackButton onClick={onBack} />
      <h1 className="font-mono text-lg px-4 py-2 bg-white text-black">{title}</h1>
      <LogoutButton />
    </header>
  );
};
