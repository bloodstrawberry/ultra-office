// ----------------------------------------------------------------------
// VS Code Supported Languages, File Extension Mappings & Code Presets
// 25 Major Programming, Markup, Styling, Database & Config Languages
// ----------------------------------------------------------------------

import type { IdeFile } from '../types';

export interface LanguageDefinition {
  id: string;
  name: string;
  monacoLang: string;
  extensions: string[];
  color: string;
  category: 'Frontend' | 'Backend' | 'DevOps & Config' | 'Data & Query';
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // 1. Frontend
  {
    id: 'typescript-react',
    name: 'TypeScript React (TSX)',
    monacoLang: 'typescript',
    extensions: ['.tsx'],
    color: '#00d8ff',
    category: 'Frontend',
  },
  {
    id: 'typescript',
    name: 'TypeScript (TS)',
    monacoLang: 'typescript',
    extensions: ['.ts'],
    color: '#3178c6',
    category: 'Frontend',
  },
  {
    id: 'javascript-react',
    name: 'JavaScript React (JSX)',
    monacoLang: 'javascript',
    extensions: ['.jsx'],
    color: '#00d8ff',
    category: 'Frontend',
  },
  {
    id: 'javascript',
    name: 'JavaScript (JS)',
    monacoLang: 'javascript',
    extensions: ['.js', '.mjs', '.cjs'],
    color: '#f7df1e',
    category: 'Frontend',
  },
  {
    id: 'html',
    name: 'HTML5',
    monacoLang: 'html',
    extensions: ['.html', '.htm'],
    color: '#e34f26',
    category: 'Frontend',
  },
  {
    id: 'css',
    name: 'CSS3',
    monacoLang: 'css',
    extensions: ['.css'],
    color: '#2965f1',
    category: 'Frontend',
  },
  {
    id: 'scss',
    name: 'SCSS / SASS',
    monacoLang: 'scss',
    extensions: ['.scss', '.sass'],
    color: '#c6538c',
    category: 'Frontend',
  },
  {
    id: 'xml-svg',
    name: 'SVG / XML',
    monacoLang: 'xml',
    extensions: ['.svg', '.xml'],
    color: '#ff9800',
    category: 'Frontend',
  },

  // 2. Backend & System
  {
    id: 'python',
    name: 'Python',
    monacoLang: 'python',
    extensions: ['.py'],
    color: '#3776ab',
    category: 'Backend',
  },
  {
    id: 'java',
    name: 'Java',
    monacoLang: 'java',
    extensions: ['.java'],
    color: '#f89820',
    category: 'Backend',
  },
  {
    id: 'cpp',
    name: 'C / C++',
    monacoLang: 'cpp',
    extensions: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
    color: '#00599c',
    category: 'Backend',
  },
  {
    id: 'csharp',
    name: 'C# (.NET)',
    monacoLang: 'csharp',
    extensions: ['.cs'],
    color: '#9b4993',
    category: 'Backend',
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    monacoLang: 'go',
    extensions: ['.go'],
    color: '#00add8',
    category: 'Backend',
  },
  {
    id: 'rust',
    name: 'Rust',
    monacoLang: 'rust',
    extensions: ['.rs'],
    color: '#dea584',
    category: 'Backend',
  },
  {
    id: 'php',
    name: 'PHP',
    monacoLang: 'php',
    extensions: ['.php'],
    color: '#777bb4',
    category: 'Backend',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    monacoLang: 'ruby',
    extensions: ['.rb'],
    color: '#cc342d',
    category: 'Backend',
  },
  {
    id: 'swift',
    name: 'Swift',
    monacoLang: 'swift',
    extensions: ['.swift'],
    color: '#f05138',
    category: 'Backend',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    monacoLang: 'kotlin',
    extensions: ['.kt', '.kts'],
    color: '#7f52ff',
    category: 'Backend',
  },

  // 3. Data & Query
  {
    id: 'sql',
    name: 'SQL (PostgreSQL / MySQL)',
    monacoLang: 'sql',
    extensions: ['.sql'],
    color: '#008080',
    category: 'Data & Query',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    monacoLang: 'graphql',
    extensions: ['.graphql', '.gql'],
    color: '#e10098',
    category: 'Data & Query',
  },

