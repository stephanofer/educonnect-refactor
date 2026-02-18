import type { MaterialType, MaterialCategory } from "@/ui/types";
import type { LibraryMaterial } from "./hooks";

export const MOCK_LIBRARY_MATERIALS: LibraryMaterial[] = [
  {
    id: "mock-001",
    uploaded_by: "system",
    subject_id: "calc-01",
    title: "Cálculo Diferencial — Derivadas e Integrales",
    description:
      "Guía completa con ejercicios resueltos: regla de la cadena, derivadas implícitas, integrales por sustitución y por partes.",
    type: "pdf" as MaterialType,
    category: "matematicas" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 4_800_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop&q=80",
    download_count: 487,
    is_active: true,
    created_at: "2026-02-10T10:00:00Z",
    updated_at: "2026-02-10T10:00:00Z",
    subject: { id: "calc-01", name: "Cálculo I", category: "matematicas", icon: "calculator" },
  },
  {
    id: "mock-002",
    uploaded_by: "system",
    subject_id: "prog-01",
    title: "Fundamentos de Python para Ingeniería",
    description:
      "Variables, estructuras de control, funciones, listas, diccionarios y manejo de archivos con ejercicios orientados a ingeniería.",
    type: "pdf" as MaterialType,
    category: "programacion" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 6_200_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop&q=80",
    download_count: 1120,
    is_active: true,
    created_at: "2026-02-05T14:30:00Z",
    updated_at: "2026-02-05T14:30:00Z",
    subject: { id: "prog-01", name: "Programación I", category: "programacion", icon: "code" },
  },
  {
    id: "mock-003",
    uploaded_by: "system",
    subject_id: "phys-01",
    title: "Física I — Cinemática y Leyes de Newton",
    description:
      "MRU, MRUV, caída libre, movimiento parabólico, diagramas de cuerpo libre y aplicaciones de las tres leyes de Newton.",
    type: "pdf" as MaterialType,
    category: "ciencias" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 5_100_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=400&fit=crop&q=80",
    download_count: 356,
    is_active: true,
    created_at: "2026-01-28T09:00:00Z",
    updated_at: "2026-01-28T09:00:00Z",
    subject: { id: "phys-01", name: "Física I", category: "ciencias", icon: "zap" },
  },
  {
    id: "mock-004",
    uploaded_by: "system",
    subject_id: "eng-01",
    title: "English B2 — Grammar & Writing Workbook",
    description:
      "Conditionals, reported speech, passive voice, relative clauses y essay writing con ejercicios tipo Cambridge.",
    type: "pdf" as MaterialType,
    category: "idiomas" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 3_900_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=600&h=400&fit=crop&q=80",
    download_count: 623,
    is_active: true,
    created_at: "2026-01-22T16:00:00Z",
    updated_at: "2026-01-22T16:00:00Z",
    subject: { id: "eng-01", name: "Inglés Intermedio", category: "idiomas", icon: "globe" },
  },
  {
    id: "mock-005",
    uploaded_by: "system",
    subject_id: "chem-01",
    title: "Química General — Tabla Periódica y Enlace Químico",
    description:
      "Configuración electrónica, propiedades periódicas, tipos de enlace, geometría molecular y fuerzas intermoleculares.",
    type: "document" as MaterialType,
    category: "ciencias" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 7_400_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop&q=80",
    download_count: 298,
    is_active: true,
    created_at: "2026-01-18T11:00:00Z",
    updated_at: "2026-01-18T11:00:00Z",
    subject: { id: "chem-01", name: "Química General", category: "ciencias", icon: "flask" },
  },
  {
    id: "mock-006",
    uploaded_by: "system",
    subject_id: "econ-01",
    title: "Microeconomía — Oferta, Demanda y Equilibrio de Mercado",
    description:
      "Teoría del consumidor, elasticidad precio, estructuras de mercado, externalidades y análisis gráfico paso a paso.",
    type: "pdf" as MaterialType,
    category: "negocios" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 4_300_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop&q=80",
    download_count: 412,
    is_active: true,
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-01-15T08:00:00Z",
    subject: { id: "econ-01", name: "Microeconomía", category: "negocios", icon: "trending-up" },
  },
  {
    id: "mock-007",
    uploaded_by: "system",
    subject_id: "alg-01",
    title: "Álgebra Lineal — Matrices, Determinantes y Espacios Vectoriales",
    description:
      "Operaciones matriciales, sistemas de ecuaciones, transformaciones lineales, autovalores y diagonalización.",
    type: "pdf" as MaterialType,
    category: "matematicas" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 5_600_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop&q=80",
    download_count: 389,
    is_active: true,
    created_at: "2026-01-10T13:00:00Z",
    updated_at: "2026-01-10T13:00:00Z",
    subject: { id: "alg-01", name: "Álgebra Lineal", category: "matematicas", icon: "grid" },
  },
  {
    id: "mock-008",
    uploaded_by: "system",
    subject_id: "web-01",
    title: "Desarrollo Web Moderno — React, TypeScript y Tailwind",
    description:
      "Videotutorial de 2 horas: componentes, hooks, estado global, rutas, estilos utilitarios y deploy a producción.",
    type: "video" as MaterialType,
    category: "programacion" as MaterialCategory,
    external_url: "https://youtube.com",
    file_size: 0,
    thumbnail_url:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop&q=80",
    download_count: 1540,
    is_active: true,
    created_at: "2026-01-05T10:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
    subject: { id: "web-01", name: "Desarrollo Web", category: "programacion", icon: "monitor" },
  },
  {
    id: "mock-009",
    uploaded_by: "system",
    subject_id: "red-01",
    title: "Redacción Académica — Normas APA 7ma Edición",
    description:
      "Estructura de tesis, ensayos y artículos científicos. Citas, referencias, formato y coherencia textual con ejemplos.",
    type: "pdf" as MaterialType,
    category: "humanidades" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 3_200_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop&q=80",
    download_count: 734,
    is_active: true,
    created_at: "2025-12-28T15:00:00Z",
    updated_at: "2025-12-28T15:00:00Z",
    subject: { id: "red-01", name: "Redacción Académica", category: "humanidades", icon: "pen-tool" },
  },
  {
    id: "mock-010",
    uploaded_by: "system",
    subject_id: "stat-01",
    title: "Estadística Descriptiva e Inferencial",
    description:
      "Media, mediana, varianza, distribuciones, intervalos de confianza, pruebas de hipótesis y regresión lineal.",
    type: "pdf" as MaterialType,
    category: "matematicas" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 4_700_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80",
    download_count: 521,
    is_active: true,
    created_at: "2025-12-20T09:30:00Z",
    updated_at: "2025-12-20T09:30:00Z",
    subject: { id: "stat-01", name: "Estadística", category: "matematicas", icon: "bar-chart" },
  },
  {
    id: "mock-011",
    uploaded_by: "system",
    subject_id: "bio-01",
    title: "Biología Celular — Mitosis, Meiosis y Genética Básica",
    description:
      "Ciclo celular, fases de mitosis y meiosis, leyes de Mendel, herencia ligada al sexo y problemas resueltos.",
    type: "image" as MaterialType,
    category: "ciencias" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 9_800_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop&q=80",
    download_count: 278,
    is_active: true,
    created_at: "2025-12-15T12:00:00Z",
    updated_at: "2025-12-15T12:00:00Z",
    subject: { id: "bio-01", name: "Biología General", category: "ciencias", icon: "leaf" },
  },
  {
    id: "mock-012",
    uploaded_by: "system",
    subject_id: "cont-01",
    title: "Contabilidad Financiera — Estados Financieros y Ratios",
    description:
      "Balance general, estado de resultados, flujo de efectivo, análisis vertical, horizontal y ratios de liquidez.",
    type: "pdf" as MaterialType,
    category: "negocios" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 3_800_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&q=80",
    download_count: 445,
    is_active: true,
    created_at: "2025-12-08T14:00:00Z",
    updated_at: "2025-12-08T14:00:00Z",
    subject: { id: "cont-01", name: "Contabilidad", category: "negocios", icon: "calculator" },
  },
  {
    id: "mock-013",
    uploaded_by: "system",
    subject_id: "ds-01",
    title: "Estructuras de Datos — Árboles, Grafos y Algoritmos",
    description:
      "Árboles binarios, AVL, grafos, BFS, DFS, Dijkstra, tablas hash y análisis de complejidad Big-O con implementaciones.",
    type: "document" as MaterialType,
    category: "programacion" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 6_100_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop&q=80",
    download_count: 867,
    is_active: true,
    created_at: "2025-12-01T11:00:00Z",
    updated_at: "2025-12-01T11:00:00Z",
    subject: { id: "ds-01", name: "Estructuras de Datos", category: "programacion", icon: "git-branch" },
  },
  {
    id: "mock-014",
    uploaded_by: "system",
    subject_id: "hist-01",
    title: "Historia del Perú Republicano — Siglos XIX y XX",
    description:
      "Independencia, primer militarismo, Guerra del Pacífico, República Aristocrática, reformas y conflicto armado interno.",
    type: "pdf" as MaterialType,
    category: "humanidades" as MaterialCategory,
    file_url: "/recurso0001.pdf",
    file_size: 5_500_000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=600&h=400&fit=crop&q=80",
    download_count: 193,
    is_active: true,
    created_at: "2025-11-25T10:00:00Z",
    updated_at: "2025-11-25T10:00:00Z",
    subject: { id: "hist-01", name: "Historia del Perú", category: "humanidades", icon: "book" },
  },
  {
    id: "mock-015",
    uploaded_by: "system",
    subject_id: "ml-01",
    title: "Machine Learning — Guía Práctica con Scikit-Learn",
    description:
      "Regresión, clasificación, clustering, validación cruzada, feature engineering y deployment de modelos con Python.",
    type: "link" as MaterialType,
    category: "programacion" as MaterialCategory,
    external_url: "https://scikit-learn.org/stable/tutorial/",
    file_size: 0,
    thumbnail_url:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&q=80",
    download_count: 1023,
    is_active: true,
    created_at: "2025-11-18T13:00:00Z",
    updated_at: "2025-11-18T13:00:00Z",
    subject: { id: "ml-01", name: "Inteligencia Artificial", category: "programacion", icon: "cpu" },
  },
];

// Extract unique subjects from mock data for filter dropdowns
export const MOCK_SUBJECTS = MOCK_LIBRARY_MATERIALS
  .filter((m) => m.subject)
  .reduce<Array<{ id: string; name: string; category: string; icon: string }>>(
    (acc, m) => {
      if (m.subject && !acc.find((s) => s.id === m.subject!.id)) {
        acc.push(m.subject as { id: string; name: string; category: string; icon: string });
      }
      return acc;
    },
    []
  )
  .sort((a, b) => a.name.localeCompare(b.name));
