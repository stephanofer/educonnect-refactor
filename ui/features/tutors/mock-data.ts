import type { Subject } from "@/ui/types";

export interface MockTutorCredential {
  id: string;
  title: string;
  institution: string;
  year: number;
  type: "degree" | "certificate" | "diploma";
  verified: boolean;
}

export interface MockTutorReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
}

export interface MockTutorAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface MockTutor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  university: string;
  career: string;
  bio: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isVerified: boolean;
  isAvailable: boolean;
  isFavorite: boolean;
  recommendationRate: number;
  subjects: Subject[];
  credentials: MockTutorCredential[];
  availability: MockTutorAvailability[];
  recentReviews: MockTutorReview[];
}

export const MOCK_SUBJECTS: Subject[] = [
  { id: "s1", name: "Cálculo I", category: "Matemáticas" },
  { id: "s2", name: "Cálculo II", category: "Matemáticas" },
  { id: "s3", name: "Álgebra Lineal", category: "Matemáticas" },
  { id: "s4", name: "Física I", category: "Ciencias" },
  { id: "s5", name: "Física II", category: "Ciencias" },
  { id: "s6", name: "Química General", category: "Ciencias" },
  { id: "s7", name: "Programación I", category: "Ingeniería" },
  { id: "s8", name: "Estructuras de Datos", category: "Ingeniería" },
  { id: "s9", name: "Estadística", category: "Matemáticas" },
  { id: "s10", name: "Economía", category: "Negocios" },
  { id: "s11", name: "Contabilidad", category: "Negocios" },
  { id: "s12", name: "Inglés Avanzado", category: "Idiomas" },
  { id: "s13", name: "Biología Celular", category: "Ciencias" },
  { id: "s14", name: "Derecho Civil", category: "Humanidades" },
  { id: "s15", name: "Bases de Datos", category: "Ingeniería" },
];

const UNIVERSITIES = [
  "Universidad Nacional Mayor de San Marcos",
  "Pontificia Universidad Católica del Perú",
  "Universidad Nacional de Ingeniería",
  "Universidad de Lima",
  "Universidad del Pacífico",
  "Universidad Peruana Cayetano Heredia",
  "Universidad San Martín de Porres",
  "Universidad Ricardo Palma",
];

function generateAvailability(tutorIndex: number): MockTutorAvailability[] {
  const slots: MockTutorAvailability[] = [];
  const startHours = [8, 9, 10, 14, 15, 16];
  const daysActive = [1, 2, 3, 4, 5].filter((_, i) => (tutorIndex + i) % 3 !== 0);

  daysActive.forEach((day) => {
    const morningStart = startHours[tutorIndex % startHours.length];
    const afternoonStart = startHours[(tutorIndex + 3) % startHours.length];

    slots.push({
      id: `avail-${tutorIndex}-${day}-am`,
      dayOfWeek: day,
      startTime: `${morningStart.toString().padStart(2, "0")}:00`,
      endTime: `${(morningStart + 3).toString().padStart(2, "0")}:00`,
      isActive: true,
    });

    if (day % 2 === 0) {
      slots.push({
        id: `avail-${tutorIndex}-${day}-pm`,
        dayOfWeek: day,
        startTime: `${afternoonStart.toString().padStart(2, "0")}:00`,
        endTime: `${(afternoonStart + 2).toString().padStart(2, "0")}:00`,
        isActive: true,
      });
    }
  });

  return slots;
}

