import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  declare props: Readonly<Props>;
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'حدث خطأ غير متوقع' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100"
        >
          <div className="liquid-glass-strong max-w-md w-full rounded-[30px] p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#0b1220]">
                حدث خطأ أثناء تحميل الصفحة
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                نعتذر عن هذا الخلل المؤقت. يمكنك إعادة تحديث الصفحة للاستمرار بأمان.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="liquid-btn-primary px-6 py-3 rounded-2xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل المتجر</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
