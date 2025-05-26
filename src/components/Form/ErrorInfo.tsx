import { ErrorSeverity, isFieldErrorInfo, FieldErrorInfo } from '@/types';
import { normalizeError } from '@/utils';

interface ErrorInfoProps {
  readonly error?: unknown;
  readonly className?: string;
}

export const ErrorInfo = ({ error, className = '' }: Readonly<ErrorInfoProps>) => {
  if (!error) return null;

  const standardError: FieldErrorInfo = isFieldErrorInfo(error) ? error : normalizeError(error);

  const { message, icon, info, description, severity } = standardError;

  let severityClass = 'text-accent';
  if (severity === ErrorSeverity.INFO) severityClass = 'text-info';
  else if (severity === ErrorSeverity.WARNING) severityClass = 'text-warning';
  else if (severity === ErrorSeverity.CRITICAL) severityClass = 'text-critical';

  return (
    <div className={`error-container ${className}`}>
      <div className="flex items-start">
        {icon && (
          <span className={`error-icon ${severityClass} mr-2`}>
            {icon === 'mail' && '📧'}
            {icon === 'mail-warning' && '📧⚠️'}
            {icon === 'lock' && '🔒'}
            {icon === 'network-off' && '📶❌'}
            {icon === 'shield-warning' && '🛡️⚠️'}
            {!['mail', 'mail-warning', 'lock', 'network-off', 'shield-warning'].includes(icon) &&
              '⚠️'}
          </span>
        )}
        <div className="error-content">
          {message && <p className={`${severityClass} text-sm font-medium`}>{message}</p>}
          {info && <p className={`${severityClass}/80 mt-0.5 text-xs`}>{info}</p>}
          {description && <p className="text-text-muted mt-1 text-xs">{description}</p>}
        </div>
      </div>
    </div>
  );
};
