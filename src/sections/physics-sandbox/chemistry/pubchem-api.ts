import type { MoleculePreset, PubChemPropertyResult } from './molecule-types';

// 자주 검색되는 한글 화합물명의 영문 매핑 사전
const KO_TO_EN_DICTIONARY: Record<string, string> = {
  아스피린: 'aspirin',
  타이레놀: 'acetaminophen',
  아세트아미노펜: 'acetaminophen',
  부루펜: 'ibuprofen',
  이부프로펜: 'ibuprofen',
  카페인: 'caffeine',
  도파민: 'dopamine',
  세로토닌: 'serotonin',
  아드레날린: 'epinephrine',
  에피네프린: 'epinephrine',
  멜라토닌: 'melatonin',
  캡사이신: 'capsaicin',
  멘톨: 'menthol',
  바닐린: 'vanillin',
  니코틴: 'nicotine',
  테오브로민: 'theobromine',
  모르핀: 'morphine',
  헤로인: 'heroin',
  코카인: 'cocaine',
  페니실린: 'penicillin',
  아목시실린: 'amoxicillin',
  인슐린: 'insulin',
  포도당: 'glucose',
  글루코스: 'glucose',
  과당: 'fructose',
  설탕: 'sucrose',
  수크로스: 'sucrose',
  에탄올: 'ethanol',
  메탄올: 'methanol',
  아세톤: 'acetone',
  구연산: 'citric acid',
  시트르산: 'citric acid',
  비타민c: 'ascorbic acid',
  비타민a: 'retinol',
  비타민d: 'cholecalciferol',
  비타민e: 'tocopherol',
  콜레스테롤: 'cholesterol',
  테스토스테론: 'testosterone',
  에스트로겐: 'estradiol',
  히스타민: 'histamine',
  프로포폴: 'propofol',
  로라제팜: 'lorazepam',
  디아제팜: 'diazepam',
  오메가3: 'eicosapentaenoic acid',
  타우린: 'taurine',
  글루탐산: 'glutamic acid',
  글리신: 'glycine',
};

// 추천/연속 탐색용 유명 화합물 CID 목록
export const CURATED_EXPLORATION_CIDS: number[] = [
  5288826, // Capsaicin
  5462224, // Curcumin (강황 성분)
  5280863, // Quercetin (양파 항산화제)
  446157, // Resveratrol (포도주 항산화제)
  135398745, // Remdesivir
  3386, // Fluoxetine (프로작 항우울제)
  2162, // Ampicillin (광범위 항생제)
  5284616, // Paclitaxel (항암제 택솔)
  60823, // Atorvastatin (리피토 고지혈증약)
  3033, // Dexamethasone (스테로이드 소염제)
  36314, // Sildenafil (비아그라)
  38267, // Omeprazole (위산억제제)
  4173, // Metformin (당뇨병 1차 치료제)
  2336, // Atropine (동공 확장제)
  5284503, // Cannabidiol (CBD)
  16078, // Tetrahydrocannabinol (THC)
  5284592, // Morphine (진통 마약)
  5870, // Codeine
  3676, // Indomethacin
  5362, // Tramadol
  3345, // Fentanyl
  2723601, // L-Theanine (녹차 진정 성분)
  5280443, // Apigenin (카모마일 성분)
  5280445, // Luteolin
  5280805, // Genistein (콩 이소플라본)
  72276, // Coenzyme Q10 (유비퀴논)
  5280343, // Epigallocatechin gallate (EGCG 녹차 카테킨)
  123036, // Hyaluronic Acid monomer
  2879, // Chlorophyllin
  5280489, // Kaempferol
  107970, // Glucosamine
  6288, // Valproic acid
  2249, // Atenolol
  3949, // Losartan
  2157, // Amlodipine
  2726, // Cimetidine
  4091, // Meloxicam
  2895, // Clonazepam
  5311, // Zolpidem
  3784, // Ketamine
  5743, // D-Limonene
  2537, // Camphor (장뇌)
  6549, // Eugenol (정향유 향료)
  8842, // Cinnamaldehyde (계피향)
  3283, // Ephedrine
  7738, // Piperine (후추 매운맛)
  1549025, // Gingerol (생강 성분)
  5281515, // Allicin (마늘 항균 성분)
];

/**
 * PubChem 2D 구조 다이어그램 이미지 URL 생성
 */
export const getPubChem2DImageUrl = (cid: number): string =>
  `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d&image_size=large`;

/**
 * 화학식 문자열(예: "C8H10N4O2", "H2O")을 파싱하여 원소 구성비 Map으로 반환
 */
export const parseFormulaToElementCounts = (formula: string): Record<string, number> => {
  const counts: Record<string, number> = {};
  if (!formula) return counts;

  const cleanFormula = formula
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .replace(/[·•\s]/g, '');

  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanFormula)) !== null) {
    if (match[1]) {
      const symbol = match[1];
      const count = match[2] ? parseInt(match[2], 10) : 1;
      counts[symbol] = (counts[symbol] || 0) + count;
    }
  }

  return counts;
};

/**
 * PubChem PUG REST API: CID로 상세 정보 조회
 */
