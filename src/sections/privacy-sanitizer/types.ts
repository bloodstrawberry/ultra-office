export type PrivacyItemType =
  | 'rrn' // 주민등록번호 (900101-1234567 -> 900101-1******)
  | 'phone' // 휴대폰/전화번호 (010-1234-5678 -> 010-****-5678)
  | 'email' // 이메일 주소 (hong@example.com -> h***@example.com)
  | 'account' // 계좌번호
  | 'card' // 신용카드 번호 (1234-5678-9012-3456 -> 1234-****-****-3456)
  | 'biz_no'; // 사업자등록번호

export interface DetectedPrivacyItem {
  type: PrivacyItemType;
  label: string;
  original: string;
  masked: string;
  count: number;
}

export interface ExifReport {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  gpsCoordinates?: string;
  dateTime?: string;
  cameraModel?: string;
  software?: string;
  rawExifFound: boolean;
}

export interface RedactBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mode: 'blackout' | 'blur';
}
