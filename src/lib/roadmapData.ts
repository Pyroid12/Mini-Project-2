export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  category?: string;
  type?: "recommended" | "alternative" | "optional";
  importance: "essential" | "recommended" | "optional" | "alternative";
  skills: string[];
  resources: { name: string; url?: string; type: "docs" | "course" | "article" | "video" }[];
  projectIdea?: string;
}

export interface RoadmapSection {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  nodes: RoadmapNode[];
}

export interface PopularRoadmapTemplate {
  id: string;
  roleId: string;
  title: string;
  tagline: string;
  description: string;
  badge?: string;
  difficulty: "Beginner Friendly" | "Intermediate" | "Advanced";
  estimatedDuration: string;
  topicsCount: number;
  iconName: string;
  primaryColor: string;
  popularTech: string[];
  sections: RoadmapSection[];
}

export const POPULAR_ROADMAPS: PopularRoadmapTemplate[] = [
  // 1. FRONTEND DEVELOPER
  {
    id: "frontend",
    roleId: "frontend-developer",
    title: "Frontend Developer",
    tagline: "Step by step guide to becoming a modern frontend developer in 2026",
    description: "Master modern client-side architectures, responsive design, JavaScript frameworks, browser performance, and web vitals.",
    badge: "Most Popular",
    difficulty: "Beginner Friendly",
    estimatedDuration: "6 - 9 Months",
    topicsCount: 12,
    iconName: "Layout",
    primaryColor: "#3B82F6",
    popularTech: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"],
    sections: [
      {
        id: "fe-internet",
        title: "1. How the Internet Works",
        subtitle: "Core networking fundamentals every web developer must understand",
        order: 1,
        nodes: [
          {
            id: "fe-net-1",
            title: "HTTP / HTTPS & DNS",
            description: "Understand requests, responses, status codes, SSL/TLS handshake, and domain name resolution.",
            importance: "essential",
            skills: ["HTTP Methods", "Status Codes", "DNS Lookup", "TLS/SSL"],
            resources: [
              { name: "MDN: How the Web Works", type: "docs" },
              { name: "HTTP Networking Crash Course", type: "video" }
            ],
            projectIdea: "Inspect network traffic of 3 different websites using Chrome DevTools Network tab."
          },
          {
            id: "fe-net-2",
            title: "Browsers & Rendering Engine",
            description: "How browsers parse HTML/CSS, construct DOM & CSSOM, and execute the Critical Rendering Path.",
            importance: "essential",
            skills: ["DOM Tree", "CSSOM", "Reflow & Repaint", "Event Loop"],
            resources: [
              { name: "web.dev: Critical Rendering Path", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fe-html",
        title: "2. HTML & Accessibility",
        subtitle: "The structural foundation of web pages",
        order: 2,
        nodes: [
          {
            id: "fe-html-1",
            title: "Semantic HTML5",
            description: "Use meaningful tags (<header>, <nav>, <main>, <article>, <footer>) instead of generic <div> containers.",
            importance: "essential",
            skills: ["Semantic Tags", "Forms & Input Types", "SEO Meta Tags"],
            resources: [
              { name: "MDN Semantic HTML Guide", type: "docs" }
            ],
            projectIdea: "Build a structured multi-page company landing page using pure semantic HTML."
          },
          {
            id: "fe-html-2",
            title: "Web Accessibility (a11y)",
            description: "Accessible Rich Internet Applications (ARIA), screen reader compatibility, and keyboard navigation.",
            importance: "recommended",
            skills: ["ARIA Roles", "Alt Text", "Keyboard Focus", "WCAG Standards"],
            resources: [
              { name: "W3C Web Accessibility Guidelines", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fe-css",
        title: "3. CSS & Modern Layouts",
        subtitle: "Styling, layouts, and responsive responsive viewports",
        order: 3,
        nodes: [
          {
            id: "fe-css-1",
            title: "Flexbox & CSS Grid",
            description: "Master modern CSS alignment, two-dimensional grids, and fluid layout distributions.",
            importance: "essential",
            skills: ["Flex Direction", "Justify Content", "Grid Template", "Gap"],
            resources: [
              { name: "CSS-Tricks: Complete Guide to Flexbox", type: "docs" },
              { name: "CSS-Tricks: Complete Guide to Grid", type: "docs" }
            ],
            projectIdea: "Recreate a responsive Bento Grid portfolio dashboard layout without frameworks."
          },
          {
            id: "fe-css-2",
            title: "Tailwind CSS & Utility-First CSS",
            description: "Rapidly style modern web applications using utility classes and design system tokens.",
            importance: "recommended",
            skills: ["Utility Classes", "Responsive Breakpoints", "Custom Themes"],
            resources: [
              { name: "Tailwind CSS Official Documentation", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fe-js",
        title: "4. JavaScript & TypeScript",
        subtitle: "The programming language of the web",
        order: 4,
        nodes: [
          {
            id: "fe-js-1",
            title: "Modern JavaScript (ES6+)",
            description: "Closures, Prototypes, Promises, Async/Await, Destructuring, and Array methods.",
            importance: "essential",
            skills: ["Promises", "Async/Await", "Event Bubbling", "Modules"],
            resources: [
              { name: "JavaScript.info Modern Tutorial", type: "docs" }
            ],
            projectIdea: "Build an interactive Kanban board with drag-and-drop and localStorage persistence."
          },
          {
            id: "fe-js-2",
            title: "TypeScript Essentials",
            description: "Strong typing, Interfaces, Generics, and Union types for enterprise web codebases.",
            importance: "essential",
            skills: ["Type Annotations", "Generics", "Utility Types", "TSConfig"],
            resources: [
              { name: "TypeScript Handbook", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fe-react",
        title: "5. React & Component Architecture",
        subtitle: "Industry standard UI component framework",
        order: 5,
        nodes: [
          {
            id: "fe-react-1",
            title: "React Hooks & State",
            description: "Master useState, useEffect, useCallback, useMemo, custom hooks, and Context API.",
            importance: "essential",
            skills: ["useState", "useEffect", "Custom Hooks", "React Fiber"],
            resources: [
              { name: "React.dev Official Interactive Guide", type: "docs" }
            ],
            projectIdea: "Build an E-Commerce storefront with shopping cart, filter drawer, and mock checkout."
          },
          {
            id: "fe-react-2",
            title: "Next.js & Server Components",
            description: "App Router, SSR, Server Actions, Dynamic Routes, and Turbopack bundler.",
            importance: "essential",
            skills: ["App Router", "Server Actions", "Streaming SSR", "Route Handlers"],
            resources: [
              { name: "Next.js App Router Documentation", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fe-testing",
        title: "6. Testing & Web Performance",
        subtitle: "Ensuring speed, resilience, and reliability",
        order: 6,
        nodes: [
          {
            id: "fe-test-1",
            title: "Testing (Vitest & Playwright)",
            description: "Unit testing pure functions, component testing, and end-to-end browser workflows.",
            importance: "recommended",
            skills: ["Vitest", "React Testing Library", "Playwright E2E"],
            resources: [
              { name: "Testing JavaScript by Kent C. Dodds", type: "course" }
            ]
          },
          {
            id: "fe-perf-1",
            title: "Web Vitals & Performance",
            description: "LCP, FID/INP, CLS, Code Splitting, Image Optimization, and Lighthouse Auditing.",
            importance: "recommended",
            skills: ["Core Web Vitals", "Lighthouse", "Lazy Loading", "Tree Shaking"],
            resources: [
              { name: "web.dev: Learn Performance", type: "docs" }
            ]
          }
        ]
      }
    ]
  },

  // 2. BACKEND DEVELOPER
  {
    id: "backend",
    roleId: "backend-developer",
    title: "Backend Developer",
    tagline: "Master server architecture, APIs, databases, caching, and scalable services",
    description: "Learn Node.js/Express, relational and NoSQL databases, RESTful and GraphQL APIs, authentication, and caching systems.",
    badge: "High Demand",
    difficulty: "Intermediate",
    estimatedDuration: "6 - 10 Months",
    topicsCount: 14,
    iconName: "Server",
    primaryColor: "#10B981",
    popularTech: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "REST / GraphQL", "JWT"],
    sections: [
      {
        id: "be-lang",
        title: "1. Server Runtimes & Languages",
        subtitle: "Choose your primary backend execution runtime",
        order: 1,
        nodes: [
          {
            id: "be-node-1",
            title: "Node.js & Express / Fastify",
            description: "Event Loop, Libuv, asynchronous I/O, middleware pipelines, and HTTP servers.",
            importance: "essential",
            skills: ["Node.js Event Loop", "Streams & Buffers", "Express Middleware"],
            resources: [
              { name: "Node.js Official Guides", type: "docs" }
            ],
            projectIdea: "Build a scalable REST API with rate-limiting, CORS, and request validation middleware."
          },
          {
            id: "be-alt-1",
            title: "Go (Golang) / Python",
            description: "Alternative high-performance backend languages for concurrent microservices.",
            importance: "alternative",
            skills: ["Goroutines", "FastAPI", "Asyncio"],
            resources: [
              { name: "Go by Example", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "be-db",
        title: "2. Databases & Storage",
        subtitle: "Relational, NoSQL, and vector storage engines",
        order: 2,
        nodes: [
          {
            id: "be-pg-1",
            title: "PostgreSQL & Relational SQL",
            description: "Schema design, normalization, ACID transactions, indexing (B-Tree), and join strategies.",
            importance: "essential",
            skills: ["SQL Queries", "Foreign Keys", "Indexes", "Prisma / Drizzle ORM"],
            resources: [
              { name: "PostgreSQL Tutorial for Developers", type: "docs" }
            ],
            projectIdea: "Design an inventory management schema with optimistic locking and transaction rollbacks."
          },
          {
            id: "be-nosql-1",
            title: "MongoDB & Document Stores",
            description: "Aggregation pipelines, schema-less flexibility, and sharding strategies.",
            importance: "recommended",
            skills: ["Aggregation Pipeline", "Mongoose", "Compound Indexes"],
            resources: [
              { name: "MongoDB University Basics", type: "course" }
            ]
          }
        ]
      },
      {
        id: "be-cache",
        title: "3. Caching & Message Brokers",
        subtitle: "High throughput and distributed asynchronous jobs",
        order: 3,
        nodes: [
          {
            id: "be-redis-1",
            title: "Redis In-Memory Caching",
            description: "Cache invalidation strategies (TTL, LRU), pub/sub, session management, and rate-limiting.",
            importance: "essential",
            skills: ["Redis Keys & Data Types", "Cache-Aside Pattern", "Redis Streams"],
            resources: [
              { name: "Redis University: RU101", type: "course" }
            ]
          },
          {
            id: "be-queue-1",
            title: "RabbitMQ / Apache Kafka",
            description: "Message queues, worker consumers, event-driven decoupling, and dead-letter queues.",
            importance: "recommended",
            skills: ["Event Driven Architecture", "Producers & Consumers", "Topic Exchanges"],
            resources: [
              { name: "Kafka The Definitive Guide", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "be-auth",
        title: "4. Authentication & Security",
        subtitle: "Protecting routes, users, and secrets",
        order: 4,
        nodes: [
          {
            id: "be-jwt-1",
            title: "JWT, OAuth2 & Sessions",
            description: "Access & Refresh tokens, HTTP-only cookies, password hashing (Argon2/bcrypt), and role permissions.",
            importance: "essential",
            skills: ["JWT Signing", "OAuth2 Flow", "Bcrypt Hashing", "RBAC"],
            resources: [
              { name: "OWASP Authentication Cheat Sheet", type: "docs" }
            ],
            projectIdea: "Build an auth microservice with token rotation, refresh tokens, and Google OAuth login."
          }
        ]
      }
    ]
  },

  // 3. FULL-STACK DEVELOPER
  {
    id: "full-stack",
    roleId: "full-stack-developer",
    title: "Full-Stack Developer",
    tagline: "End-to-end development across frontend, backend, databases, and deployment",
    description: "Bridging client interfaces with server logic, cloud storage, API integrations, and database schemas.",
    badge: "Most Versatile",
    difficulty: "Intermediate",
    estimatedDuration: "8 - 12 Months",
    topicsCount: 16,
    iconName: "Layers",
    primaryColor: "#635BFF",
    popularTech: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS"],
    sections: [
      {
        id: "fs-web",
        title: "1. Modern Frontend Core",
        subtitle: "TypeScript, React, Next.js App Router, and responsive layouts",
        order: 1,
        nodes: [
          {
            id: "fs-fe-1",
            title: "TypeScript & React 19",
            description: "Full type safety across client UI, state management, and reusable component libraries.",
            importance: "essential",
            skills: ["TypeScript", "React Hooks", "Tailwind CSS", "Zustand"],
            resources: [
              { name: "React Documentation", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "fs-backend",
        title: "2. Full-Stack Frameworks & APIs",
        subtitle: "Server Actions, Route Handlers, and API contracts",
        order: 2,
        nodes: [
          {
            id: "fs-srv-1",
            title: "Next.js Server Actions & APIs",
            description: "Call server functions directly from client forms without separate boilerplate endpoints.",
            importance: "essential",
            skills: ["Server Actions", "Route Handlers", "Zod Validation", "TanStack Query"],
            resources: [
              { name: "Next.js Data Mutation Guide", type: "docs" }
            ],
            projectIdea: "Build a Full-Stack Collaborative Document Workspace like Notion with real-time updates."
          }
        ]
      },
      {
        id: "fs-db",
        title: "3. Database & Cloud Deployment",
        subtitle: "Relational persistence, migrations, and CI/CD pipelines",
        order: 3,
        nodes: [
          {
            id: "fs-db-1",
            title: "PostgreSQL with Prisma / Drizzle",
            description: "Automated schema migrations, type-safe queries, relation joins, and indexing.",
            importance: "essential",
            skills: ["Prisma Client", "Schema Migrations", "PostgreSQL Indexes"],
            resources: [
              { name: "Prisma Quickstart Guide", type: "docs" }
            ]
          },
          {
            id: "fs-deploy-1",
            title: "Deployment & Docker",
            description: "Containerize applications and deploy to Vercel, Supabase, Neon, or AWS ECS.",
            importance: "recommended",
            skills: ["Dockerfile", "Environment Variables", "Vercel / Cloudflare"],
            resources: [
              { name: "Docker 101", type: "docs" }
            ]
          }
        ]
      }
    ]
  },

  // 4. DEVOPS ENGINEER
  {
    id: "devops",
    roleId: "devops-engineer",
    title: "DevOps Engineer",
    tagline: "Automate infrastructure, CI/CD pipelines, container orchestration, and observability",
    description: "Bridging development and operations with Linux, Docker, Kubernetes, Terraform, AWS, and Prometheus.",
    badge: "High Salary",
    difficulty: "Advanced",
    estimatedDuration: "8 - 12 Months",
    topicsCount: 15,
    iconName: "GitMerge",
    primaryColor: "#F59E0B",
    popularTech: ["Linux", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "AWS", "Prometheus"],
    sections: [
      {
        id: "devops-linux",
        title: "1. Linux & Bash Scripting",
        subtitle: "The operating system foundation of modern cloud infrastructure",
        order: 1,
        nodes: [
          {
            id: "dops-lin-1",
            title: "Linux CLI & System Administration",
            description: "File permissions, SSH key management, process signals (systemd), and networking tools (curl, netstat).",
            importance: "essential",
            skills: ["Bash Scripting", "Systemd", "Cron Jobs", "SSH Tunneling"],
            resources: [
              { name: "Linux Journey Interactive Course", type: "course" }
            ]
          }
        ]
      },
      {
        id: "devops-containers",
        title: "2. Containers & Orchestration",
        subtitle: "Package apps consistently and run them at scale",
        order: 2,
        nodes: [
          {
            id: "dops-dock-1",
            title: "Docker & Containerization",
            description: "Multi-stage Dockerfiles, image optimization, layers, volume mounts, and Docker Compose.",
            importance: "essential",
            skills: ["Multi-stage Builds", "Docker Compose", "Image Security"],
            resources: [
              { name: "Docker Official Docs", type: "docs" }
            ],
            projectIdea: "Containerize a microservices app with backend, frontend, PostgreSQL, and Redis in compose."
          },
          {
            id: "dops-k8s-1",
            title: "Kubernetes (K8s)",
            description: "Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and Helm package manager.",
            importance: "essential",
            skills: ["K8s Pods", "Deployments", "Ingress Controllers", "Helm Charts"],
            resources: [
              { name: "Kubernetes Official Tutorials", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "devops-cicd",
        title: "3. CI/CD & Infrastructure as Code",
        subtitle: "Automate code shipping and cloud provisioning",
        order: 3,
        nodes: [
          {
            id: "dops-ci-1",
            title: "GitHub Actions & GitLab CI",
            description: "Workflows, automated testing, lint checks, docker build & push, and blue-green deployments.",
            importance: "essential",
            skills: ["YAML Workflows", "Runner Secrets", "Artifact Caching"],
            resources: [
              { name: "GitHub Actions Guide", type: "docs" }
            ]
          },
          {
            id: "dops-iac-1",
            title: "Terraform & Cloud Providers (AWS)",
            description: "HCL syntax, state management, provider modules, EC2, S3, RDS, VPC, and IAM policies.",
            importance: "essential",
            skills: ["Terraform State", "AWS VPC", "IAM Policies", "S3 Buckets"],
            resources: [
              { name: "HashiCorp Learn: Terraform", type: "course" }
            ]
          }
        ]
      }
    ]
  },

  // 5. AI & MACHINE LEARNING ENGINEER
  {
    id: "ai-ml",
    roleId: "ai-ml-engineer",
    title: "AI & ML Engineer",
    tagline: "Build, train, fine-tune, and deploy intelligent neural networks and LLMs",
    description: "From Python & linear algebra to PyTorch, Transformers, HuggingFace, RAG pipelines, and model inference.",
    badge: "Trending 2026",
    difficulty: "Advanced",
    estimatedDuration: "9 - 14 Months",
    topicsCount: 16,
    iconName: "BrainCircuit",
    primaryColor: "#8B5CF6",
    popularTech: ["Python", "PyTorch", "Hugging Face", "LangChain", "Vector DBs", "NumPy", "Transformers"],
    sections: [
      {
        id: "aiml-math",
        title: "1. Math & Python Fundamentals",
        subtitle: "The quantitative groundwork for machine learning",
        order: 1,
        nodes: [
          {
            id: "aiml-py-1",
            title: "Python Data Stack (NumPy & Pandas)",
            description: "Vectorized operations, multidimensional tensors, data cleaning, and statistical distributions.",
            importance: "essential",
            skills: ["NumPy Arrays", "Pandas DataFrames", "Matrix Multiplication"],
            resources: [
              { name: "Python Data Science Handbook", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "aiml-dl",
        title: "2. Deep Learning & PyTorch",
        subtitle: "Neural architectures, loss functions, and gradient descent",
        order: 2,
        nodes: [
          {
            id: "aiml-torch-1",
            title: "PyTorch & Neural Networks",
            description: "Autograd, Backpropagation, CNNs for computer vision, RNNs/LSTMs, and training loops.",
            importance: "essential",
            skills: ["Tensors", "Optimizers", "Loss Functions", "CUDA Acceleration"],
            resources: [
              { name: "Deep Learning with PyTorch by Fast.ai", type: "course" }
            ],
            projectIdea: "Train an end-to-end image classifier on custom dataset using PyTorch & transfer learning."
          }
        ]
      },
      {
        id: "aiml-genai",
        title: "3. GenAI, LLMs & RAG Architectures",
        subtitle: "Transformers, embeddings, fine-tuning, and production agents",
        order: 3,
        nodes: [
          {
            id: "aiml-llm-1",
            title: "Transformers & HuggingFace",
            description: "Self-attention mechanisms, tokenization, BERT/GPT architectures, and pre-trained models.",
            importance: "essential",
            skills: ["Self-Attention", "Hugging Face Transformers", "Fine-Tuning LoRA"],
            resources: [
              { name: "Hugging Face NLP Course", type: "course" }
            ]
          },
          {
            id: "aiml-rag-1",
            title: "RAG & Vector Search",
            description: "Document chunking, dense vector embeddings, vector databases (Pinecone, Qdrant), and LangChain.",
            importance: "essential",
            skills: ["Embeddings", "Vector DBs", "Cosine Similarity", "Prompt Engineering"],
            resources: [
              { name: "LangChain Documentation", type: "docs" }
            ],
            projectIdea: "Build a domain-specific Q&A copilot using Gemini API, vector embeddings, and local documents."
          }
        ]
      }
    ]
  },

  // 6. DATA ENGINEER
  {
    id: "data-engineer",
    roleId: "data-engineer",
    title: "Data Engineer",
    tagline: "Design robust data lakes, real-time streaming pipelines, and warehouse architectures",
    description: "Extract, transform, and load petabytes of data using SQL, Apache Spark, Airflow, Snowflake, and dbt.",
    badge: "Enterprise Need",
    difficulty: "Intermediate",
    estimatedDuration: "7 - 11 Months",
    topicsCount: 14,
    iconName: "Database",
    primaryColor: "#0EA5E9",
    popularTech: ["SQL", "Python", "Apache Spark", "Airflow", "Snowflake", "dbt", "Kafka"],
    sections: [
      {
        id: "de-sql",
        title: "1. Advanced SQL & Data Warehousing",
        subtitle: "Analytical schemas, window functions, and columnar databases",
        order: 1,
        nodes: [
          {
            id: "de-sql-1",
            title: "Advanced SQL & Dimensional Modeling",
            description: "Window functions (ROW_NUMBER, LAG, LEAD), Star & Snowflake schemas, SCD Type 2.",
            importance: "essential",
            skills: ["Window Functions", "Star Schema", "Fact & Dimension Tables"],
            resources: [
              { name: "The Data Warehouse Toolkit by Kimball", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "de-batch",
        title: "2. Big Data & Distributed Computing",
        subtitle: "Scale analytics with distributed compute engines",
        order: 2,
        nodes: [
          {
            id: "de-spark-1",
            title: "Apache Spark & PySpark",
            description: "RDDs, DataFrames, lazy evaluation, partitioning, shuffling, and distributed transformations.",
            importance: "essential",
            skills: ["PySpark", "Broadcast Joins", "Partitioning Strategies"],
            resources: [
              { name: "Spark: The Definitive Guide", type: "docs" }
            ],
            projectIdea: "Process a 10M record NYC taxi dataset with PySpark, aggregate metrics, and write Parquet outputs."
          }
        ]
      },
      {
        id: "de-orchestration",
        title: "3. Pipeline Orchestration & dbt",
        subtitle: "DAG scheduling, data quality tests, and ELT transformations",
        order: 3,
        nodes: [
          {
            id: "de-air-1",
            title: "Apache Airflow & dbt",
            description: "Define DAGs, automated task retries, data lineage, incremental models, and schema tests.",
            importance: "essential",
            skills: ["Airflow DAGs", "dbt Models", "Data Quality Tests"],
            resources: [
              { name: "Astronomer: Learn Airflow", type: "docs" }
            ]
          }
        ]
      }
    ]
  },

  // 7. ANDROID DEVELOPER
  {
    id: "android",
    roleId: "android-developer",
    title: "Android Developer",
    tagline: "Build native mobile experiences using Kotlin, Jetpack Compose, and modern architecture",
    description: "Create fluid, reactive Android apps using Kotlin coroutines, Clean Architecture, Room database, and Retrofit.",
    badge: "Mobile Pioneer",
    difficulty: "Beginner Friendly",
    estimatedDuration: "6 - 9 Months",
    topicsCount: 13,
    iconName: "Smartphone",
    primaryColor: "#22C55E",
    popularTech: ["Kotlin", "Jetpack Compose", "Coroutines & Flow", "Room DB", "Hilt", "Retrofit"],
    sections: [
      {
        id: "and-kt",
        title: "1. Kotlin Programming",
        subtitle: "The official first-class language for Android development",
        order: 1,
        nodes: [
          {
            id: "and-kt-1",
            title: "Kotlin Fundamentals & Coroutines",
            description: "Null safety, extension functions, sealed classes, Coroutines scopes, and Flow streams.",
            importance: "essential",
            skills: ["Null Safety", "Coroutines", "StateFlow", "Sealed Classes"],
            resources: [
              { name: "Kotlin Official Koans", type: "course" }
            ]
          }
        ]
      },
      {
        id: "and-ui",
        title: "2. Declarative UI with Jetpack Compose",
        subtitle: "Modern reactive UI building toolkit",
        order: 2,
        nodes: [
          {
            id: "and-ui-1",
            title: "Jetpack Compose UI",
            description: "Composable functions, State hoisting, Material Design 3, Modifiers, LazyColumns, and Animations.",
            importance: "essential",
            skills: ["Modifiers", "LazyColumn", "Material 3", "State Hoisting"],
            resources: [
              { name: "Google Android Compose Pathway", type: "course" }
            ],
            projectIdea: "Build a Cryptocurrency tracker app with live charts, search, and watchlist persistence."
          }
        ]
      },
      {
        id: "and-arch",
        title: "3. Architecture & Local Persistence",
        subtitle: "MVVM, Dependency Injection, and offline storage",
        order: 3,
        nodes: [
          {
            id: "and-arch-1",
            title: "MVVM, Hilt & Room Database",
            description: "ViewModel, repository pattern, Dagger Hilt dependency injection, and SQLite ORM via Room.",
            importance: "essential",
            skills: ["MVVM", "Hilt DI", "Room Database", "Retrofit REST"],
            resources: [
              { name: "Android Architecture Components Guide", type: "docs" }
            ]
          }
        ]
      }
    ]
  },

  // 8. CYBERSECURITY SPECIALIST
  {
    id: "cybersecurity",
    roleId: "cybersecurity-specialist",
    title: "Cybersecurity Specialist",
    tagline: "Defend networks, analyze vulnerabilities, ethical hacking, and secure application code",
    description: "Learn penetration testing, cryptography, network forensics, OWASP top 10, SIEM, and incident response.",
    badge: "Critical Role",
    difficulty: "Advanced",
    estimatedDuration: "8 - 12 Months",
    topicsCount: 14,
    iconName: "ShieldAlert",
    primaryColor: "#EF4444",
    popularTech: ["Linux", "Wireshark", "Burp Suite", "OWASP Top 10", "Metasploit", "Cryptography", "Nmap"],
    sections: [
      {
        id: "sec-net",
        title: "1. Networking & Packet Analysis",
        subtitle: "Master OSI model, protocols, and packet sniffing",
        order: 1,
        nodes: [
          {
            id: "sec-net-1",
            title: "TCP/IP & Wireshark Forensics",
            description: "Subnetting, ARP, DNS, TCP handshakes, port scanning with Nmap, and packet capture analysis.",
            importance: "essential",
            skills: ["Wireshark", "Nmap", "TCP Flag Analysis", "Subnetting"],
            resources: [
              { name: "Professor Messer Security+ Course", type: "video" }
            ]
          }
        ]
      },
      {
        id: "sec-app",
        title: "2. Web Security & OWASP Top 10",
        subtitle: "Find and patch critical web application vulnerabilities",
        order: 2,
        nodes: [
          {
            id: "sec-web-1",
            title: "OWASP Top 10 & Burp Suite",
            description: "SQL Injection, Cross-Site Scripting (XSS), CSRF, IDOR, Broken Authentication, and SSRF exploits.",
            importance: "essential",
            skills: ["SQLi", "XSS", "IDOR Exploits", "Burp Suite Proxy"],
            resources: [
              { name: "PortSwigger Web Security Academy", type: "course" }
            ],
            projectIdea: "Solve 15 labs on PortSwigger Web Security Academy and write formal vulnerability reports."
          }
        ]
      },
      {
        id: "sec-def",
        title: "3. Defensive Security & SIEM",
        subtitle: "Threat detection, firewalls, and incident response",
        order: 3,
        nodes: [
          {
            id: "sec-siem-1",
            title: "SOC Operations & Cryptography",
            description: "Symmetric vs Asymmetric encryption, PKI certificates, Splunk logs, Snort IDS, and zero-trust.",
            importance: "recommended",
            skills: ["PKI Certificates", "SIEM Splunk", "Snort IDS Rules"],
            resources: [
              { name: "TryHackMe SOC Analyst Level 1", type: "course" }
            ]
          }
        ]
      }
    ]
  },

  // 9. CLOUD ARCHITECT / ENGINEER
  {
    id: "cloud",
    roleId: "cloud-architect",
    title: "Cloud Architect",
    tagline: "Design resilient, highly available, secure, and cost-optimized multi-region cloud architectures",
    description: "Master AWS/GCP services, serverless computing, VPC networking, auto-scaling, and disaster recovery.",
    badge: "High Impact",
    difficulty: "Advanced",
    estimatedDuration: "8 - 12 Months",
    topicsCount: 15,
    iconName: "Cloud",
    primaryColor: "#0284C7",
    popularTech: ["AWS", "Terraform", "Serverless Lambda", "VPC Networking", "Kubernetes", "IAM", "CloudWatch"],
    sections: [
      {
        id: "cld-compute",
        title: "1. Core Cloud Compute & Storage",
        subtitle: "Virtual machines, serverless execution, and object storage",
        order: 1,
        nodes: [
          {
            id: "cld-aws-1",
            title: "AWS EC2, S3 & Lambda",
            description: "Compute instances, autoscaling groups, S3 storage tiers, event-driven serverless functions.",
            importance: "essential",
            skills: ["EC2 Auto-scaling", "S3 Lifecycle Rules", "AWS Lambda"],
            resources: [
              { name: "AWS Certified Solutions Architect Course", type: "course" }
            ]
          }
        ]
      },
      {
        id: "cld-net",
        title: "2. Networking, Security & IAM",
        subtitle: "Virtual private clouds, subnets, routing tables, and zero-trust IAM",
        order: 2,
        nodes: [
          {
            id: "cld-vpc-1",
            title: "VPC Architecture & Gateway Routers",
            description: "Public and private subnets, NAT Gateways, Internet Gateways, Route53 DNS, and CloudFront CDN.",
            importance: "essential",
            skills: ["VPC Peering", "NAT Gateways", "CloudFront CDN", "Route 53"],
            resources: [
              { name: "AWS Networking Specialty Guides", type: "docs" }
            ],
            projectIdea: "Deploy a high-availability two-tier web application across two Availability Zones using Terraform."
          }
        ]
      },
      {
        id: "cld-resilience",
        title: "3. High Availability & Disaster Recovery",
        subtitle: "Multi-region failover, load balancing, and cost governance",
        order: 3,
        nodes: [
          {
            id: "cld-dr-1",
            title: "Well-Architected Framework",
            description: "RTO/RPO metrics, Multi-AZ database replicas, ALB/NLB load balancing, and AWS Cost Explorer.",
            importance: "essential",
            skills: ["Application Load Balancer", "RDS Multi-AZ", "Cost Optimization"],
            resources: [
              { name: "AWS Well-Architected Framework", type: "docs" }
            ]
          }
        ]
      }
    ]
  },

  // 10. DATA SCIENTIST
  {
    id: "data-scientist",
    roleId: "data-scientist",
    title: "Data Scientist",
    tagline: "Turn complex data into actionable business predictions, statistical models, and ML algorithms",
    description: "Hypothesis testing, exploratory data analysis, Scikit-Learn regression/classification, feature engineering, and storytelling.",
    badge: "Analytics Leader",
    difficulty: "Intermediate",
    estimatedDuration: "7 - 10 Months",
    topicsCount: 14,
    iconName: "TrendingUp",
    primaryColor: "#EC4899",
    popularTech: ["Python", "Pandas", "Scikit-Learn", "Jupyter", "SQL", "Seaborn", "Statsmodels"],
    sections: [
      {
        id: "ds-eda",
        title: "1. Statistics & Exploratory Data Analysis (EDA)",
        subtitle: "Distributions, hypothesis tests, and insightful visual storytelling",
        order: 1,
        nodes: [
          {
            id: "ds-stat-1",
            title: "Hypothesis Testing & Statistical Inference",
            description: "P-values, Confidence Intervals, A/B Testing methodologies, Normal distributions, and Central Limit Theorem.",
            importance: "essential",
            skills: ["P-values", "A/B Testing", "T-tests & ANOVA", "Seaborn Visuals"],
            resources: [
              { name: "Khan Academy: Statistics and Probability", type: "course" }
            ],
            projectIdea: "Conduct a full A/B testing analysis on a conversion dataset and draft an executive finding report."
          }
        ]
      },
      {
        id: "ds-ml",
        title: "2. Classical Machine Learning with Scikit-Learn",
        subtitle: "Supervised and unsupervised predictive modeling",
        order: 2,
        nodes: [
          {
            id: "ds-model-1",
            title: "Classification, Regression & Ensembles",
            description: "Linear/Logistic Regression, Decision Trees, Random Forests, XGBoost, and hyperparameter tuning.",
            importance: "essential",
            skills: ["Random Forests", "XGBoost", "Cross-Validation", "ROC-AUC"],
            resources: [
              { name: "Hands-On Machine Learning with Scikit-Learn", type: "docs" }
            ]
          }
        ]
      },
      {
        id: "ds-feat",
        title: "3. Feature Engineering & Model Explainability",
        subtitle: "Transform raw inputs and explain model decisions to business stakeholders",
        order: 3,
        nodes: [
          {
            id: "ds-exp-1",
            title: "Feature Engineering & SHAP / LIME",
            description: "One-Hot Encoding, missing value imputation, outlier clipping, and SHAP feature importance interpretability.",
            importance: "recommended",
            skills: ["Feature Scaling", "SHAP Values", "PCA Dimensionality Reduction"],
            resources: [
              { name: "Interpretable Machine Learning Book", type: "docs" }
            ]
          }
        ]
      }
    ]
  }
];
