export type ResourceCategory =
  | "Tecnicas de Estudio"
  | "Preparacion de Examenes"
  | "Productividad";

export interface Resource {
  slug: string;
  title: string;
  excerpt: string;
  category: ResourceCategory;
  date: string;
  readTime: string;
  coverImage: string;
  coverAlt: string;
  coverBgColor: string;
  content: ResourceContent[];
}

export type ResourceContent =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title: string; text: string; variant: "tip" | "warning" | "info" }
  | { type: "image"; src: string; alt: string; caption?: string };

export const CATEGORIES: ResourceCategory[] = [
  "Tecnicas de Estudio",
  "Preparacion de Examenes",
  "Productividad",
];

export const resources: Resource[] = [
  {
    slug: "10-tips-para-estudiar-mejor",
    title: "10 tips respaldados por la ciencia para estudiar de forma mas efectiva",
    excerpt:
      "Descubre las tecnicas de estudio que realmente funcionan segun la neurociencia. Desde el espaciado activo hasta la tecnica de Feynman, transforma tu forma de aprender.",
    category: "Tecnicas de Estudio",
    date: "Feb 15, 2026",
    readTime: "8 min de lectura",
    coverImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    coverAlt: "Estudiante tomando notas en una biblioteca moderna",
    coverBgColor: "bg-indigo-100",
    content: [
      {
        type: "paragraph",
        text: "Estudiar no se trata de pasar horas frente a un libro. La ciencia ha demostrado que ciertas estrategias son mucho mas efectivas que otras. Aqui te presentamos 10 tecnicas respaldadas por investigaciones en neurociencia y psicologia cognitiva que pueden transformar completamente tu rendimiento academico.",
      },
      {
        type: "heading",
        text: "1. Repeticion espaciada: el poder del tiempo",
      },
      {
        type: "paragraph",
        text: "En lugar de estudiar todo en una sola sesion (el famoso 'atracón'), distribuye tu estudio en varias sesiones cortas a lo largo de dias o semanas. La curva del olvido de Ebbinghaus demuestra que olvidamos rapidamente lo que aprendemos si no lo repasamos. La repeticion espaciada aprovecha este fenomeno para fortalecer las conexiones neuronales.",
      },
      {
        type: "callout",
        title: "Como aplicarlo",
        text: "Estudia un tema hoy, repasalo manana, luego en 3 dias, luego en una semana. Usa apps como Anki para automatizar este proceso con tarjetas de estudio.",
        variant: "tip",
      },
      {
        type: "heading",
        text: "2. Recuerdo activo: pon a prueba tu memoria",
      },
      {
        type: "paragraph",
        text: "Cerrar el libro e intentar recordar lo que leiste es mucho mas efectivo que releer. Cuando te esfuerzas por recuperar informacion de tu memoria, fortaleces las vias neuronales asociadas a ese conocimiento. Esto se conoce como 'testing effect' o efecto de evaluacion.",
      },
      {
        type: "list",
        items: [
          "Escribe todo lo que recuerdes despues de leer un capitulo",
          "Usa flashcards con preguntas, no solo definiciones",
          "Explicale el tema a un companero sin mirar tus notas",
          "Hazte preguntas tipo examen mientras estudias",
        ],
      },
      {
        type: "heading",
        text: "3. La tecnica de Feynman: aprende ensenando",
      },
      {
        type: "paragraph",
        text: "Richard Feynman, premio Nobel de Fisica, creia que si no puedes explicar algo de forma simple, no lo entiendes. Su tecnica consiste en intentar explicar un concepto como si le hablaras a un nino de 12 anos. Cuando te trabas, identificas exactamente donde esta tu brecha de conocimiento.",
      },
      {
        type: "callout",
        title: "Los 4 pasos de Feynman",
        text: "1) Elige un concepto y escribelo como titulo. 2) Explicalo en palabras simples, como si ensenaras. 3) Identifica donde te trabas y vuelve al material. 4) Simplifica y usa analogias.",
        variant: "info",
      },
      {
        type: "heading",
        text: "4. Intercalado: mezcla tus temas de estudio",
      },
      {
        type: "paragraph",
        text: "Estudiar un solo tema por sesion puede sentirse comodo, pero mezclar diferentes temas o tipos de problemas (intercalado) mejora tu capacidad de distinguir entre conceptos y aplicarlos correctamente. Esto es especialmente util en matematicas, ciencias y programacion.",
      },
      {
        type: "heading",
        text: "5. Elaboracion: conecta con lo que ya sabes",
      },
      {
        type: "paragraph",
        text: "Preguntate constantemente '¿por que?' y '¿como se relaciona esto con lo que ya se?'. Crear conexiones entre conceptos nuevos y conocimiento previo genera una red de conocimiento mas solida y facilita la recuperacion de informacion.",
      },
      {
        type: "heading",
        text: "6. Mapas mentales y visualizacion",
      },
      {
        type: "paragraph",
        text: "El cerebro procesa informacion visual 60,000 veces mas rapido que el texto. Crear mapas mentales, diagramas y esquemas activa multiples areas cerebrales y mejora la comprension de relaciones complejas entre conceptos.",
      },
      {
        type: "heading",
        text: "7. La tecnica Pomodoro: trabaja con el tiempo, no contra el",
      },
      {
        type: "paragraph",
        text: "Estudia en bloques de 25 minutos de concentracion total seguidos de 5 minutos de descanso. Cada 4 pomodoros, toma un descanso largo de 15-30 minutos. Esta tecnica combate la fatiga mental y mantiene tu enfoque al maximo.",
      },
      {
        type: "heading",
        text: "8. Ambiente de estudio optimizado",
      },
      {
        type: "list",
        items: [
          "Iluminacion natural o luz blanca fria para mantener la alerta",
          "Temperatura entre 20-22°C es ideal para la concentracion",
          "Silencio o ruido blanco/musica sin letra",
          "Escritorio ordenado: reduce la carga cognitiva",
          "Telefono en otra habitacion o en modo avion",
        ],
      },
      {
        type: "heading",
        text: "9. Sueno: tu arma secreta",
      },
      {
        type: "paragraph",
        text: "Durante el sueno, tu cerebro consolida la informacion aprendida durante el dia. Dormir menos de 7 horas reduce drasticamente tu capacidad de memoria y concentracion. Una siesta de 20 minutos despues de estudiar puede mejorar la retencion hasta un 30%.",
      },
      {
        type: "callout",
        title: "Dato importante",
        text: "Estudiar toda la noche antes de un examen es contraproducente. Tu cerebro necesita sueno para transferir informacion de la memoria a corto plazo a la memoria a largo plazo.",
        variant: "warning",
      },
      {
        type: "heading",
        text: "10. Ejercicio fisico y alimentacion",
      },
      {
        type: "paragraph",
        text: "30 minutos de ejercicio aerobico antes de estudiar aumenta el flujo sanguineo al cerebro y libera BDNF, una proteina que favorece la creacion de nuevas conexiones neuronales. Combina esto con una alimentacion rica en omega-3, frutas y verduras para potenciar tu rendimiento cognitivo.",
      },
      {
        type: "quote",
        text: "El aprendizaje no es un sprint, es un maraton. Las tecnicas correctas te permiten correr mas rapido sin agotarte.",
        author: "Dr. Barbara Oakley, Aprendiendo a aprender",
      },
    ],
  },
  {
    slug: "como-rendir-un-examen-correctamente",
    title: "Guia definitiva: como prepararte y rendir un examen con confianza",
    excerpt:
      "Desde la preparacion semanas antes hasta las estrategias durante el examen. Aprende a manejar la ansiedad, distribuir tu tiempo y maximizar tu puntaje.",
    category: "Preparacion de Examenes",
    date: "Feb 10, 2026",
    readTime: "10 min de lectura",
    coverImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    coverAlt: "Estudiante concentrado escribiendo un examen",
    coverBgColor: "bg-amber-100",
    content: [
      {
        type: "paragraph",
        text: "Los examenes no tienen que ser una fuente de estres paralizante. Con la preparacion adecuada y las estrategias correctas durante la evaluacion, puedes enfrentar cualquier examen con confianza. Esta guia te lleva paso a paso desde semanas antes hasta el momento de entregar tu hoja.",
      },
      {
        type: "heading",
        text: "Fase 1: Preparacion (2-3 semanas antes)",
      },
      {
        type: "subheading",
        text: "Organiza tu material de estudio",
      },
      {
        type: "paragraph",
        text: "Antes de empezar a estudiar, necesitas saber exactamente que entra en el examen. Recopila el syllabus, apuntes de clase, presentaciones del profesor y cualquier material complementario. Crea un indice de todos los temas y marca los que el profesor enfatizo mas en clase.",
      },
      {
        type: "callout",
        title: "Estrategia clave",
        text: "Preguntale directamente al profesor: '¿Cuales son los temas mas importantes del examen?' La mayoria de profesores responden con pistas valiosas. Tambien revisa examenes anteriores si estan disponibles.",
        variant: "tip",
      },
      {
        type: "subheading",
        text: "Crea un plan de estudio realista",
      },
      {
        type: "list",
        items: [
          "Divide el contenido en bloques manejables (1-2 temas por sesion)",
          "Asigna mas tiempo a los temas mas dificiles o con mayor peso",
          "Incluye dias de repaso general, no solo estudio nuevo",
          "Deja el ultimo dia solo para repaso ligero, no para aprender cosas nuevas",
          "Planifica pausas y actividades de desconexion",
        ],
      },
      {
        type: "heading",
        text: "Fase 2: Estudio activo (1-2 semanas antes)",
      },
      {
        type: "subheading",
        text: "Practica con examenes simulados",
      },
      {
        type: "paragraph",
        text: "La mejor forma de prepararte para un examen es... hacer examenes. Busca examenes anteriores, crea tus propias preguntas o pide a un companero que te haga preguntas. Simula las condiciones reales: mismo tiempo limite, sin apuntes, en silencio.",
      },
      {
        type: "callout",
        title: "La regla 3-2-1",
        text: "3 dias antes: repaso general de todos los temas. 2 dias antes: enfocate en tus puntos debiles. 1 dia antes: solo repaso ligero y descanso. No estudies cosas nuevas el dia anterior.",
        variant: "info",
      },
      {
        type: "subheading",
        text: "Ensenale a alguien mas",
      },
      {
        type: "paragraph",
        text: "Forma un grupo de estudio donde cada miembro explique un tema diferente. Ensenar te obliga a organizar tus ideas, identificar brechas en tu comprension y reforzar lo que ya sabes. Si no tienes grupo, explicale a un peluche, a tu mascota o grabate en video.",
      },
      {
        type: "heading",
        text: "Fase 3: La noche anterior y la manana del examen",
      },
      {
        type: "list",
        items: [
          "Duerme minimo 7-8 horas, el sueno consolida la memoria",
          "Prepara todo la noche anterior: lapices, calculadora, DNI, botella de agua",
          "Desayuna bien: proteinas y carbohidratos complejos (huevos, avena, frutas)",
          "Llega 15-20 minutos antes para acomodarte y calmarte",
          "Evita repasar freneticamente en la puerta del aula, genera mas ansiedad",
        ],
      },
      {
        type: "heading",
        text: "Fase 4: Durante el examen",
      },
      {
        type: "subheading",
        text: "Los primeros 5 minutos son criticos",
      },
      {
        type: "paragraph",
        text: "No empieces a escribir inmediatamente. Lee TODO el examen primero. Identifica las preguntas que sabes bien, las que requieren mas pensamiento y las que no sabes. Asigna mentalmente el tiempo para cada seccion.",
      },
      {
        type: "callout",
        title: "Distribucion del tiempo",
        text: "Divide el tiempo total entre las preguntas segun su puntaje. Si una pregunta vale 20% del examen, dedicale ~20% de tu tiempo. Deja 5-10 minutos al final para revisar.",
        variant: "tip",
      },
      {
        type: "subheading",
        text: "Estrategias por tipo de pregunta",
      },
      {
        type: "paragraph",
        text: "Para preguntas de opcion multiple: lee todas las opciones antes de elegir, elimina las incorrectas primero, desconfia de opciones con palabras absolutas como 'siempre' o 'nunca'. Para preguntas de desarrollo: haz un mini-esquema antes de escribir, usa parrafos claros, responde exactamente lo que se pregunta.",
      },
      {
        type: "subheading",
        text: "Manejo de la ansiedad durante el examen",
      },
      {
        type: "paragraph",
        text: "Si sientes que la ansiedad te bloquea, para un momento. Respira profundamente 4-7-8 (inhala 4 segundos, sostén 7, exhala 8). Recuerda: la ansiedad moderada es normal y hasta puede mejorar tu rendimiento. Lo importante es no dejar que te paralice.",
      },
      {
        type: "list",
        items: [
          "Si te bloqueas en una pregunta, pasa a la siguiente y vuelve despues",
          "Escribe algo en preguntas que no sepas, un 0 seguro es peor que intentar",
          "Revisa tus respuestas al final, pero no cambies algo a menos que estes seguro del error",
          "Si terminas antes, usa el tiempo para revisar, no para salir primero",
        ],
      },
      {
        type: "heading",
        text: "Despues del examen: reflexion y mejora",
      },
      {
        type: "paragraph",
        text: "Cuando recibas tu nota, no solo mires el numero. Analiza que preguntas fallaste y por que. ¿Fue falta de estudio? ¿Mala comprension del concepto? ¿Error de lectura? Este analisis es invaluable para mejorar en el siguiente examen.",
      },
      {
        type: "quote",
        text: "Un examen no mide tu inteligencia, mide tu preparacion. Y la preparacion es algo que esta completamente en tus manos.",
        author: "EduConnect",
      },
    ],
  },
  {
    slug: "tecnicas-de-gestion-del-tiempo-para-universitarios",
    title: "Gestion del tiempo para universitarios: como hacer mas sin quemarte",
    excerpt:
      "Domina las tecnicas de productividad adaptadas a la vida universitaria. Aprende a priorizar, planificar y mantener un equilibrio saludable entre estudio y vida personal.",
    category: "Productividad",
    date: "Feb 5, 2026",
    readTime: "7 min de lectura",
    coverImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    coverAlt: "Agenda y planificador con tareas organizadas",
    coverBgColor: "bg-emerald-100",
    content: [
      {
        type: "paragraph",
        text: "La universidad no es solo estudiar. Entre clases, trabajos, vida social, quizas un empleo a medio tiempo y el sueno que nunca alcanza... gestionar tu tiempo se convierte en una habilidad de supervivencia. Estas tecnicas estan disenadas especificamente para la realidad del estudiante universitario.",
      },
      {
        type: "heading",
        text: "La matriz de Eisenhower: prioriza como un presidente",
      },
      {
        type: "paragraph",
        text: "Dwight Eisenhower dirigia un pais y aun asi encontraba tiempo para jugar golf. Su secreto: clasificar cada tarea en una matriz de 2x2 basada en urgencia e importancia.",
      },
      {
        type: "list",
        items: [
          "Urgente + Importante: Hazlo ya (examen manana, tarea con deadline hoy)",
          "Importante + No urgente: Planificalo (proyecto a largo plazo, estudiar con anticipacion)",
          "Urgente + No importante: Delegalo o hazlo rapido (responder emails, tramites)",
          "No urgente + No importante: Eliminalo (redes sociales sin proposito, series por inercia)",
        ],
      },
      {
        type: "callout",
        title: "El secreto esta en el cuadrante 2",
        text: "La mayoria de estudiantes viven en el cuadrante 1 (apagando incendios). El objetivo es pasar mas tiempo en el cuadrante 2, donde planificas con anticipacion y evitas crisis.",
        variant: "info",
      },
      {
        type: "heading",
        text: "Time blocking: tu calendario es tu mejor amigo",
      },
      {
        type: "paragraph",
        text: "En lugar de tener una lista de tareas infinita, asigna bloques especificos de tiempo en tu calendario para cada actividad. Esto incluye no solo estudio, sino comidas, ejercicio, tiempo libre y sueno. Lo que no esta en el calendario, no existe.",
      },
      {
        type: "callout",
        title: "Ejemplo de time blocking universitario",
        text: "7:00-8:00 Rutina matutina | 8:00-10:00 Clase | 10:00-10:30 Descanso | 10:30-12:30 Estudio profundo (materia dificil) | 12:30-13:30 Almuerzo | 13:30-15:30 Clase | 15:30-17:00 Trabajos y tareas | 17:00-18:00 Ejercicio | 18:00-20:00 Tiempo libre | 20:00-22:00 Repaso ligero | 22:00 Sueno",
        variant: "tip",
      },
      {
        type: "heading",
        text: "La regla de los 2 minutos",
      },
      {
        type: "paragraph",
        text: "Si una tarea toma menos de 2 minutos, hazla inmediatamente. Responder un mensaje del grupo, anotar una fecha de entrega, enviar un email al profesor. Estas micro-tareas acumuladas generan una carga mental enorme. Resolverlas al instante libera tu mente para enfocarte en lo importante.",
      },
      {
        type: "heading",
        text: "Batching: agrupa tareas similares",
      },
      {
        type: "paragraph",
        text: "Tu cerebro pierde eficiencia cada vez que cambias de contexto. En lugar de alternar entre estudiar, revisar emails, hacer una tarea y volver a estudiar, agrupa tareas similares. Dedica un bloque a leer, otro a resolver problemas, otro a tareas administrativas.",
      },
      {
        type: "heading",
        text: "La tecnica 'Eat the Frog': lo peor primero",
      },
      {
        type: "paragraph",
        text: "Mark Twain dijo: 'Si lo primero que haces en la manana es comerte un sapo, el resto del dia sera facil.' Identifica tu tarea mas dificil o menos atractiva y hazla primero, cuando tu energia y fuerza de voluntad estan al maximo.",
      },
      {
        type: "quote",
        text: "No se trata de tener mas tiempo, sino de gestionar mejor la energia que tienes disponible.",
        author: "Jim Loehr, The Power of Full Engagement",
      },
      {
        type: "heading",
        text: "Herramientas digitales recomendadas",
      },
      {
        type: "list",
        items: [
          "Notion o Google Calendar: para time blocking y planificacion semanal",
          "Todoist o TickTick: para listas de tareas con prioridades y fechas",
          "Forest o Focus Plant: para bloques de enfoque sin distracciones",
          "Anki: para repasos con repeticion espaciada",
          "Toggl Track: para saber en que realmente gastas tu tiempo",
        ],
      },
      {
        type: "heading",
        text: "El equilibrio: no todo es estudiar",
      },
      {
        type: "paragraph",
        text: "La productividad sin descanso es una receta para el burnout. Programa activamente tiempo para actividades que disfrutes: deporte, amigos, hobbies, o simplemente no hacer nada. Un estudiante descansado rinde 10x mas que uno agotado que estudia el doble de horas.",
      },
      {
        type: "callout",
        title: "Senal de alerta",
        text: "Si llevas mas de 3 dias sintiendote agotado, irritable o desmotivado, es tu cuerpo pidiendo descanso. Tomar un dia libre puede ser la decision mas productiva que hagas.",
        variant: "warning",
      },
      {
        type: "heading",
        text: "Plan de accion: empieza esta semana",
      },
      {
        type: "list",
        items: [
          "Domingo: planifica tu semana con time blocking (30 min)",
          "Lunes: aplica 'Eat the Frog' con tu tarea mas dificil",
          "Martes-Jueves: practica batching de tareas similares",
          "Viernes: revisa que funciono y que no",
          "Fin de semana: descansa y ajusta el plan para la proxima semana",
        ],
      },
      {
        type: "paragraph",
        text: "La gestion del tiempo es una habilidad, y como toda habilidad, mejora con la practica. No esperes ser perfecto desde el primer dia. Empieza con una o dos tecnicas, evalua que funciona para ti, y ve ajustando. En pocas semanas notaras una diferencia enorme en tu rendimiento y bienestar.",
      },
    ],
  },
];
