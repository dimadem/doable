
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast({
      variant: "destructive",
      title: "An error occurred",
      description: "Please try refreshing the page."
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-black">
          <div className="max-w-md p-8 space-y-4 text-center">
            <h1 className="text-2xl font-mono text-white">Something went wrong</h1>
            <p className="text-gray-400 font-mono">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black font-mono hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