  // 4. DevOps & Config
  {
    id: 'json',
    name: 'JSON',
    monacoLang: 'json',
    extensions: ['.json'],
    color: '#cb3837',
    category: 'DevOps & Config',
  },
  {
    id: 'yaml',
    name: 'YAML',
    monacoLang: 'yaml',
    extensions: ['.yaml', '.yml'],
    color: '#cb171e',
    category: 'DevOps & Config',
  },
  {
    id: 'markdown',
    name: 'Markdown (MD)',
    monacoLang: 'markdown',
    extensions: ['.md', '.markdown'],
    color: '#083fa1',
    category: 'DevOps & Config',
  },
  {
    id: 'shell',
    name: 'Bash / Shell Script',
    monacoLang: 'shell',
    extensions: ['.sh', '.bash', '.zsh'],
    color: '#4eaa25',
    category: 'DevOps & Config',
  },
  {
    id: 'dockerfile',
    name: 'Dockerfile',
    monacoLang: 'dockerfile',
    extensions: ['Dockerfile', '.dockerfile'],
    color: '#2496ed',
    category: 'DevOps & Config',
  },
];

// ----------------------------------------------------------------------
// Language Resolution Utilities
// ----------------------------------------------------------------------

export function getMonacoLanguage(langOrFileName: string): string {
  const lower = langOrFileName.toLowerCase();

  // Check extensions
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some((ext) => lower.endsWith(ext) || lower === ext.toLowerCase())) {
      return lang.monacoLang;
    }
  }

  // Check language ID or name match
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.id === lower || lang.monacoLang === lower) {
      return lang.monacoLang;
    }
  }

  return 'typescript';
}

export function getFileIconColor(fileName: string): string {
  const lower = fileName.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some((ext) => lower.endsWith(ext) || lower === ext.toLowerCase())) {
      return lang.color;
    }
  }
  return '#94a3b8';
}

export function getLanguageLabel(fileName: string): string {
  const lower = fileName.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.some((ext) => lower.endsWith(ext) || lower === ext.toLowerCase())) {
      return lang.name;
    }
  }
  return 'Plain Text';
}

// ----------------------------------------------------------------------
// 25 Comprehensive Code Presets
// ----------------------------------------------------------------------

