import { FieldError } from 'react-hook-form';
import { FieldErrorInfo as FieldErrorInfoType, isFieldErrorInfo } from '../../types/errors';

interface ErrorInfoProps {
  error?: FieldError | FieldErrorInfoType;
  className?: string;
}

export const ErrorInfo = ({ error, className = '' }: Readonly<ErrorInfoProps>) => {
  if (!error) return null;

  const isCustomError = isFieldErrorInfo(error);
  const message = error.message;
  const icon = isCustomError ? error.icon : undefined;
  const info = isCustomError ? error.info : undefined;
  const description = isCustomError ? error.description : undefined;

  return (
    <div className={`error-container ${className}`}>
      <div className="flex items-start">
        {icon && (
          <span className="error-icon text-accent mr-2">
            {icon === 'mail' && '📧'}
            {icon === 'mail-warning' && '📧⚠️'}
            {icon === 'lock' && '🔒'}
            {!['mail', 'mail-warning', 'lock'].includes(icon) && '⚠️'}
          </span>
        )}
        <div className="error-content">
          {message && <p className="text-accent text-sm font-medium">{message}</p>}
          {info && <p className="text-accent/80 mt-0.5 text-xs">{info}</p>}
          {description && <p className="text-text-muted mt-1 text-xs">{description}</p>}
        </div>
      </div>
    </div>
  );
};
