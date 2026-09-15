'use client';

import Portal from '@mui/material/Portal';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { usePathname } from 'src/routes/hooks';

import { SnackbarRoot } from './styles';
import { snackbarClasses } from './classes';

// ----------------------------------------------------------------------

export function Snackbar() {
  const pathname = usePathname();
  const isPuzzlePage = pathname.startsWith('/puzzle');

  return (
    <Portal>
      <SnackbarRoot
        expand
        closeButton
        gap={12}
        offset={16}
        visibleToasts={isPuzzlePage ? 2 : 4}
        position={isPuzzlePage ? 'top-center' : 'top-right'}
        className={`${snackbarClasses.root}${isPuzzlePage ? ' puzzle-snackbar' : ''}`}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: snackbarClasses.toast,
            icon: snackbarClasses.icon,
            loader: snackbarClasses.loader,
            loading: snackbarClasses.loading,
            /********/
            content: snackbarClasses.content,
            title: snackbarClasses.title,
            description: snackbarClasses.description,
            /********/
            closeButton: snackbarClasses.closeButton,
            actionButton: snackbarClasses.actionButton,
            cancelButton: snackbarClasses.cancelButton,
            /********/
            info: snackbarClasses.info,
            error: snackbarClasses.error,
            success: snackbarClasses.success,
            warning: snackbarClasses.warning,
          },
        }}
        icons={{
          loading: <span className={snackbarClasses.loadingIcon} />,
          info: <InfoIcon className={snackbarClasses.iconSvg} />,
          success: <CheckCircleIcon className={snackbarClasses.iconSvg} />,
          warning: <WarningIcon className={snackbarClasses.iconSvg} />,
          error: <ErrorIcon className={snackbarClasses.iconSvg} />,
        }}
      />
    </Portal>
  );
}
