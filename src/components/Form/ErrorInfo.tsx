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
          <span className="error-icon mr-2 text-red-500">
            {icon === 'mail' && '📧'}
            {icon === 'mail-warning' && '📧⚠️'}
            {icon === 'lock' && '🔒'}
            {!['mail', 'mail-warning', 'lock'].includes(icon) && '⚠️'}
          </span>
        )}
        <div className="error-content">
          {message && <p className="text-sm font-medium text-red-500">{message}</p>}
          {info && <p className="mt-0.5 text-xs text-red-400">{info}</p>}
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
    </div>
  );
};