export const MOCK_TUTORS: MockTutor[] = [
  {
    id: "tutor-1",
    fullName: "Alejandro Ríos García",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    university: UNIVERSITIES[0],
    career: "Ingeniería de Sistemas",
    bio: "Ingeniero de sistemas con 5 años de experiencia en tutorías universitarias. Me apasiona enseñar programación y matemáticas de forma práctica y sencilla. He ayudado a más de 200 estudiantes a aprobar sus cursos.",
    specialties: ["Programación", "Cálculo", "Álgebra Lineal", "Estructuras de Datos"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 1,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[0], MOCK_SUBJECTS[2], MOCK_SUBJECTS[6], MOCK_SUBJECTS[7], MOCK_SUBJECTS[14]],
    credentials: [
      { id: "cred-1-1", title: "Bachiller en Ingeniería de Sistemas", institution: UNIVERSITIES[0], year: 2019, type: "degree", verified: true },
      { id: "cred-1-2", title: "Certificación en Python Avanzado", institution: "Coursera - University of Michigan", year: 2021, type: "certificate", verified: true },
      { id: "cred-1-3", title: "AWS Cloud Practitioner", institution: "Amazon Web Services", year: 2022, type: "certificate", verified: true },
    ],
    availability: generateAvailability(0),
    recentReviews: [],
  },
  {
    id: "tutor-2",
    fullName: "Valentina Castro Peralta",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    university: UNIVERSITIES[1],
    career: "Matemáticas Puras",
    bio: "Matemática de profesión y vocación. Especialista en cálculo y álgebra lineal. Mi metodología se basa en entender el 'por qué' detrás de cada fórmula, no solo memorizar.",
    specialties: ["Cálculo I", "Cálculo II", "Álgebra Lineal", "Estadística"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: true,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[0], MOCK_SUBJECTS[1], MOCK_SUBJECTS[2], MOCK_SUBJECTS[8]],
    credentials: [
      { id: "cred-2-1", title: "Licenciatura en Matemáticas", institution: UNIVERSITIES[1], year: 2020, type: "degree", verified: true },
      { id: "cred-2-2", title: "Diploma en Didáctica Universitaria", institution: UNIVERSITIES[1], year: 2021, type: "diploma", verified: true },
    ],
    availability: generateAvailability(1),
    recentReviews: [],
  },
  {
    id: "tutor-3",
    fullName: "Sebastián Morales Luna",
    avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    university: UNIVERSITIES[2],
    career: "Ingeniería Física",
    bio: "Apasionado por la física y las ciencias exactas. Hago que los problemas más complejos se vuelvan sencillos con ejemplos del mundo real.",
    specialties: ["Física I", "Física II", "Cálculo", "Química"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[3], MOCK_SUBJECTS[4], MOCK_SUBJECTS[0], MOCK_SUBJECTS[5]],
    credentials: [
      { id: "cred-3-1", title: "Bachiller en Ingeniería Física", institution: UNIVERSITIES[2], year: 2021, type: "degree", verified: true },
      { id: "cred-3-2", title: "Certificado en Mecánica Cuántica", institution: "MIT OpenCourseWare", year: 2022, type: "certificate", verified: false },
    ],
    availability: generateAvailability(2),
    recentReviews: [],
  },
  {
    id: "tutor-4",
    fullName: "Camila Herrera Vásquez",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    university: UNIVERSITIES[3],
    career: "Ingeniería Industrial",
    bio: "Ingeniera industrial con pasión por la estadística y la economía. Te ayudo a entender los datos y a tomar mejores decisiones basadas en evidencia.",
    specialties: ["Estadística", "Economía", "Cálculo", "Investigación Operativa"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 1,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[8], MOCK_SUBJECTS[9], MOCK_SUBJECTS[0], MOCK_SUBJECTS[10]],
    credentials: [
      { id: "cred-4-1", title: "Bachiller en Ingeniería Industrial", institution: UNIVERSITIES[3], year: 2020, type: "degree", verified: true },
      { id: "cred-4-2", title: "Six Sigma Green Belt", institution: "ASQ", year: 2022, type: "certificate", verified: true },
    ],
    availability: generateAvailability(3),
    recentReviews: [],
  },
  {
    id: "tutor-5",
    fullName: "Mateo Delgado Ramos",
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    university: UNIVERSITIES[4],
    career: "Economía",
    bio: "Economista con experiencia en banca y finanzas. Hago que la economía y la contabilidad sean fáciles de entender con casos prácticos del mercado peruano.",
    specialties: ["Economía", "Contabilidad", "Finanzas", "Estadística"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[9], MOCK_SUBJECTS[10], MOCK_SUBJECTS[8]],
    credentials: [
      { id: "cred-5-1", title: "Licenciatura en Economía", institution: UNIVERSITIES[4], year: 2019, type: "degree", verified: true },
      { id: "cred-5-2", title: "CFA Level I", institution: "CFA Institute", year: 2021, type: "certificate", verified: true },
      { id: "cred-5-3", title: "Maestría en Finanzas (en curso)", institution: UNIVERSITIES[4], year: 2024, type: "degree", verified: false },
    ],
    availability: generateAvailability(4),
    recentReviews: [],
  },
  {
    id: "tutor-6",
    fullName: "Isabella Flores Mendoza",
    avatarUrl: "https://randomuser.me/api/portraits/women/17.jpg",
    university: UNIVERSITIES[5],
    career: "Biología",
    bio: "Bióloga con enfoque en ciencias de la vida. Especialista en biología celular y química. Mis clases son dinámicas, con esquemas y mapas conceptuales.",
    specialties: ["Biología Celular", "Química General", "Bioquímica"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[12], MOCK_SUBJECTS[5]],
    credentials: [
      { id: "cred-6-1", title: "Bachiller en Biología", institution: UNIVERSITIES[5], year: 2021, type: "degree", verified: true },
      { id: "cred-6-2", title: "Certificado en Biotecnología", institution: "edX - Harvard", year: 2023, type: "certificate", verified: true },
    ],
    availability: generateAvailability(5),
    recentReviews: [],
  },
  {
    id: "tutor-7",
    fullName: "Daniel Vargas Huamán",
    avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    university: UNIVERSITIES[2],
    career: "Ciencias de la Computación",
    bio: "Desarrollador full-stack y tutor de programación. Te enseño a programar desde cero o a dominar estructuras de datos y algoritmos para tus entrevistas técnicas.",
    specialties: ["Programación", "Estructuras de Datos", "Algoritmos", "Bases de Datos"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 1,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[6], MOCK_SUBJECTS[7], MOCK_SUBJECTS[14]],
    credentials: [
      { id: "cred-7-1", title: "Bachiller en Ciencias de la Computación", institution: UNIVERSITIES[2], year: 2018, type: "degree", verified: true },
      { id: "cred-7-2", title: "Google Professional Cloud Developer", institution: "Google Cloud", year: 2021, type: "certificate", verified: true },
      { id: "cred-7-3", title: "Meta Front-End Developer", institution: "Meta / Coursera", year: 2022, type: "certificate", verified: true },
    ],
    availability: generateAvailability(6),
    recentReviews: [],
  },
  {
    id: "tutor-8",
    fullName: "Sofía Paredes Quispe",
    avatarUrl: "https://randomuser.me/api/portraits/women/26.jpg",
    university: UNIVERSITIES[0],
    career: "Química",
    bio: "Química con maestría en investigación. Me especializo en hacer accesible la química general y orgánica para todos los estudiantes.",
    specialties: ["Química General", "Química Orgánica", "Fisicoquímica"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: false,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[5]],
    credentials: [
      { id: "cred-8-1", title: "Licenciatura en Química", institution: UNIVERSITIES[0], year: 2019, type: "degree", verified: true },
      { id: "cred-8-2", title: "Maestría en Química Analítica", institution: UNIVERSITIES[0], year: 2022, type: "degree", verified: true },
    ],
    availability: generateAvailability(7),
    recentReviews: [],
  },
  {
    id: "tutor-9",
    fullName: "Andrés Romero Díaz",
    avatarUrl: "https://randomuser.me/api/portraits/men/56.jpg",
    university: UNIVERSITIES[6],
    career: "Derecho",
    bio: "Abogado con experiencia en docencia universitaria. Te ayudo con derecho civil, constitucional y procesal de forma clara y con ejemplos de jurisprudencia real.",
    specialties: ["Derecho Civil", "Derecho Constitucional", "Derecho Procesal"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[13]],
    credentials: [
      { id: "cred-9-1", title: "Licenciatura en Derecho", institution: UNIVERSITIES[6], year: 2018, type: "degree", verified: true },
      { id: "cred-9-2", title: "Diploma en Arbitraje Comercial", institution: "Cámara de Comercio de Lima", year: 2021, type: "diploma", verified: true },
    ],
    availability: generateAvailability(8),
    recentReviews: [],
  },
  {
    id: "tutor-10",
    fullName: "Luciana Medina Torres",
    avatarUrl: "https://randomuser.me/api/portraits/women/51.jpg",
    university: UNIVERSITIES[1],
    career: "Lingüística e Idiomas",
    bio: "Profesora de inglés certificada con nivel C2. Mis clases son conversacionales y enfocadas en la confianza del estudiante. Preparo para TOEFL e IELTS.",
    specialties: ["Inglés Avanzado", "TOEFL", "IELTS", "Business English"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[11]],
    credentials: [
      { id: "cred-10-1", title: "Licenciatura en Lingüística", institution: UNIVERSITIES[1], year: 2019, type: "degree", verified: true },
      { id: "cred-10-2", title: "CELTA Certificate", institution: "Cambridge English", year: 2020, type: "certificate", verified: true },
      { id: "cred-10-3", title: "IELTS Academic Score 8.5", institution: "British Council", year: 2021, type: "certificate", verified: true },
    ],
    availability: generateAvailability(9),
    recentReviews: [],
  },
  {
    id: "tutor-11",
    fullName: "Rodrigo Espinoza Chávez",
    avatarUrl: "https://randomuser.me/api/portraits/men/64.jpg",
    university: UNIVERSITIES[7],
    career: "Ingeniería Electrónica",
    bio: "Ingeniero electrónico especializado en física y cálculo avanzado. Mi enfoque es resolver muchos ejercicios hasta que el tema quede 100% claro.",
    specialties: ["Física I", "Física II", "Cálculo II", "Circuitos Eléctricos"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 1,
    isVerified: false,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[3], MOCK_SUBJECTS[4], MOCK_SUBJECTS[1]],
    credentials: [
      { id: "cred-11-1", title: "Bachiller en Ingeniería Electrónica", institution: UNIVERSITIES[7], year: 2020, type: "degree", verified: true },
    ],
    availability: generateAvailability(10),
    recentReviews: [],
  },
  {
    id: "tutor-12",
    fullName: "Fernanda Ruiz Salazar",
    avatarUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    university: UNIVERSITIES[3],
    career: "Contabilidad y Finanzas",
    bio: "Contadora con CPA y experiencia en auditoría. Te enseño contabilidad de forma práctica y orientada al mundo laboral real. Especialista en NIIF.",
    specialties: ["Contabilidad", "Finanzas Corporativas", "Auditoría", "NIIF"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[10], MOCK_SUBJECTS[9]],
    credentials: [
      { id: "cred-12-1", title: "Licenciatura en Contabilidad", institution: UNIVERSITIES[3], year: 2018, type: "degree", verified: true },
      { id: "cred-12-2", title: "Certified Public Accountant (CPA)", institution: "AICPA", year: 2020, type: "certificate", verified: true },
      { id: "cred-12-3", title: "Diploma en NIIF", institution: "EY Academy", year: 2021, type: "diploma", verified: true },
    ],
    availability: generateAvailability(11),
    recentReviews: [],
  },
  {
    id: "tutor-13",
    fullName: "Gabriel Quispe Mamani",
    avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
    university: UNIVERSITIES[0],
    career: "Ingeniería de Software",
    bio: "Ingeniero de software en una startup tech. Enseño programación, bases de datos y desarrollo web con proyectos reales. Mi meta es que aprendas haciendo.",
    specialties: ["Programación", "Bases de Datos", "Desarrollo Web", "Git"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[6], MOCK_SUBJECTS[7], MOCK_SUBJECTS[14]],
    credentials: [
      { id: "cred-13-1", title: "Bachiller en Ingeniería de Software", institution: UNIVERSITIES[0], year: 2020, type: "degree", verified: true },
      { id: "cred-13-2", title: "AWS Solutions Architect Associate", institution: "Amazon Web Services", year: 2022, type: "certificate", verified: true },
    ],
    availability: generateAvailability(12),
    recentReviews: [],
  },
  {
    id: "tutor-14",
    fullName: "Paula Navarro Guzmán",
    avatarUrl: "https://randomuser.me/api/portraits/women/79.jpg",
    university: UNIVERSITIES[5],
    career: "Medicina Humana",
    bio: "Estudiante de medicina de último año. Tutora de biología celular y química para pre-médicos. Uso recursos visuales y casos clínicos para enseñar.",
    specialties: ["Biología Celular", "Anatomía", "Química", "Fisiología"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[12], MOCK_SUBJECTS[5]],
    credentials: [
      { id: "cred-14-1", title: "Estudiante de Medicina (12vo ciclo)", institution: UNIVERSITIES[5], year: 2025, type: "degree", verified: true },
      { id: "cred-14-2", title: "Certificado en Primeros Auxilios", institution: "Cruz Roja Peruana", year: 2023, type: "certificate", verified: true },
    ],
    availability: generateAvailability(13),
    recentReviews: [],
  },
  {
    id: "tutor-15",
    fullName: "Emilio Castillo Bravo",
    avatarUrl: "https://randomuser.me/api/portraits/men/85.jpg",
    university: UNIVERSITIES[2],
    career: "Matemática Aplicada",
    bio: "Matemático con enfoque computacional. Experto en cálculo multivariable, ecuaciones diferenciales y métodos numéricos. ¡Las matemáticas pueden ser divertidas!",
    specialties: ["Cálculo I", "Cálculo II", "Ecuaciones Diferenciales", "Métodos Numéricos"],
    rating: 0,
    totalReviews: 0,
    totalSessions: 1,
    isVerified: true,
    isAvailable: true,
    isFavorite: false,
    recommendationRate: 0,
    subjects: [MOCK_SUBJECTS[0], MOCK_SUBJECTS[1], MOCK_SUBJECTS[2], MOCK_SUBJECTS[8]],
    credentials: [
      { id: "cred-15-1", title: "Licenciatura en Matemática Aplicada", institution: UNIVERSITIES[2], year: 2017, type: "degree", verified: true },
      { id: "cred-15-2", title: "Maestría en Matemáticas Computacionales", institution: UNIVERSITIES[2], year: 2020, type: "degree", verified: true },
      { id: "cred-15-3", title: "Diploma en Ciencia de Datos", institution: "Stanford Online", year: 2022, type: "certificate", verified: true },
    ],
    availability: generateAvailability(14),
    recentReviews: [],
  },
];