export const ALL_LANGUAGE_PRESETS: IdeFile[] = [
  // 1. TypeScript React
  {
    id: 'react-hero',
    name: 'App.tsx',
    language: 'typescript',
    category: 'Frontend',
    tag: 'TSX',
    description: 'React 19 & Framer Motion 인터랙티브 히어로 컴포넌트',
    content: `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
  title?: string;
  subtitle?: string;
  onExplore?: () => void;
}

export function UltraHero({
  title = "Ultra Office Developer Studio",
  subtitle = "브라우저에서 직접 빌드하고 실행하는 차세대 웹 워크스페이스",
  onExplore,
}: HeroProps) {
  const [typedChars, setTypedChars] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypedChars((prev) => (prev < title.length ? prev + 1 : prev));
    }, 35);
    return () => clearInterval(timer);
  }, [title]);

  return (
    <div className="relative min-h-[480px] flex flex-col justify-center items-center px-6">
      {/* Background Neon Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl" />

      {/* Main Title with Dynamic Typewriter */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
        {title.slice(0, typedChars)}
        <span className="animate-pulse text-indigo-400">|</span>
      </h1>

      <p className="text-lg md:text-xl text-slate-300 max-w-2xl text-center mb-8">
        {subtitle}
      </p>

      {/* Interactive Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExplore}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all"
      >
        🚀 지금 시작하기
      </motion.button>
    </div>
  );
}`,
  },

  // 2. TypeScript
  {
    id: 'algo-quicksort',
    name: 'quicksort.ts',
    language: 'typescript',
    category: 'Frontend',
    tag: 'TS',
    description: 'TypeScript 제네릭 퀵정렬 & 이진탐색 알고리즘',
    content: `/**
 * Ultra Office 고성능 제네릭 퀵 정렬 (QuickSort) 알고리즘
 * Time Complexity: O(N log N) average, Space Complexity: O(log N)
 */

export function quickSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return [...arr];

  const pivot = arr[Math.floor(arr.length / 2)];
  const left: T[] = [];
  const middle: T[] = [];
  const right: T[] = [];

  for (const item of arr) {
    const cmp = compareFn(item, pivot);
    if (cmp < 0) {
      left.push(item);
    } else if (cmp > 0) {
      right.push(item);
    } else {
      middle.push(item);
    }
  }

  return [
    ...quickSort(left, compareFn),
    ...middle,
    ...quickSort(right, compareFn),
  ];
}

// 이진 탐색 (Binary Search)
export function binarySearch<T>(
  sortedArr: T[],
  target: T,
  compareFn: (a: T, b: T) => number
): number {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compareFn(sortedArr[mid], target);

    if (cmp === 0) return mid;
    if (cmp < 0) low = mid + 1;
    else high = mid - 1;
  }

  return -1; // 찾지 못함
}

// 데모 데이터 검증
const sampleData = [64, 34, 25, 12, 22, 11, 90];
const sorted = quickSort(sampleData, (a, b) => a - b);
console.log('✅ 정렬 결과:', sorted);
console.log('🔍 25 인덱스 탐색:', binarySearch(sorted, 25, (a, b) => a - b));`,
  },

  // 3. JavaScript React
  {
    id: 'react-counter',
    name: 'Counter.jsx',
    language: 'javascript',
    category: 'Frontend',
    tag: 'JSX',
    description: 'React Hooks 기반 상태 카운터 & 타이머 컴포넌트',
    content: `import React, { useState, useEffect, useCallback } from 'react';

export default function SmartCounter({ initialValue = 0, step = 1 }) {
  const [count, setCount] = useState(initialValue);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);

  // 자동 카운트 업 타이머
  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => {
        setCount((prev) => {
          const next = prev + step;
          setHistory((h) => [...h.slice(-4), next]);
          return next;
        });
      }, 500);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, step]);

  const handleReset = useCallback(() => {
    setCount(initialValue);
    setIsRunning(false);
    setHistory([]);
  }, [initialValue]);

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center shadow-xl">
      <h2 className="text-xl font-bold text-neutral-300 mb-2">스마트 리액티브 카운터</h2>
      <div className="text-6xl font-black text-emerald-400 my-6 font-mono">
        {count.toLocaleString()}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setCount((c) => c - step)}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
        >
          -{step}
        </button>
        <button
          onClick={() => setIsRunning((r) => !r)}
          className={\`px-6 py-2 font-bold rounded-lg \${isRunning ? 'bg-amber-600' : 'bg-emerald-600'}\`}
        >
          {isRunning ? '정지' : '자동 시작'}
        </button>
        <button
          onClick={() => setCount((c) => c + step)}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
        >
          +{step}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg"
        >
          초기화
        </button>
      </div>
    </div>
  );
}`,
  },

  // 4. JavaScript Node.js
  {
    id: 'node-api',
    name: 'server.js',
    language: 'javascript',
    category: 'Backend',
    tag: 'JS',
    description: 'Node.js Express REST API 서버 및 미들웨어',
    content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] \${req.method} \${req.url}\`);
  next();
});

// Mock 데이터베이스
const users = [
  { id: 1, name: '홍길동', role: 'Staff Engineer', status: 'active' },
  { id: 2, name: '이순신', role: 'DevOps Lead', status: 'busy' },
  { id: 3, name: '강감찬', role: 'Frontend Architect', status: 'online' },
];

// API 라우트 정의
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), memory: process.memoryUsage() });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, count: users.length, data: users });
});

app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'name and role are required' });
  }
  const newUser = { id: users.length + 1, name, role, status: 'active' };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

app.listen(PORT, () => {
  console.log(\`⚡ Ultra Express API Server listening on port \${PORT}\`);
  console.log(\`👉 Health Check: http://localhost:\${PORT}/api/health\`);
});`,
  },

  // 5. Python
  {
    id: 'python-ai',
    name: 'neural_network.py',
    language: 'python',
    category: 'Backend',
    tag: 'PY',
    description: 'Python 인공신경망 다층 퍼셉트론(MLP) & NumPy',
    content: `import numpy as np

class TinyNeuralNetwork:
    """초경량 2계층 다층 퍼셉트론(MLP) 신경망 구현"""
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        np.random.seed(42)
        self.W1 = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * 0.01
        self.b2 = np.zeros((1, output_dim))

    def relu(self, z: np.ndarray) -> np.ndarray:
        return np.maximum(0, z)

    def softmax(self, z: np.ndarray) -> np.ndarray:
        exp_z = np.exp(z - np.max(z, axis=-1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        # Layer 1 Forward
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.relu(self.z1)
        # Layer 2 Forward
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.probs = self.softmax(self.z2)
        return self.probs

if __name__ == '__main__':
    model = TinyNeuralNetwork(input_dim=4, hidden_dim=8, output_dim=3)
    sample_input = np.array([[5.1, 3.5, 1.4, 0.2]])
    predictions = model.forward(sample_input)
    print("🚀 신경망 순전파 추론 완료! 클래스별 확률:")
    for idx, prob in enumerate(predictions[0]):
        print(f"  Class {idx}: {prob * 100:.2f}%")`,
  },

  // 6. Java
  {
    id: 'java-service',
    name: 'UserController.java',
    language: 'java',
    category: 'Backend',
    tag: 'JAVA',
    description: 'Java 21 Spring Boot REST 컨트롤러 & 레코드 DTO',
    content: `package com.ultra.office.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

public record UserDto(Long id, String email, String role, LocalDateTime createdAt) {}

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final List<UserDto> users = List.of(
        new UserDto(1L, "dev@ultra.office", "ADMIN", LocalDateTime.now()),
        new UserDto(2L, "alex@ultra.office", "MEMBER", LocalDateTime.now())
    );

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(this.users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return this.users.stream()
            .filter(u -> u.id().equals(id))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}`,
  },

  // 7. C++
  {
    id: 'cpp-dijkstra',
    name: 'dijkstra.cpp',
    language: 'cpp',
    category: 'Backend',
    tag: 'C++',
    description: 'C++20 STL 우선순위 큐 다익스트라 최단경로 알고리즘',
    content: `#include <iostream>
#include <vector>
#include <queue>
#include <limits>

using namespace std;

const int INF = numeric_limits<int>::max();

struct Edge {
    int to;
    int weight;
};

void dijkstra(int startNode, int n, const vector<vector<Edge>>& graph) {
    vector<int> dist(n + 1, INF);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;

    dist[startNode] = 0;
    pq.push({0, startNode});

    while (!pq.empty()) {
        auto [currentDist, u] = pq.top();
        pq.pop();

        if (currentDist > dist[u]) continue;

        for (const auto& edge : graph[u]) {
            int nextNode = edge.to;
            int nextDist = currentDist + edge.weight;

            if (nextDist < dist[nextNode]) {
                dist[nextNode] = nextDist;
                pq.push({nextDist, nextNode});
            }
        }
    }

    cout << "=== 최단 거리 결과 (시작 노드: " << startNode << ") ===" << endl;
    for (int i = 1; i <= n; ++i) {
        cout << "노드 " << i << " : " << (dist[i] == INF ? -1 : dist[i]) << endl;
    }
}

int main() {
    int n = 5;
    vector<vector<Edge>> graph(n + 1);
    graph[1].push_back({2, 10});
    graph[1].push_back({3, 3});
    graph[3].push_back({2, 1});
    graph[2].push_back({4, 2});
    graph[3].push_back({4, 8});

    dijkstra(1, n, graph);
    return 0;
}`,
  },

  // 8. C#
  {
    id: 'csharp-linq',
    name: 'OrderProcessor.cs',
    language: 'csharp',
    category: 'Backend',
    tag: 'C#',
    description: 'C# .NET 9 레코드, LINQ 쿼리 및 패턴 매칭',
    content: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace UltraOffice.Commerce;

public record OrderItem(string Sku, string Name, decimal Price, int Quantity);
public record CustomerOrder(Guid OrderId, string CustomerEmail, List<OrderItem> Items, bool IsVip);

public class OrderProcessor
{
    public static async Task Main()
    {
        var sampleOrders = new List<CustomerOrder>
        {
            new(Guid.NewGuid(), "dev@ultra.com", new() { new("KB-01", "Mechanical Keyboard", 159.00m, 1) }, true),
            new(Guid.NewGuid(), "guest@shop.com", new() { new("MS-02", "Wireless Mouse", 49.99m, 2) }, false),
        };

        var highValueOrders = sampleOrders
            .Where(o => o.Items.Sum(i => i.Price * i.Quantity) >= 100m)
            .OrderByDescending(o => o.IsVip)
            .Select(o => new
            {
                o.OrderId,
                o.CustomerEmail,
                TotalAmount = o.Items.Sum(i => i.Price * i.Quantity),
                Discount = o.IsVip ? 0.15m : 0.0m
            });

        foreach (var order in highValueOrders)
        {
            decimal finalPrice = order.TotalAmount * (1 - order.Discount);
            Console.WriteLine($"[주문 완료] ID: {order.OrderId} | 결제금액: {finalPrice:C}");
        }
        await Task.CompletedTask;
    }
}`,
  },

  // 9. Go
  {
    id: 'go-crawler',
    name: 'crawler.go',
    language: 'go',
    category: 'Backend',
    tag: 'GO',
    description: 'Go 고루틴 & 채널 기반 동시성 비동기 워커 풀',
    content: `package main

import (
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID  int
	URL string
}

type Result struct {
	JobID  int
	Status int
	TimeTaken time.Duration
}

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		start := time.Now()
		// 가상의 HTTP 크롤링 작업 시뮬레이션
		time.Sleep(time.Millisecond * 30)
		results <- Result{
			JobID:     job.ID,
			Status:    200,
			TimeTaken: time.Since(start),
		}
		fmt.Printf("[Worker %d] 작업 완료: %s\\n", id, job.URL)
	}
}

