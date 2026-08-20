export type StampType =
  | 'circle_personal' // 개인 인감 (원형)
  | 'oval_personal' // 개인 막도장 (타원형)
  | 'square_seal' // 사각 직인
  | 'circle_corporate' // 법인/회사 직인 (2중 원형)
  | 'approval_sign'; // 결재란 도장 (담당/팀장/대표)

export type StampFont = 'classic_seal' | 'serif' | 'gothic' | 'cursive';

export interface StampConfig {
  type: StampType;
  mainText: string;
  subText: string;
  font: StampFont;
  color: string;
  borderThickness: number;
  roughness: number; // 0: 깨끗함, 100: 고서화/인주 번짐 질감
  size: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  spec?: string;
  qty: number;
  price: number;
  amount: number;
  note?: string;
}

export interface InvoiceForm {
  title: string; // 견적서 / 거래명세서 / 간이영수증 / 청구서
  docNumber: string;
  issueDate: string;
  supplierName: string;
  supplierBizNo: string;
  supplierCeo: string;
  supplierAddr: string;
  supplierTel: string;
  customerName: string;
  items: InvoiceItem[];
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  remarks: string;
  stampDataUrl?: string;
}