export const fetchPubChemByCID = async (
  cid: number | string
): Promise<PubChemPropertyResult | null> => {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,Title,CanonicalSMILES/JSON`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const props = json.PropertyTable?.Properties?.[0];
    return props || null;
  } catch (err) {
    console.error('fetchPubChemByCID error:', err);
    return null;
  }
};

/**
 * PubChem PUG REST API: 이름/화학식/CID로 검색하여 목록 또는 단일 결과 조회
 */
export const searchPubChemCompound = async (query: string): Promise<PubChemPropertyResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (/^\d+$/.test(trimmed)) {
    const direct = await fetchPubChemByCID(parseInt(trimmed, 10));
    return direct ? [direct] : [];
  }

  const lower = trimmed.toLowerCase();
  const searchName = KO_TO_EN_DICTIONARY[lower] || trimmed;

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
      searchName
    )}/property/MolecularFormula,MolecularWeight,IUPACName,Title,CanonicalSMILES/JSON`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      const props = json.PropertyTable?.Properties;
      if (Array.isArray(props) && props.length > 0) {
        return props.slice(0, 5);
      }
    }
  } catch (err) {
    console.warn('searchPubChemCompound by name failed, trying fallback...', err);
  }

  try {
    const fastUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${encodeURIComponent(
      searchName
    )}/cids/JSON?MaxRecords=5`;
    const fastRes = await fetch(fastUrl);
    if (fastRes.ok) {
      const json = await fastRes.json();
      const cids: number[] = json.IdentifierList?.CID || [];
      if (cids.length > 0) {
        const results: PubChemPropertyResult[] = [];
        for (const cid of cids.slice(0, 3)) {
          const item = await fetchPubChemByCID(cid);
          if (item) results.push(item);
        }
        return results;
      }
    }
  } catch (err) {
    console.error('fastsearch fallback failed:', err);
  }

  return [];
};

/**
 * PubChem View API: 분자 설명 및 개요 조회
 */
export const fetchPubChemDescription = async (cid: number): Promise<string> => {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Description`;
    const res = await fetch(url);
    if (!res.ok) return 'PubChem 데이터베이스에서 등록된 유효한 화합물 분자입니다.';
    const json = await res.json();

    interface PubChemSubSection {
      TOCHeading?: string;
      Information?: { Value?: { StringWithMarkup?: { String?: string }[] } }[];
      Section?: PubChemSubSection[];
    }

    const sections = json.Record?.Section as PubChemSubSection[] | undefined;
    if (Array.isArray(sections)) {
      for (const s of sections) {
        const descSec =
          s.Section?.find((sub: PubChemSubSection) => sub.TOCHeading === 'Description') || s;
        const info = descSec.Information?.[0]?.Value?.StringWithMarkup?.[0]?.String;
        if (info && typeof info === 'string') {
          return info.length > 300 ? `${info.slice(0, 297)}...` : info;
        }
      }
    }
  } catch {
    // ignore
  }
  return 'PubChem 데이터베이스에서 등록된 유효한 화합물 분자입니다.';
};

/**
 * PubChem API 결과를 앱 내부 MoleculePreset 구조로 변환
 */
export const convertPubChemToPreset = async (
  prop: PubChemPropertyResult,
  customNameKo?: string
): Promise<MoleculePreset> => {
  const mw =
    typeof prop.MolecularWeight === 'number'
      ? prop.MolecularWeight
      : parseFloat(prop.MolecularWeight || '0') || 0;

  const formula = prop.MolecularFormula || 'Unknown';
  const elementCounts = parseFormulaToElementCounts(formula);
  const totalAtoms = Object.values(elementCounts).reduce((a, b) => a + b, 0);

  let difficulty: '초급' | '중급' | '고급' = '중급';
  let xp = 40;
  if (totalAtoms <= 4 && mw < 50) {
    difficulty = '초급';
    xp = 20;
  } else if (totalAtoms > 15 || mw > 200) {
    difficulty = '고급';
    xp = 80;
  }

  const description = await fetchPubChemDescription(prop.CID);
  const title = prop.Title || prop.IUPACName || `Compound ${prop.CID}`;
  const nameKo = customNameKo || title;

  return {
    id: `pubchem_${prop.CID}`,
    formula,
    nameKo,
    nameEn: title,
    molecularWeight: Math.round(mw * 1000) / 1000,
    description,
    category: 'PubChem 추가',
    difficulty,
    xp,
    elementCounts,
    bondsSummary: prop.IUPACName ? `IUPAC: ${prop.IUPACName}` : '공유 및 이온 결합 복합체',
    smiles: prop.CanonicalSMILES,
    realLifeUsage: 'PubChem 오픈 화학 데이터베이스 연동 화합물',
    cid: prop.CID,
    isCustom: true,
    addedAt: Date.now(),
  };
};

/**
 * 새로운 분자를 PubChem에서 자동으로 가져오기
 */
export const fetchNextPubChemBatch = async (
  existingCids: number[],
  count: number = 5
): Promise<MoleculePreset[]> => {
  const availableCids = CURATED_EXPLORATION_CIDS.filter((cid) => !existingCids.includes(cid));
  const selectedCids = availableCids.slice(0, count);

  while (selectedCids.length < count) {
    const randomCid = Math.floor(Math.random() * 4000) + 100;
    if (!existingCids.includes(randomCid) && !selectedCids.includes(randomCid)) {
      selectedCids.push(randomCid);
    }
  }

  const results: MoleculePreset[] = [];
  for (const cid of selectedCids) {
    try {
      const prop = await fetchPubChemByCID(cid);
      if (prop && prop.MolecularFormula) {
        const preset = await convertPubChemToPreset(prop);
        results.push(preset);
      }
    } catch (err) {
      console.warn(`Failed to fetch CID ${cid}`, err);
    }
  }

  return results;
};