func main() {
	const numJobs = 10
	const numWorkers = 3

	jobs := make(chan Job, numJobs)
	results := make(chan Result, numJobs)
	var wg sync.WaitGroup

	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= numJobs; j++ {
		jobs <- Job{ID: j, URL: fmt.Sprintf("https://api.ultra.office/item/%d", j)}
	}
	close(jobs)

	wg.Wait()
	close(results)
	fmt.Println("🚀 모든 동시성 크롤링 작업이 안전하게 완료되었습니다!")
}`,
  },

  // 10. Rust
  {
    id: 'rust-async',
    name: 'main.rs',
    language: 'rust',
    category: 'Backend',
    tag: 'RUST',
    description: 'Rust 소유권, Result 에러 핸들링 및 멀티스레드 안전성',
    content: `use std::sync::{Arc, Mutex};
use std::thread;

#[derive(Debug, Clone)]
pub struct ServerMetric {
    pub endpoint: String,
    pub request_count: u64,
}

impl ServerMetric {
    pub fn new(endpoint: &str) -> Self {
        Self {
            endpoint: endpoint.to_string(),
            request_count: 0,
        }
    }

    pub fn record_hit(&mut self) {
        self.request_count += 1;
    }
}

fn main() {
    let metric = Arc::new(Mutex::new(ServerMetric::new("/api/v1/stream")));
    let mut handles = vec![];

    for thread_id in 0..4 {
        let metric_clone = Arc::clone(&metric);
        let handle = thread::spawn(move || {
            let mut data = metric_clone.lock().expect("Failed to lock mutex");
            data.record_hit();
            println!("[스레드 {:?}] 요청 카운트 증가 완료", thread_id);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let final_metric = metric.lock().unwrap();
    println!("🦀 Rust 최종 집계 결과: {:?}", *final_metric);
}`,
  },

  // 11. PHP
  {
    id: 'php-pdo',
    name: 'Database.php',
    language: 'php',
    category: 'Backend',
    tag: 'PHP',
    description: 'PHP 8.3 PDO 데이터베이스 추상화 & Prepared Statements',
    content: `<?php
declare(strict_types=1);

namespace UltraOffice\\Database;

use PDO;
use PDOException;

final readonly class DatabaseConnection
{
    private PDO $pdo;

    public function __construct(string $dsn, string $username, string $password)
    {
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $this->pdo = new PDO($dsn, $username, $password, $options);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function findUserByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT id, name, role FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }
}

echo "🐘 PHP 8.3 PDO Repository Loaded Successfully!\\n";`,
  },

  // 12. Ruby
  {
    id: 'ruby-sinatra',
    name: 'app.rb',
    language: 'ruby',
    category: 'Backend',
    tag: 'RUBY',
    description: 'Ruby Sinatra 경량 웹 API & 메타프로그래밍 블록',
    content: `require 'json'

class UltraMicroService
  def initialize(service_name)
    @service_name = service_name
    @routes = {}
  end

  def get(path, &block)
    @routes[path] = block
  end

  def call(path)
    if @routes.key?(path)
      response = @routes[path].call
      { status: 200, body: response }.to_json
    else
      { status: 404, error: "Route #{path} Not Found" }.to_json
    end
  end
end

app = UltraMicroService.new("Ruby Gateway")

app.get("/health") do
  { status: "ok", timestamp: Time.now.to_i, platform: "Ruby 3.3" }
end

app.get("/users") do
  [
    { id: 101, name: "Matz", role: "Creator" },
    { id: 102, name: "DHH", role: "Rails Lead" }
  ]
end

puts app.call("/health")`,
  },

  // 13. Swift
  {
    id: 'swift-ui',
    name: 'ContentView.swift',
    language: 'swift',
    category: 'Backend',
    tag: 'SWIFT',
    description: 'Swift SwiftUI 반응형 인터페이스 & Observable 모델',
    content: `import SwiftUI

struct TaskItem: Identifiable {
    let id = UUID()
    var title: String
    var isCompleted: Bool
}

class TaskViewModel: ObservableObject {
    @Published var tasks: [TaskItem] = [
        TaskItem(title: "VS Code 라이트 테마 완성", isCompleted: true),
        TaskItem(title: "타건음 6종 사운드 추가", isCompleted: true),
        TaskItem(title: "모든 지원 언어 템플릿 구현", isCompleted: false)
    ]
}

struct ContentView: View {
    @StateObject private var viewModel = TaskViewModel()

    var body: some View {
        NavigationStack {
            List($viewModel.tasks) { $task in
                HStack {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(task.isCompleted ? .green : .gray)
                    Text(task.title)
                        .strikethrough(task.isCompleted)
                }
            }
            .navigationTitle("SwiftUI 로드맵")
        }
    }
}`,
  },

  // 14. Kotlin
  {
    id: 'kotlin-coroutines',
    name: 'UserViewModel.kt',
    language: 'kotlin',
    category: 'Backend',
    tag: 'KT',
    description: 'Kotlin 2.0 코루틴 & StateFlow 비동기 상태 관리',
    content: `package com.ultra.office.viewmodel

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface UiState {
    object Loading : UiState
    data class Success(val username: String, val level: Int) : UiState
    data class Error(val message: String) : UiState
}

class UserViewModel {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun fetchUserProfile(userId: String) {
        _uiState.value = UiState.Loading
        try {
            // 비동기 통신 시뮬레이션
            _uiState.value = UiState.Success(
                username = "UltraDev_$userId",
                level = 99
            )
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e.localizedMessage ?: "알 수 없는 에러")
        }
    }
}`,
  },

  // 15. HTML5
  {
    id: 'cyberpunk-css',
    name: 'matrix.html',
    language: 'html',
    category: 'Frontend',
    tag: 'HTML',
    description: 'HTML5 Canvas 매트릭스 디지털 레인 애니메이션',
    content: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>Cyberpunk Digital Rain</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; font-family: monospace; }
    canvas { display: block; position: fixed; inset: 0; }
  </style>
</head>
<body>
  <canvas id="matrix"></canvas>
  <script>
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '0123456789ABCDEF가나다라마바사아자차카타파하';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = \`\${fontSize}px monospace\`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    setInterval(draw, 33);
  </script>
</body>
</html>`,
  },

  // 16. CSS3
  {
    id: 'modern-css',
    name: 'glassmorphism.css',
    language: 'css',
    category: 'Frontend',
    tag: 'CSS',
    description: 'CSS3 모던 글래스모피즘 & 네온 그라디언트 카드 스타일',
    content: `:root {
  --primary-glow: #007acc;
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.ultra-glass-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 2.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ultra-glass-card:hover {
  transform: translateY(-6px);
  border-color: var(--primary-glow);
  box-shadow: 0 12px 40px rgba(0, 122, 204, 0.3);
}

@keyframes neon-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; filter: drop-shadow(0 0 12px var(--primary-glow)); }
}`,
  },

  // 17. SCSS
  {
    id: 'scss-theme',
    name: 'theme.scss',
    language: 'scss',
    category: 'Frontend',
    tag: 'SCSS',
    description: 'SCSS 믹스인, 네스팅 및 컬러 테마 루프',
    content: `// ----------------------------------------------------------------------
// SCSS Variables & Breakpoints
// ----------------------------------------------------------------------
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

$colors: (
  'blue': #007acc,
  'emerald': #10b981,
  'purple': #8b5cf6,
  'amber': #f59e0b
);

.badge {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 700;

  @each $name, $value in $colors {
    &--#{$name} {
      background-color: rgba($value, 0.15);
      color: $value;
      border: 1px solid rgba($value, 0.3);
    }
  }

  @include respond-to('md') {
    padding: 0.35rem 1rem;
    font-size: 0.875rem;
  }
}`,
  },

  // 18. SQL
  {
    id: 'sql-analytics',
    name: 'analytics.sql',
    language: 'sql',
    category: 'Data & Query',
    tag: 'SQL',
    description: 'PostgreSQL CTE, 윈도우 함수 및 코호트 리텐션 쿼리',
    content: `-- Ultra Office 사용자 코호트 및 결제 분석 쿼리
WITH user_first_orders AS (
    SELECT
        user_id,
        MIN(created_at) AS first_order_date,
        DATE_TRUNC('month', MIN(created_at)) AS cohort_month
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY user_id
),
monthly_activity AS (
    SELECT
        o.user_id,
        DATE_TRUNC('month', o.created_at) AS active_month,
        SUM(o.amount) AS monthly_revenue,
        COUNT(o.id) AS total_orders
    FROM orders o
    WHERE o.status = 'COMPLETED'
    GROUP BY o.user_id, DATE_TRUNC('month', o.created_at)
)
SELECT
    ufo.cohort_month,
    ma.active_month,
    COUNT(DISTINCT ufo.user_id) AS cohort_size,
    SUM(ma.monthly_revenue) AS total_revenue,
    ROUND(AVG(ma.monthly_revenue), 2) AS arpu,
    DENSE_RANK() OVER (
        PARTITION BY ufo.cohort_month 
        ORDER BY ma.active_month
    ) AS cohort_age_months
FROM user_first_orders ufo
JOIN monthly_activity ma ON ufo.user_id = ma.user_id
GROUP BY ufo.cohort_month, ma.active_month
ORDER BY ufo.cohort_month DESC, ma.active_month ASC;`,
  },

  // 19. JSON
  {
    id: 'config-json',
    name: 'package.json',
    language: 'json',
    category: 'DevOps & Config',
    tag: 'JSON',
    description: 'Next.js 15 & React 19 패키지 매니페스트 설정 파일',
    content: `{
  "name": "ultra-office",
  "version": "2.4.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "tsc": "tsc --noEmit",
    "fm:check": "prettier --check .",
    "fm:fix": "prettier --write ."
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@mui/material": "^6.4.0",
    "@mui/icons-material": "^6.4.0",
    "framer-motion": "^12.0.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0"
  }
}`,
  },

  // 20. YAML
  {
    id: 'k8s-yaml',
    name: 'deployment.yaml',
    language: 'yaml',
    category: 'DevOps & Config',
    tag: 'YAML',
    description: 'Kubernetes Pod Deployment & Service 구성 명세서',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ultra-office-api
  namespace: production
  labels:
    app.kubernetes.io/name: ultra-office
    app.kubernetes.io/tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ultra-office-api
  template:
    metadata:
      labels:
        app: ultra-office-api
    spec:
      containers:
      - name: api-server
        image: registry.ultra.office/api:v2.4.0
        ports:
        - containerPort: 8080
          name: http
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ultra-office-service
  namespace: production
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: ultra-office-api`,
  },

  // 21. Markdown
  {
    id: 'markdown-docs',
    name: 'README.md',
    language: 'markdown',
    category: 'DevOps & Config',
    tag: 'MD',
    description: 'GitHub Flavored Markdown (GFM) 프로젝트 기술 문서',
    content: `# 🚀 Ultra Office Developer Studio

브라우저 내에서 무설치로 동작하는 차세대 웹 오피스 및 개발자 IDE 환경입니다.

## ✨ 주요 특징

- **실시간 소스코드 타이핑 애니메이션 (Type-writer Effect)**: 기계식 타건음과 함께 실시간 입력 연출.
- **VS Code 다중 테마 엔진**: Light+, Dark, Classic Blue, Dracula, Monokai 등 정품 테마 완벽 지원.
- **모든 주요 언어 문법 강조**: Monaco Editor 기반 25개 언어 인텔리센스 및 하이라이트.

## 📊 언어별 지원 매트릭스

| 언어 | 런타임 | 카테고리 | 지원 수준 |
| :--- | :--- | :--- | :--- |
| **TypeScript / TSX** | Node.js / Browser | Frontend | 완전 지원 (Full) |
| **Python** | Python 3.12 | Backend / AI | 완전 지원 (Full) |
| **Rust** | LLVM Native | System | 완전 지원 (Full) |
| **Go** | Go 1.22 | Cloud Native | 완전 지원 (Full) |
| **Docker / K8s** | Container | DevOps | 완전 지원 (Full) |

> [!TIP]
> 상단 툴바의 **[▶ 코드 타이핑 재생]** 버튼을 누르면 코드가 키보드 소리와 함께 한 글자씩 입력됩니다!`,
  },

  // 22. Shell / Bash
  {
    id: 'shell-devops',
    name: 'deploy.sh',
    language: 'shell',
    category: 'DevOps & Config',
    tag: 'SH',
    description: 'Bash Linux DevOps 자동 배포 & 도커 빌드 스크립트',
    content: `#!/usr/bin/env bash
set -euo pipefail

RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

APP_NAME="ultra-office"
VERSION=$(git describe --tags --always 2>/dev/null || echo "v2.4.0")

echo -e "\${BLUE}==> [1/4] 빌드 사전 검사 및 의존성 확인 중...\${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "\${RED}Docker가 설치되어 있지 않습니다.\${NC}"; exit 1; }

echo -e "\${BLUE}==> [2/4] Docker 이미지 빌드 시작 (버전: \${VERSION})...\${NC}"
docker build -t "\${APP_NAME}:\${VERSION}" -t "\${APP_NAME}:latest" .

echo -e "\${BLUE}==> [3/4] 이전 컨테이너 정리 및 무중단 재배포 실행...\${NC}"
docker compose down --remove-orphans || true
docker compose up -d

echo -e "\${GREEN}==> [4/4] 🚀 배포 성공! \${APP_NAME} (\${VERSION}) 서비스가 정상 가동되었습니다.\${NC}"`,
  },

  // 23. Dockerfile
  {
    id: 'docker-build',
    name: 'Dockerfile',
    language: 'dockerfile',
    category: 'DevOps & Config',
    tag: 'DOCKER',
    description: 'Next.js 프로덕션 멀티 스테이지 최적화 컨테이너 빌드',
    content: `# Multi-stage Build for Ultra Office Next.js
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]`,
  },

  // 24. GraphQL
  {
    id: 'graphql-schema',
    name: 'schema.graphql',
    language: 'graphql',
    category: 'Data & Query',
    tag: 'GQL',
    description: 'GraphQL 스키마 정의 언어 (SDL) 쿼리, 뮤테이션 & 타입',
    content: `"""
Ultra Office 핵심 사용자 엔터티 모델
"""
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  projects: [Project!]!
  createdAt: String!
}

