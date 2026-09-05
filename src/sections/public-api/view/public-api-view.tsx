'use client';

import type {
  ProxyMode,
  ApiPreset,
  HttpMethod,
  PublicApiItem,
  KeyValueParam,
  ApiResponseData,
  ApiRequestConfig,
  HealthCheckResult,
} from '../types';

import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import HealthAndSafetyRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { API_PRESETS, ALL_CATEGORIES, ALL_PUBLIC_APIS } from '../data/public-apis-data';
import {
  generateCurl,
  generateAxios,
  generateFetch,
  generatePython,
  executeApiRequest,
  jsonToTypeScriptInterface,
} from '../utils/api-tester-utils';

// ----------------------------------------------------------------------
// Constants & Helper Helpers
// ----------------------------------------------------------------------

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
  HEAD: '#6b7280',
};

const ITEMS_PER_PAGE = 25;

export function PublicApiView() {
  // Hydration safety
  const [hasLoaded, setHasLoaded] = useState(false);

  // Resizable Split Pane State
  const [splitWidth, setSplitWidth] = useState<number>(450);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(450);

  // Catalog Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'korea' | 'global' | 'favorites'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [authFilter, setAuthFilter] = useState<'all' | 'no-auth' | 'apiKey' | 'OAuth'>('all');
  const [corsFilter, setCorsFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Request Configuration State
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('https://dog.ceo/api/breeds/image/random');
  const [params, setParams] = useState<KeyValueParam[]>([]);
  const [headers, setHeaders] = useState<KeyValueParam[]>([
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState<string>('');
  const [proxyMode, setProxyMode] = useState<ProxyMode>('direct');
  const [customProxyUrl, setCustomProxyUrl] = useState<string>('');
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'code'>(
    'params'
  );

  // Response & Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [activeRespTab, setActiveRespTab] = useState<'json' | 'raw' | 'headers' | 'preview' | 'ts'>(
    'json'
  );
  const [codeFormat, setCodeFormat] = useState<'curl' | 'fetch' | 'axios' | 'python'>('curl');

  // Auth Helper State
  const [authHelperType, setAuthHelperType] = useState<'apiKeyParam' | 'apiKeyHeader' | 'bearer'>(
    'apiKeyParam'
  );
  const [authHelperKey, setAuthHelperKey] = useState<string>('serviceKey');
  const [authHelperVal, setAuthHelperVal] = useState<string>('');

  // Batch Health Check Dialog State
  const [isHealthCheckOpen, setIsHealthCheckOpen] = useState<boolean>(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [healthCheckProgress, setHealthCheckProgress] = useState<number>(0);
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);

  // Currently loaded API
  const [currentSelectedApi, setCurrentSelectedApi] = useState<PublicApiItem | null>(null);

  // Load saved favorites & initial setup
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('ultra_office_public_api_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch {
      // ignore
    }
    setHasLoaded(true);
  }, []);

  // Save favorites to storage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem('ultra_office_public_api_favorites', JSON.stringify(favorites));
    }
  }, [favorites, hasLoaded]);

  // Toggle favorite
  const handleToggleFavorite = useCallback((apiId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(apiId);
      if (exists) {
        toast.info('즐겨찾기에서 제거되었습니다.');
        return prev.filter((id) => id !== apiId);
      }
      toast.success('즐겨찾기에 추가되었습니다.');
      return [...prev, apiId];
    });
  }, []);

  // Resizer Event Handlers
  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = splitWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(340, Math.min(800, resizeStartWidthRef.current + deltaX));
    setSplitWidth(newWidth);
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string = '복사되었습니다.') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  // Filtered APIs calculation
  const filteredApis = useMemo(
    () =>
      ALL_PUBLIC_APIS.filter((item) => {
        // Region Filter
        if (regionFilter === 'korea' && item.source !== 'korea') return false;
        if (regionFilter === 'global' && item.source !== 'global') return false;
        if (regionFilter === 'favorites' && !favorites.includes(item.id)) return false;

        // Category Filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Auth Filter
        if (authFilter === 'no-auth') {
          const isNo = item.auth.toLowerCase().includes('no') || item.auth.trim() === '';
          if (!isNo) return false;
        } else if (authFilter === 'apiKey') {
          if (!item.auth.toLowerCase().includes('apikey')) return false;
        } else if (authFilter === 'OAuth') {
          if (!item.auth.toLowerCase().includes('oauth')) return false;
        }

        // CORS Filter
        if (corsFilter === 'yes' && item.cors.toLowerCase() !== 'yes') return false;
        if (corsFilter === 'no' && item.cors.toLowerCase() === 'yes') return false;

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const matchesName = item.name.toLowerCase().includes(query);
          const matchesDesc = item.description.toLowerCase().includes(query);
          const matchesCategory = item.category.toLowerCase().includes(query);
          const matchesUrl = item.url.toLowerCase().includes(query);
          return matchesName || matchesDesc || matchesCategory || matchesUrl;
        }

        return true;
      }),
    [regionFilter, selectedCategory, authFilter, corsFilter, searchQuery, favorites]
  );

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [regionFilter, selectedCategory, authFilter, corsFilter, searchQuery]);

  // Paginated List
  const totalPages = Math.ceil(filteredApis.length / ITEMS_PER_PAGE) || 1;
  const paginatedApis = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApis.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApis, currentPage]);

  // Load Preset into Workbench
  const handleLoadPreset = (preset: ApiPreset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setParams(JSON.parse(JSON.stringify(preset.params)));
    setHeaders(JSON.parse(JSON.stringify(preset.headers)));
    setBody(preset.body || '');
    setCurrentSelectedApi(null);
    toast.success(`"${preset.title}" 프리셋을 워크벤치에 로드했습니다.`);
  };

  // Load Selected Catalog API into Workbench
  const handleLoadApi = (item: PublicApiItem) => {
    setCurrentSelectedApi(item);
    setMethod('GET');
    setUrl(item.url);

    // Starter headers based on auth
    const starterHeaders: KeyValueParam[] = [
      { key: 'Accept', value: 'application/json', enabled: true },
    ];
    const starterParams: KeyValueParam[] = [];

    if (item.auth.toLowerCase().includes('apikey')) {
      if (item.source === 'korea') {
        starterParams.push({ key: 'serviceKey', value: 'YOUR_API_KEY_HERE', enabled: true });
      } else {
        starterHeaders.push({
          key: 'Authorization',
          value: 'Bearer YOUR_API_KEY_HERE',
          enabled: true,
        });
      }
    }

    setHeaders(starterHeaders);
    setParams(starterParams);
    setBody('');

    // If known CORS issue, pre-suggest proxy
    if (item.cors.toLowerCase() === 'no') {
      setProxyMode('corsproxy');
      toast.info(
        `"${item.name}"은(는) CORS 미지원 API이므로 CORS 프록시 모드가 자동으로 적용되었습니다.`
      );
    } else {
      setProxyMode('direct');
      toast.success(`"${item.name}" 엔드포인트를 워크벤치에 로드했습니다.`);
    }
  };

  // Parameter manipulation helpers
  const handleAddParam = () => {
    setParams((prev) => [...prev, { key: '', value: '', enabled: true }]);
  };

  const handleUpdateParam = (
    index: number,
    field: keyof KeyValueParam,
    value: string | boolean
  ) => {
    setParams((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteParam = (index: number) => {
    setParams((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Header manipulation helpers
  const handleAddHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '', enabled: true }]);
  };

  const handleUpdateHeader = (
    index: number,
    field: keyof KeyValueParam,
    value: string | boolean
  ) => {
    setHeaders((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Apply Auth Helper
  const handleApplyAuth = () => {
    if (!authHelperVal.trim()) {
      toast.error('API Key / Token 값을 입력해 주세요.');
      return;
    }

    if (authHelperType === 'apiKeyParam') {
      const keyName = authHelperKey.trim() || 'serviceKey';
      setParams((prev) => {
        const filtered = prev.filter((p) => p.key !== keyName);
        return [...filtered, { key: keyName, value: authHelperVal.trim(), enabled: true }];
      });
      toast.success(`쿼리 파라미터 "${keyName}"에 키가 적용되었습니다.`);
      setActiveReqTab('params');
    } else if (authHelperType === 'apiKeyHeader') {
      const headerName = authHelperKey.trim() || 'X-API-KEY';
      setHeaders((prev) => {
        const filtered = prev.filter((h) => h.key !== headerName);
        return [...filtered, { key: headerName, value: authHelperVal.trim(), enabled: true }];
      });
      toast.success(`헤더 "${headerName}"에 키가 적용되었습니다.`);
      setActiveReqTab('headers');
    } else if (authHelperType === 'bearer') {
      setHeaders((prev) => {
        const filtered = prev.filter((h) => h.key.toLowerCase() !== 'authorization');
        return [
          ...filtered,
          { key: 'Authorization', value: `Bearer ${authHelperVal.trim()}`, enabled: true },
        ];
      });
      toast.success('Authorization 헤더에 Bearer 토큰이 적용되었습니다.');
      setActiveReqTab('headers');
    }
  };

  // Current request configuration
  const currentReqConfig: ApiRequestConfig = useMemo(
    () => ({
      method,
      url,
      params,
      headers,
      body,
      proxyMode,
      customProxyUrl,
    }),
    [method, url, params, headers, body, proxyMode, customProxyUrl]
  );

  // Send API Request
  const handleSendRequest = async () => {
    if (!url.trim()) {
      toast.error('요청할 API URL을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await executeApiRequest(currentReqConfig);
      setResponse(res);

      if (res.status >= 200 && res.status < 300) {
        toast.success(`요청 성공: ${res.status} ${res.statusText} (${res.timeMs}ms)`);
        if (res.isImage) {
          setActiveRespTab('preview');
        } else {
          setActiveRespTab('json');
        }
      } else if (res.status === 0) {
        toast.error('네트워크/CORS 오류가 발생했습니다. 상단 CORS 프록시를 켜보세요.');
      } else {
        toast.warning(`응답 상태: ${res.status} ${res.statusText} (${res.timeMs}ms)`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`요청 실패: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Shortcut key (Ctrl/Cmd + Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendRequest();
    }
  };

  // Format JSON Body
  const handleFormatJsonBody = () => {
    if (!body.trim()) return;
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
      toast.success('JSON 본문이 예쁘게 정렬되었습니다.');
    } catch {
      toast.error('유효한 JSON 형식이 아닙니다.');
    }
  };

  // Download Response JSON
  const handleDownloadResponse = () => {
    if (!response || !response.rawText) return;
    const blob = new Blob([response.rawText], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `api_response_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    toast.success('응답 데이터가 JSON 파일로 다운로드되었습니다.');
  };

  // Generated TypeScript code
  const generatedTsCode = useMemo(() => {
    if (!response || !response.data) return '';
    return jsonToTypeScriptInterface(response.data, 'ApiResponse');
  }, [response]);

  // Code snippet based on format
  const generatedCodeSnippet = useMemo(() => {
    switch (codeFormat) {
      case 'curl':
        return generateCurl(currentReqConfig);
      case 'fetch':
        return generateFetch(currentReqConfig);
      case 'axios':
        return generateAxios(currentReqConfig);
      case 'python':
        return generatePython(currentReqConfig);
      default:
        return '';
    }
  }, [codeFormat, currentReqConfig]);

  // Batch Health Checker
  const handleStartHealthCheck = async () => {
    const targets = filteredApis.slice(0, 30); // Test first 30 in current filter
    if (targets.length === 0) {
      toast.warning('테스트할 API 항목이 없습니다.');
      return;
    }

    setIsCheckingHealth(true);
    setHealthCheckProgress(0);
    const results: HealthCheckResult[] = [];

    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const start = performance.now();
      try {
        const testRes = await executeApiRequest({
          method: 'GET',
          url: target.url,
          params: [],
          headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
          body: '',
          proxyMode: target.cors.toLowerCase() === 'no' ? 'corsproxy' : 'direct',
          customProxyUrl: '',
        });
        const elapsed = Math.round(performance.now() - start);
        results.push({
          id: target.id,
          name: target.name,
          url: target.url,
          category: target.category,
          status: testRes.status,
          timeMs: elapsed,
          isOk: testRes.status >= 200 && testRes.status < 400,
          error: testRes.error,
        });
      } catch (err: unknown) {
        const elapsed = Math.round(performance.now() - start);
        results.push({
          id: target.id,
          name: target.name,
          url: target.url,
          category: target.category,
          status: 0,
          timeMs: elapsed,
          isOk: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      setHealthCheckProgress(Math.round(((i + 1) / targets.length) * 100));
      setHealthCheckResults([...results]);
    }

    setIsCheckingHealth(false);
    toast.success(`총 ${targets.length}개 API 헬스체크가 완료되었습니다.`);
  };

  // Early hydration return
  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
        >
          <CircularProgress size={40} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 2.5 },
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Top Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <PublicRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Public API 탐색기 & 실시간 테스터
            </Typography>
            <Chip
              label="총 1,791개 API"
              size="small"
              color="primary"
              sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
            />
            <Chip
              label="KR 300 / Global 1,491"
              size="small"
              variant="outlined"
              color="info"
              sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            한국 공공데이터포털 및 글로벌 공개 API 전체 데이터베이스를 즉시 검색하고 브라우저에서
            직접 실시간 요청 및 응답을 테스트하세요.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<HealthAndSafetyRoundedIcon />}
            onClick={() => {
              setIsHealthCheckOpen(true);
              if (healthCheckResults.length === 0) {
                handleStartHealthCheck();
              }
            }}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            연결 헬스체크 (Ping)
          </Button>
        </Box>
      </Box>

      {/* 1-Click Working Presets Bar */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AutoFixHighRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
            즉시 실행 가능한 추천 프리셋 (1-Click Run)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            클릭 즉시 워크벤치에 파라미터가 자동 세팅됩니다.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
          }}
        >
          {API_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.title}
              onClick={() => handleLoadPreset(preset)}
              clickable
              color={preset.badgeColor || 'default'}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Split Layout: Left Catalog + Resizer + Right Workbench */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'row',
          gap: 0,
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {/* ================================================================ */}
        {/* LEFT PANEL: API Catalog & Filters                                */}
        {/* ================================================================ */}
        <Box
          sx={{
            width: { xs: '100%', md: `${splitWidth}px` },
            minWidth: 320,
            maxWidth: { xs: '100%', md: 800 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: 0,
          }}
        >
          {/* Catalog Filter Header */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            {/* Search Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="API 이름, 설명, URL 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ mb: 1.25, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            {/* Region Tabs */}
            <ToggleButtonGroup
              value={regionFilter}
              exclusive
              onChange={(_, val) => val && setRegionFilter(val)}
              size="small"
              fullWidth
              sx={{
                mb: 1.25,
                '& .MuiToggleButton-root': { py: 0.5, fontSize: '0.75rem', fontWeight: 700 },
              }}
            >
              <ToggleButton value="all">전체 ({ALL_PUBLIC_APIS.length})</ToggleButton>
              <ToggleButton value="korea">🇰🇷 한국 (300)</ToggleButton>
              <ToggleButton value="global">🌍 글로벌 (1,491)</ToggleButton>
              <ToggleButton value="favorites">⭐ 즐겨찾기 ({favorites.length})</ToggleButton>
            </ToggleButtonGroup>

            {/* Dropdown Filters (Category & Auth & CORS) */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>카테고리</InputLabel>
                <Select
                  value={selectedCategory}
                  label="카테고리"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  <MenuItem value="all">전체 카테고리 ({ALL_CATEGORIES.length}개)</MenuItem>
                  {ALL_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat} sx={{ fontSize: '0.75rem' }}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: 110 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>인증</InputLabel>
                <Select
                  value={authFilter}
                  label="인증"
                  onChange={(e) => setAuthFilter(e.target.value as any)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="no-auth">인증 불필요</MenuItem>
                  <MenuItem value="apiKey">API Key</MenuItem>
                  <MenuItem value="OAuth">OAuth</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: 95 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>CORS</InputLabel>
                <Select
                  value={corsFilter}
                  label="CORS"
                  onChange={(e) => setCorsFilter(e.target.value as any)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="yes">지원</MenuItem>
                  <MenuItem value="no">미지원</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Catalog List */}
          <Box sx={{ flex: '1 1 auto', overflowY: 'auto', p: 1.25, minHeight: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                px: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                검색 결과: 총 {filteredApis.length}개 API
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                페이지 {currentPage} / {totalPages}
              </Typography>
            </Box>

            {paginatedApis.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  조건에 일치하는 API가 없습니다.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setRegionFilter('all');
                    setSelectedCategory('all');
                    setAuthFilter('all');
                    setCorsFilter('all');
                  }}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  필터 초기화
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {paginatedApis.map((item) => {
                  const isFav = favorites.includes(item.id);
                  const isSelected = currentSelectedApi?.id === item.id;
                  const isNoAuth =
                    item.auth.toLowerCase().includes('no') || item.auth.trim() === '';

                  return (
                    <Card
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                        transition: 'all 0.15s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.light',
                          boxShadow: 1,
                        },
                      }}
                    >
                      {/* Card Header: Title & Badges & Fav */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              color: 'text.primary',
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.source === 'korea' ? '🇰🇷 KR' : '🌍 Global'}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              borderColor: item.source === 'korea' ? 'info.main' : 'text.disabled',
                              color: item.source === 'korea' ? 'info.main' : 'text.secondary',
                            }}
                          />
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: 'action.hover',
                            }}
                          />
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => handleToggleFavorite(item.id)}
                          sx={{ p: 0.25 }}
                        >
                          {isFav ? (
                            <StarRoundedIcon sx={{ fontSize: 18, color: '#eab308' }} />
                          ) : (
                            <StarOutlineRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                          )}
                        </IconButton>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          mb: 1,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </Typography>

                      {/* Card Footer: Metadata badges + Actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          pt: 0.75,
                          borderTop: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <Chip
                            label={isNoAuth ? '무료/인증없음' : `인증: ${item.auth}`}
                            size="small"
                            color={isNoAuth ? 'success' : 'warning'}
                            variant="soft"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                          {item.cors !== 'Unknown' && (
                            <Chip
                              label={`CORS: ${item.cors}`}
                              size="small"
                              color={item.cors.toLowerCase() === 'yes' ? 'primary' : 'default'}
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <Tooltip title="공식 문서 / 포털 방문">
                            <IconButton
                              size="small"
                              component="a"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ p: 0.5 }}
                            >
                              <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>

                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => handleLoadApi(item)}
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              borderRadius: 1.5,
                              px: 1,
                            }}
                          >
                            테스터 로드
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <Box
              sx={{
                p: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                size="small"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>

        {/* Resizer Divider */}
        <Box
          onPointerDown={handleDividerPointerDown}
          onPointerMove={handleDividerPointerMove}
          onPointerUp={handleDividerPointerUp}
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: 8,
            cursor: 'col-resize',
            bgcolor: 'action.hover',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            userSelect: 'none',
            touchAction: 'none',
            '&:hover': { bgcolor: 'primary.main', opacity: 0.5 },
          }}
        >
          <Box sx={{ width: 2, height: 28, bgcolor: 'text.disabled', borderRadius: 1 }} />
        </Box>

        {/* ================================================================ */}
        {/* RIGHT PANEL: Live Interactive Workbench & Response Inspector     */}
        {/* ================================================================ */}
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.neutral',
            minHeight: 0,
          }}
        >
          {/* Top Bar: Method + URL + Send + Proxy Mode */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              {/* Method Selector */}
              <FormControl size="small" sx={{ width: 110, flexShrink: 0 }}>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 800,
                    color: METHOD_COLORS[method],
                    '& .MuiSelect-select': { py: 1 },
                  }}
                >
                  {HTTP_METHODS.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontWeight: 800, color: METHOD_COLORS[m] }}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* URL Input */}
              <TextField
                fullWidth
                size="small"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  },
                }}
              />

              {/* Send Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendRequest}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendRoundedIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  px: 2.5,
                  flexShrink: 0,
                  height: 40,
                  fontWeight: 800,
                  borderRadius: 1.5,
                }}
              >
                {isLoading ? '요청 중...' : '요청 전송'}
              </Button>
            </Box>

            {/* Sub-bar: Proxy Mode & Effective URL Preview */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  CORS 프록시 설정:
                </Typography>
                <ToggleButtonGroup
                  value={proxyMode}
                  exclusive
                  onChange={(_, val) => val && setProxyMode(val)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      py: 0.25,
                      px: 1,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: 1,
                    },
                  }}
                >
                  <ToggleButton value="direct">직접 호출 (Direct)</ToggleButton>
                  <ToggleButton value="corsproxy">CORS Proxy 1</ToggleButton>
                  <ToggleButton value="allorigins">CORS Proxy 2</ToggleButton>
                  <ToggleButton value="custom">커스텀 프록시</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                단축키:{' '}
                <kbd
                  style={{
                    padding: '2px 4px',
                    borderRadius: 4,
                    background: '#e2e8f0',
                    color: '#334155',
                  }}
                >
                  Ctrl + Enter
                </kbd>
              </Typography>
            </Box>

            {/* Custom proxy input if selected */}
            {proxyMode === 'custom' && (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="https://my-proxy.com/?url={{url}}"
                  value={customProxyUrl}
                  onChange={(e) => setCustomProxyUrl(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.75rem' } }}
                />
              </Box>
            )}
          </Box>

          {/* Request Configuration Section */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            {/* Request Tabs Header */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Tabs
                value={activeReqTab}
                onChange={(_, val) => setActiveReqTab(val)}
                sx={{
                  minHeight: 34,
                  '& .MuiTab-root': {
                    minHeight: 34,
                    py: 0.5,
                    px: 1.5,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  },
                }}
              >
                <Tab label={`Params (${params.filter((p) => p.enabled).length})`} value="params" />
                <Tab
                  label={`Headers (${headers.filter((h) => h.enabled).length})`}
                  value="headers"
                />
                <Tab label="Body" value="body" />
                <Tab label="인증 헬퍼 (Auth)" value="auth" />
                <Tab label="코드 생성 (Code)" value="code" />
              </Tabs>

              {activeReqTab === 'params' && (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddParam}
                  sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                >
                  파라미터 추가
                </Button>
              )}
              {activeReqTab === 'headers' && (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddHeader}
                  sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                >
                  헤더 추가
                </Button>
              )}
              {activeReqTab === 'body' && (
                <Button
                  size="small"
                  startIcon={<AutoFixHighRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleFormatJsonBody}
                  sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                >
                  JSON 정렬
                </Button>
              )}
            </Box>

            {/* Request Tab 1: Params Key-Value Table */}
            {activeReqTab === 'params' && (
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {params.length === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', p: 1 }}
                  >
                    설정된 쿼리 파라미터가 없습니다. 우측 &quot;파라미터 추가&quot; 버튼을 눌러
                    추가하세요.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" sx={{ width: 40 }} />
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                            Key (파라미터명)
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                            Value (값)
                          </TableCell>
                          <TableCell align="right" sx={{ width: 40 }} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {params.map((param, idx) => (
                          <TableRow key={idx}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={param.enabled}
                                onChange={(e) =>
                                  handleUpdateParam(idx, 'enabled', e.target.checked)
                                }
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="예: pageNo, query"
                                value={param.key}
                                onChange={(e) => handleUpdateParam(idx, 'key', e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="값 입력..."
                                value={param.value}
                                onChange={(e) => handleUpdateParam(idx, 'value', e.target.value)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 0.5 }}>
                              <IconButton size="small" onClick={() => handleDeleteParam(idx)}>
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Request Tab 2: Headers Key-Value Table */}
            {activeReqTab === 'headers' && (
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ width: 40 }} />
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                          Header Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                          Header Value
                        </TableCell>
                        <TableCell align="right" sx={{ width: 40 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {headers.map((hdr, idx) => (
                        <TableRow key={idx}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={hdr.enabled}
                              onChange={(e) => handleUpdateHeader(idx, 'enabled', e.target.checked)}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="예: Authorization, Content-Type"
                              value={hdr.key}
                              onChange={(e) => handleUpdateHeader(idx, 'key', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="헤더 값..."
                              value={hdr.value}
                              onChange={(e) => handleUpdateHeader(idx, 'value', e.target.value)}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 0.5 }}>
                            <IconButton size="small" onClick={() => handleDeleteHeader(idx)}>
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Request Tab 3: Body Editor */}
            {activeReqTab === 'body' && (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={6}
                  placeholder='{\n  "key": "value"\n}'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    },
                  }}
                />
              </Box>
            )}

            {/* Request Tab 4: Auth Helper */}
            {activeReqTab === 'auth' && (
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, width: 90 }}>
                    인증 방식:
                  </Typography>
                  <ToggleButtonGroup
                    value={authHelperType}
                    exclusive
                    onChange={(_, val) => val && setAuthHelperType(val)}
                    size="small"
                  >
                    <ToggleButton value="apiKeyParam" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Query Param (공공데이터)
                    </ToggleButton>
                    <ToggleButton value="apiKeyHeader" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Header API Key (네이버/기타)
                    </ToggleButton>
                    <ToggleButton value="bearer" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Bearer Token (카카오/OAuth)
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {authHelperType !== 'bearer' && (
                    <TextField
                      size="small"
                      label="키 이름 (Key Name)"
                      value={authHelperKey}
                      onChange={(e) => setAuthHelperKey(e.target.value)}
                      sx={{ width: 180, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  )}
                  <TextField
                    fullWidth
                    size="small"
                    label={
                      authHelperType === 'bearer'
                        ? 'Bearer 토큰 값'
                        : '발급받은 API Key / ServiceKey'
                    }
                    value={authHelperVal}
                    onChange={(e) => setAuthHelperVal(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyAuth}
                    sx={{ flexShrink: 0, fontWeight: 700, borderRadius: 1 }}
                  >
                    주입 & 적용
                  </Button>
                </Box>
              </Box>
            )}

            {/* Request Tab 5: Code Export */}
            {activeReqTab === 'code' && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <ToggleButtonGroup
                    value={codeFormat}
                    exclusive
                    onChange={(_, val) => val && setCodeFormat(val)}
                    size="small"
                  >
                    <ToggleButton value="curl" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      cURL
                    </ToggleButton>
                    <ToggleButton value="fetch" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Fetch (TS/JS)
                    </ToggleButton>
                    <ToggleButton value="axios" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Axios
                    </ToggleButton>
                    <ToggleButton value="python" sx={{ fontSize: '0.72rem', py: 0.25 }}>
                      Python
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    size="small"
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={() =>
                      copyToClipboard(generatedCodeSnippet, '코드가 클립보드에 복사되었습니다.')
                    }
                    sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    코드 복사
                  </Button>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: '#1e293b',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                    maxHeight: 140,
                  }}
                >
                  {generatedCodeSnippet}
                </Box>
              </Box>
            )}
          </Box>

          {/* Response Inspector Section */}
          <Box
            sx={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              p: 1.5,
            }}
          >
            {/* Response Status Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  응답 결과 (Response)
                </Typography>

                {response ? (
                  <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                    <Chip
                      label={`${response.status} ${response.statusText}`}
                      size="small"
                      color={
                        response.status >= 200 && response.status < 300
                          ? 'success'
                          : response.status >= 400
                            ? 'error'
                            : 'warning'
                      }
                      sx={{ fontWeight: 800, height: 22 }}
                    />
                    <Chip
                      icon={<SpeedRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${response.timeMs} ms`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 22 }}
                    />
                    <Chip
                      label={`${(response.sizeBytes / 1024).toFixed(1)} KB`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 22 }}
                    />
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    요청을 전송하면 응답이 이곳에 표시됩니다.
                  </Typography>
                )}
              </Box>

              {response && (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={() => copyToClipboard(response.rawText, '응답 본문이 복사되었습니다.')}
                    sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    JSON 복사
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CloudDownloadRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={handleDownloadResponse}
                    sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    다운로드
                  </Button>
                </Box>
              )}
            </Box>

            {/* Response Viewer Tabs */}
            {response && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1, flexShrink: 0 }}>
                <Tabs
                  value={activeRespTab}
                  onChange={(_, val) => setActiveRespTab(val)}
                  sx={{
                    minHeight: 32,
                    '& .MuiTab-root': {
                      minHeight: 32,
                      py: 0.25,
                      px: 1.5,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  <Tab label="JSON 뷰어" value="json" />
                  <Tab label="Raw 데이터" value="raw" />
                  <Tab
                    label={`Headers (${Object.keys(response.headers).length})`}
                    value="headers"
                  />
                  {response.isImage && <Tab label="이미지 미리보기" value="preview" />}
                  <Tab label="TypeScript Interface" value="ts" />
                </Tabs>
              </Box>
            )}

            {/* Response Content View */}
            <Box
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'auto',
                p: 1.5,
              }}
            >
              {!response ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.disabled',
                    p: 4,
                  }}
                >
                  <ApiRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    상단 URL을 확인하고 &quot;요청 전송&quot; 버튼을 클릭하세요.
                  </Typography>
                  <Typography variant="caption">
                    추천 프리셋이나 좌측 카탈로그에서 원하는 API를 선택하여 바로 테스트할 수
                    있습니다.
                  </Typography>
                </Box>
              ) : activeRespTab === 'json' ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {typeof response.data === 'object' && response.data !== null
                    ? JSON.stringify(response.data, null, 2)
                    : response.rawText}
                </Box>
              ) : activeRespTab === 'raw' ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {response.rawText}
                </Box>
              ) : activeRespTab === 'headers' ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 220 }}>
                          Header Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                          Header Value
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(response.headers).map(([key, val]) => (
                        <TableRow key={key}>
                          <TableCell
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            {key}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {val}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : activeRespTab === 'preview' && response.isImage && response.imageUrl ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={response.imageUrl}
                    alt="API Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 320,
                      borderRadius: 2,
                      boxShadow: 2,
                      objectFit: 'contain',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Content-Type: {response.contentType} ({response.sizeBytes} bytes)
                  </Typography>
                </Box>
              ) : activeRespTab === 'ts' ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
                      onClick={() =>
                        copyToClipboard(
                          generatedTsCode,
                          'TypeScript 인터페이스 코드가 복사되었습니다.'
                        )
                      }
                      sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                    >
                      TS 코드 복사
                    </Button>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: '#0f172a',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}
                  >
                    {generatedTsCode}
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Batch Health Check Dialog */}
      <Dialog
        open={isHealthCheckOpen}
        onClose={() => !isCheckingHealth && setIsHealthCheckOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2.5,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HealthAndSafetyRoundedIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Public API 연결 헬스체크 (Ping Test)
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setIsHealthCheckOpen(false)}
            disabled={isCheckingHealth}
          >
            <ClearRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              현재 필터링된 상위 30개 API에 대해 연결 가용성(200 OK 여부) 및 응답
              지연시간(Latency)을 일괄 진단합니다.
            </Typography>

            {isCheckingHealth && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    진행 상태
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {healthCheckProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={healthCheckProgress}
                  sx={{ borderRadius: 1, height: 8 }}
                />
              </Box>
            )}

            {/* Results summary chip */}
            {healthCheckResults.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Chip
                  label={`정상 응답: ${healthCheckResults.filter((r) => r.isOk).length}개`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`응답 지연/오류: ${healthCheckResults.filter((r) => !r.isOk).length}개`}
                  size="small"
                  color="error"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            )}

            {/* Result Table */}
            <TableContainer
              sx={{ maxHeight: 360, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>API명</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>카테고리</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>응답속도</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      액션
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthCheckResults.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                        {item.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {item.category}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {item.isOk ? (
                            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <CancelRoundedIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: item.isOk ? 'success.main' : 'error.main',
                            }}
                          >
                            {item.status > 0 ? item.status : 'ERR'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {item.timeMs} ms
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setUrl(item.url);
                            setMethod('GET');
                            setIsHealthCheckOpen(false);
                            toast.success(`"${item.name}"이(가) 워크벤치에 로드되었습니다.`);
                          }}
                          sx={{ fontSize: '0.7rem', py: 0.25, borderRadius: 1 }}
                        >
                          테스트
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1.5 }}>
          <Button
            startIcon={<RefreshRoundedIcon />}
            onClick={handleStartHealthCheck}
            disabled={isCheckingHealth}
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            재진단 실행
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsHealthCheckOpen(false)}
            disabled={isCheckingHealth}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
