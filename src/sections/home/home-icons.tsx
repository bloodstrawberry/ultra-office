import type { SvgIconProps } from '@mui/material/SvgIcon';

import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import PhotoFilterRoundedIcon from '@mui/icons-material/PhotoFilterRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import SwapHorizontalCircleRoundedIcon from '@mui/icons-material/SwapHorizontalCircleRounded';

// ----------------------------------------------------------------------

export function renderHomeIcon(iconKey: string, props?: SvgIconProps) {
  switch (iconKey) {
    case 'agent':
      return <AutoAwesomeRoundedIcon {...props} />;
    case 'ocr':
      return <DocumentScannerRoundedIcon {...props} />;
    case 'spreadsheet':
      return <TableViewRoundedIcon {...props} />;
    case 'compare':
      return <CompareArrowsRoundedIcon {...props} />;
    case 'text':
      return <TextFieldsRoundedIcon {...props} />;
    case 'folder':
      return <FolderRoundedIcon {...props} />;
    case 'pdfMaster':
      return <PictureAsPdfRoundedIcon {...props} />;
    case 'fileConvert':
      return <SwapHorizontalCircleRoundedIcon {...props} />;
    case 'diagram':
      return <AccountTreeRoundedIcon {...props} />;
    case 'imageTool':
      return <PhotoFilterRoundedIcon {...props} />;
    case 'photo':
      return <PhotoLibraryRoundedIcon {...props} />;
    case 'schedule':
      return <CalendarMonthRoundedIcon {...props} />;
    case 'devTools':
      return <TerminalRoundedIcon {...props} />;
    case 'codeRunner':
      return <CodeRoundedIcon {...props} />;
    case 'barcode':
      return <QrCodeScannerRoundedIcon {...props} />;
    case 'search':
      return <SearchRoundedIcon {...props} />;
    case 'drawing':
      return <CasinoRoundedIcon {...props} />;
    case 'lock':
      return <SecurityRoundedIcon {...props} />;
    case 'flash':
      return <FlashOnRoundedIcon {...props} />;
    case 'devices':
      return <DevicesRoundedIcon {...props} />;
    case 'free':
      return <SavingsRoundedIcon {...props} />;
    // Category icons
    case 'all':
      return <GridViewRoundedIcon {...props} />;
    case 'ai':
      return <SmartToyRoundedIcon {...props} />;
    case 'data':
      return <DescriptionRoundedIcon {...props} />;
    case 'pdf':
      return <PictureAsPdfRoundedIcon {...props} />;
    case 'media':
      return <BrushRoundedIcon {...props} />;
    case 'dev':
      return <ConstructionRoundedIcon {...props} />;
    default:
      return <AutoAwesomeRoundedIcon {...props} />;
  }
}