enum UserRole {
  ADMIN
  DEVELOPER
  VIEWER
}

type Project {
  id: ID!
  title: String!
  language: String!
  updatedAt: String!
}

type Query {
  me: User
  user(id: ID!): User
  projects(limit: Int = 10): [Project!]!
}

type Mutation {
  createProject(title: String!, language: String!): Project!
  updateUserRole(userId: ID!, newRole: UserRole!): User!
}

type Subscription {
  projectUpdated(projectId: ID!): Project!
}`,
  },

  // 25. XML / SVG
  {
    id: 'xml-svg',
    name: 'vector-badge.svg',
    language: 'xml',
    category: 'Frontend',
    tag: 'SVG',
    description: 'SVG XML 벡터 그래픽 & 그라디언트 뱃지 마크업',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="ultraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Pill Shape -->
  <rect x="10" y="10" width="380" height="100" rx="24" fill="#0f172a" stroke="url(#ultraGrad)" stroke-width="2" />

  <!-- Code Icon Symbol -->
  <path d="M 50 60 L 70 42 M 50 60 L 70 78" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 110 60 L 90 42 M 110 60 L 90 78" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Text Heading -->
  <text x="135" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="bold">
    Ultra IDE Studio
  </text>
  <text x="135" y="78" fill="#94a3b8" font-family="sans-serif" font-size="13">
    25+ Languages Supported
  </text>
</svg>`,
  },
];
