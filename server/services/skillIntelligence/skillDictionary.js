/**
 * Canonical Skill Dictionary
 * JobPortal 2.0 — Phase 4F Deterministic Skill Intelligence
 */

const { SKILL_CATEGORIES } = require("./skillIntelligenceConstants");

const CANONICAL_SKILL_DICTIONARY = [
  // ==========================================
  // PROGRAMMING & LANGUAGES
  // ==========================================
  {
    key: "javascript",
    name: "JavaScript",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["js", "ecmascript", "es6", "es6+", "vanillajs", "vanilla js", "modern javascript"],
    relatedSkills: ["typescript", "react", "node-js", "html5", "css3"],
  },
  {
    key: "typescript",
    name: "TypeScript",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["ts", "typescript 4", "typescript 5"],
    relatedSkills: ["javascript", "react", "node-js", "angular", "nestjs"],
  },
  {
    key: "python",
    name: "Python",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["py", "python3", "python 3", "python 3.x", "core python"],
    relatedSkills: ["django", "fastapi", "flask", "pandas", "numpy", "pytorch"],
  },
  {
    key: "java",
    name: "Java",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["core java", "java 8", "java 11", "java 17", "java 21", "j2se", "j2ee"],
    relatedSkills: ["spring-boot", "spring-framework", "hibernate", "junit", "microservices"],
  },
  {
    key: "cpp",
    name: "C++",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["c/c++", "cpp11", "cpp14", "cpp17", "cpp20", "c plus plus"],
    relatedSkills: ["c", "data-structures", "algorithms", "embedded-systems"],
  },
  {
    key: "c",
    name: "C",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["ansi c", "c language", "c programming"],
    relatedSkills: ["cpp", "embedded-systems", "linux"],
  },
  {
    key: "csharp",
    name: "C#",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["c# .net", "c-sharp", "c sharp", "c#.net"],
    relatedSkills: ["aspnet-core", "dotnet", "dotnet-core", "microsoft-sql-server"],
  },
  {
    key: "go",
    name: "Go",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["golang", "go programming", "go lang"],
    relatedSkills: ["docker", "kubernetes", "microservices", "grpc"],
  },
  {
    key: "rust",
    name: "Rust",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["rust lang", "rustlang"],
    relatedSkills: ["systems-programming", "wasm", "cpp"],
  },
  {
    key: "php",
    name: "PHP",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["php7", "php8", "core php", "php 8.x"],
    relatedSkills: ["laravel", "symfony", "mysql", "wordpress"],
  },
  {
    key: "ruby",
    name: "Ruby",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["ruby lang", "core ruby"],
    relatedSkills: ["ruby-on-rails", "postgresql"],
  },
  {
    key: "kotlin",
    name: "Kotlin",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["kotlin android", "kotlin multiplatform", "kmp"],
    relatedSkills: ["android", "java", "spring-boot"],
  },
  {
    key: "swift",
    name: "Swift",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["swift 5", "swiftui", "swift ui"],
    relatedSkills: ["ios", "objective-c", "xcode"],
  },
  {
    key: "sql",
    name: "SQL",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["structured query language", "ansi sql", "t-sql", "pl/sql", "plsql"],
    relatedSkills: ["postgresql", "mysql", "microsoft-sql-server", "oracle-database"],
  },
  {
    key: "bash",
    name: "Bash / Shell Scripting",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["bash", "shell", "shell script", "shell scripting", "sh", "zsh", "bash script"],
    relatedSkills: ["linux", "devops", "ci-cd"],
  },
  {
    key: "r",
    name: "R",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["r programming", "r language", "r-lang"],
    relatedSkills: ["statistics", "data-science", "data-analytics"],
  },
  {
    key: "scala",
    name: "Scala",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["scala lang"],
    relatedSkills: ["apache-spark", "java", "big-data"],
  },
  {
    key: "dart",
    name: "Dart",
    category: SKILL_CATEGORIES.PROGRAMMING,
    aliases: ["dart lang"],
    relatedSkills: ["flutter", "mobile"],
  },

  // ==========================================
  // FRONTEND ENGINEERING
  // ==========================================
  {
    key: "react",
    name: "React",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["reactjs", "react.js", "react js", "react 18", "react 19", "react framework"],
    relatedSkills: ["javascript", "typescript", "redux", "next-js", "tailwind-css", "html5", "css3"],
  },
  {
    key: "angular",
    name: "Angular",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["angularjs", "angular.js", "angular 2+", "angular 14", "angular 15", "angular 16", "angular 17"],
    relatedSkills: ["typescript", "rxjs", "javascript", "html5", "css3"],
  },
  {
    key: "vue",
    name: "Vue.js",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["vue", "vuejs", "vue 3", "vue.js 3", "vuejs 3"],
    relatedSkills: ["javascript", "nuxt-js", "pinia", "vuex", "html5", "css3"],
  },
  {
    key: "next-js",
    name: "Next.js",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["nextjs", "next.js", "next js", "next 13", "next 14", "next 15"],
    relatedSkills: ["react", "typescript", "tailwind-css", "node-js"],
  },
  {
    key: "svelte",
    name: "Svelte",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["sveltejs", "svelte.js", "sveltekit", "svelte kit"],
    relatedSkills: ["javascript", "typescript", "html5", "css3"],
  },
  {
    key: "redux",
    name: "Redux",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["redux toolkit", "rtk", "react-redux", "redux saga", "redux thunk"],
    relatedSkills: ["react", "javascript", "typescript"],
  },
  {
    key: "html5",
    name: "HTML5",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["html", "html 5", "semantic html"],
    relatedSkills: ["css3", "javascript", "frontend"],
  },
  {
    key: "css3",
    name: "CSS3",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["css", "css 3", "cascading style sheets"],
    relatedSkills: ["html5", "tailwind-css", "sass", "bootstrap"],
  },
  {
    key: "tailwind-css",
    name: "Tailwind CSS",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["tailwind", "tailwindcss", "tailwind-css"],
    relatedSkills: ["css3", "react", "next-js", "html5"],
  },
  {
    key: "bootstrap",
    name: "Bootstrap",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["bootstrap 4", "bootstrap 5", "twitter bootstrap"],
    relatedSkills: ["css3", "html5", "javascript"],
  },
  {
    key: "sass",
    name: "Sass / SCSS",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["sass", "scss", "syntactically awesome style sheets"],
    relatedSkills: ["css3", "html5"],
  },
  {
    key: "vite",
    name: "Vite",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["vitejs", "vite.js"],
    relatedSkills: ["react", "vue", "javascript", "typescript"],
  },
  {
    key: "webpack",
    name: "Webpack",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["webpack 5"],
    relatedSkills: ["javascript", "typescript", "babel"],
  },
  {
    key: "graphql",
    name: "GraphQL",
    category: SKILL_CATEGORIES.FRONTEND,
    aliases: ["apollo graphql", "apollo client", "relay"],
    relatedSkills: ["react", "node-js", "rest-apis"],
  },

  // ==========================================
  // BACKEND & SYSTEMS
  // ==========================================
  {
    key: "node-js",
    name: "Node.js",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["nodejs", "node.js", "node js", "node"],
    relatedSkills: ["express-js", "javascript", "typescript", "mongodb", "nestjs"],
  },
  {
    key: "express-js",
    name: "Express.js",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["express", "expressjs", "express.js", "express js"],
    relatedSkills: ["node-js", "javascript", "rest-apis", "mongodb"],
  },
  {
    key: "nestjs",
    name: "NestJS",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["nest.js", "nest js", "nest framework"],
    relatedSkills: ["typescript", "node-js", "postgresql", "rest-apis"],
  },
  {
    key: "django",
    name: "Django",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["django rest framework", "drf", "django-rest-framework"],
    relatedSkills: ["python", "postgresql", "rest-apis"],
  },
  {
    key: "fastapi",
    name: "FastAPI",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["fast api", "fastapi framework"],
    relatedSkills: ["python", "rest-apis", "pydantic", "docker"],
  },
  {
    key: "flask",
    name: "Flask",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["flask python", "flask framework"],
    relatedSkills: ["python", "rest-apis", "sqlalchemy"],
  },
  {
    key: "spring-boot",
    name: "Spring Boot",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["springboot", "spring boot 3", "spring-boot", "spring framework", "spring"],
    relatedSkills: ["java", "microservices", "hibernate", "mysql", "postgresql"],
  },
  {
    key: "aspnet-core",
    name: "ASP.NET Core",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["asp.net", "asp.net core", ".net core", "dotnet core", "dotnet", ".net 6", ".net 7", ".net 8", "web api"],
    relatedSkills: ["csharp", "microsoft-sql-server", "entity-framework"],
  },
  {
    key: "ruby-on-rails",
    name: "Ruby on Rails",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["rails", "ror", "ruby on rails"],
    relatedSkills: ["ruby", "postgresql", "mysql"],
  },
  {
    key: "laravel",
    name: "Laravel",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["laravel framework", "laravel 9", "laravel 10", "laravel 11"],
    relatedSkills: ["php", "mysql", "rest-apis"],
  },
  {
    key: "rest-apis",
    name: "REST APIs",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["rest api", "restful api", "restful apis", "rest web services", "rest", "restful services"],
    relatedSkills: ["node-js", "express-js", "spring-boot", "fastapi", "django"],
  },
  {
    key: "microservices",
    name: "Microservices",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["microservices architecture", "micro-services", "microservice architecture"],
    relatedSkills: ["docker", "kubernetes", "grpc", "spring-boot", "node-js"],
  },
  {
    key: "grpc",
    name: "gRPC",
    category: SKILL_CATEGORIES.BACKEND,
    aliases: ["grpc protocol", "protobuf", "protocol buffers"],
    relatedSkills: ["microservices", "go", "java", "cpp"],
  },

  // ==========================================
  // DATABASES & STORAGE
  // ==========================================
  {
    key: "postgresql",
    name: "PostgreSQL",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["postgres", "postgre", "psql", "postgresql 14", "postgresql 15", "postgresql 16"],
    relatedSkills: ["sql", "database-design", "prisma", "sequelize"],
  },
  {
    key: "mongodb",
    name: "MongoDB",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["mongo", "mongodb atlas", "nosql mongodb", "mongoose"],
    relatedSkills: ["node-js", "express-js", "nosql", "redis"],
  },
  {
    key: "mysql",
    name: "MySQL",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["mysql 8", "my sql", "mysql database"],
    relatedSkills: ["sql", "php", "java", "spring-boot"],
  },
  {
    key: "redis",
    name: "Redis",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["redis cache", "redis in-memory"],
    relatedSkills: ["caching", "node-js", "backend", "postgresql"],
  },
  {
    key: "microsoft-sql-server",
    name: "Microsoft SQL Server",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["mssql", "sql server", "ms sql server", "ms sql", "t-sql"],
    relatedSkills: ["sql", "csharp", "aspnet-core"],
  },
  {
    key: "oracle-database",
    name: "Oracle Database",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["oracle", "oracle db", "oracle sql", "pl/sql oracle", "oracle 19c"],
    relatedSkills: ["sql", "java", "database-administration"],
  },
  {
    key: "sqlite",
    name: "SQLite",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["sqlite3"],
    relatedSkills: ["sql", "python", "mobile"],
  },
  {
    key: "dynamodb",
    name: "Amazon DynamoDB",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["dynamodb", "aws dynamodb"],
    relatedSkills: ["aws", "nosql", "serverless"],
  },
  {
    key: "cassandra",
    name: "Apache Cassandra",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["cassandra", "datastax cassandra"],
    relatedSkills: ["nosql", "big-data", "java"],
  },
  {
    key: "elasticsearch",
    name: "Elasticsearch",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["elastic", "elastic search", "elk stack", "opensearch"],
    relatedSkills: ["logstash", "kibana", "search-engines"],
  },
  {
    key: "firebase",
    name: "Firebase / Firestore",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["firebase", "firestore", "cloud firestore", "firebase realtime database"],
    relatedSkills: ["react", "flutter", "react-native", "mobile"],
  },
  {
    key: "supabase",
    name: "Supabase",
    category: SKILL_CATEGORIES.DATABASE,
    aliases: ["supabase db"],
    relatedSkills: ["postgresql", "react", "next-js"],
  },

  // ==========================================
  // DATA ANALYTICS & BI
  // ==========================================
  {
    key: "power-bi",
    name: "Power BI",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["powerbi", "ms power bi", "microsoft power bi", "power bi desktop", "power-bi"],
    relatedSkills: ["dax", "excel", "sql", "data-visualization", "tableau"],
  },
  {
    key: "tableau",
    name: "Tableau",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["tableau desktop", "tableau server", "tableau public"],
    relatedSkills: ["sql", "data-visualization", "power-bi", "excel"],
  },
  {
    key: "excel",
    name: "Microsoft Excel",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["excel", "ms excel", "advanced excel", "microsoft excel", "vlookup", "pivot tables", "excel vba"],
    relatedSkills: ["power-bi", "sql", "data-analytics"],
  },
  {
    key: "looker",
    name: "Google Looker",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["looker", "looker studio", "google data studio", "lookml"],
    relatedSkills: ["sql", "data-analytics", "bigquery"],
  },
  {
    key: "pandas",
    name: "Pandas",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["pandas library", "python pandas"],
    relatedSkills: ["python", "numpy", "data-analytics", "data-science"],
  },
  {
    key: "numpy",
    name: "NumPy",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["numpy library", "python numpy"],
    relatedSkills: ["python", "pandas", "data-science", "scipy"],
  },
  {
    key: "apache-spark",
    name: "Apache Spark",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["spark", "pyspark", "spark sql", "apache spark streaming"],
    relatedSkills: ["python", "scala", "big-data", "hadoop"],
  },
  {
    key: "dax",
    name: "DAX",
    category: SKILL_CATEGORIES.DATA_ANALYTICS,
    aliases: ["data analysis expressions", "dax power bi"],
    relatedSkills: ["power-bi", "excel"],
  },

  // ==========================================
  // DATA SCIENCE & STATISTICS
  // ==========================================
  {
    key: "data-science",
    name: "Data Science",
    category: SKILL_CATEGORIES.DATA_SCIENCE,
    aliases: ["data science methodologies", "predictive modeling", "statistical modeling"],
    relatedSkills: ["python", "r", "machine-learning", "pandas", "statistics"],
  },
  {
    key: "machine-learning",
    name: "Machine Learning",
    category: SKILL_CATEGORIES.DATA_SCIENCE,
    aliases: ["ml", "supervised learning", "unsupervised learning", "ml algorithms"],
    relatedSkills: ["python", "scikit-learn", "deep-learning", "pytorch", "tensorflow"],
  },
  {
    key: "statistics",
    name: "Statistical Analysis",
    category: SKILL_CATEGORIES.DATA_SCIENCE,
    aliases: ["statistics", "applied statistics", "hypothesis testing", "probability and statistics"],
    relatedSkills: ["r", "python", "data-science"],
  },
  {
    key: "scikit-learn",
    name: "Scikit-Learn",
    category: SKILL_CATEGORIES.DATA_SCIENCE,
    aliases: ["sklearn", "scikit learn", "scikit-learn library"],
    relatedSkills: ["python", "machine-learning", "pandas", "numpy"],
  },

  // ==========================================
  // AI & MACHINE LEARNING
  // ==========================================
  {
    key: "deep-learning",
    name: "Deep Learning",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["dl", "neural networks", "cnn", "rnn", "transformers"],
    relatedSkills: ["pytorch", "tensorflow", "python", "machine-learning"],
  },
  {
    key: "pytorch",
    name: "PyTorch",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["torch", "pytorch framework"],
    relatedSkills: ["python", "deep-learning", "tensorflow", "nlp"],
  },
  {
    key: "tensorflow",
    name: "TensorFlow",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["tf", "tensorflow 2", "keras"],
    relatedSkills: ["python", "deep-learning", "pytorch"],
  },
  {
    key: "nlp",
    name: "Natural Language Processing",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["nlp", "text mining", "spacy", "nltk", "transformers nlp", "llm nlp"],
    relatedSkills: ["python", "deep-learning", "hugging-face", "llms"],
  },
  {
    key: "computer-vision",
    name: "Computer Vision",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["cv", "image processing", "opencv", "yolo"],
    relatedSkills: ["deep-learning", "pytorch", "python"],
  },
  {
    key: "hugging-face",
    name: "Hugging Face",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["huggingface", "transformers library", "diffusers"],
    relatedSkills: ["pytorch", "nlp", "llms"],
  },
  {
    key: "llms",
    name: "Large Language Models (LLMs)",
    category: SKILL_CATEGORIES.AI_ML,
    aliases: ["llm", "llms", "large language models", "prompt engineering", "langchain", "llamaindex", "rag", "retrieval augmented generation"],
    relatedSkills: ["python", "nlp", "hugging-face"],
  },

  // ==========================================
  // CLOUD INFRASTRUCTURE
  // ==========================================
  {
    key: "aws",
    name: "Amazon Web Services (AWS)",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["aws", "amazon web services", "aws ec2", "aws s3", "aws lambda", "aws cloud"],
    relatedSkills: ["docker", "terraform", "cloud", "devops"],
  },
  {
    key: "azure",
    name: "Microsoft Azure",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["azure", "ms azure", "azure cloud", "azure devops", "azure app services"],
    relatedSkills: ["csharp", "aspnet-core", "cloud", "devops"],
  },
  {
    key: "gcp",
    name: "Google Cloud Platform (GCP)",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["gcp", "google cloud", "google cloud platform", "bigquery", "google cloud run"],
    relatedSkills: ["kubernetes", "docker", "cloud", "python"],
  },
  {
    key: "cloudflare",
    name: "Cloudflare",
    category: SKILL_CATEGORIES.CLOUD,
    aliases: ["cloudflare workers", "cloudflare cdn"],
    relatedSkills: ["cloud", "devops", "security"],
  },

  // ==========================================
  // DEVOPS & CI/CD
  // ==========================================
  {
    key: "docker",
    name: "Docker",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["docker container", "docker containers", "docker compose", "containerization"],
    relatedSkills: ["kubernetes", "ci-cd", "linux", "devops"],
  },
  {
    key: "kubernetes",
    name: "Kubernetes",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["k8s", "k8s cluster", "helm", "kube"],
    relatedSkills: ["docker", "aws", "gcp", "devops"],
  },
  {
    key: "ci-cd",
    name: "CI/CD Pipelines",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["ci/cd", "ci cd", "continuous integration", "continuous deployment", "ci-cd pipelines"],
    relatedSkills: ["github-actions", "jenkins", "gitlab-ci", "docker"],
  },
  {
    key: "github-actions",
    name: "GitHub Actions",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["gh actions", "github ci", "github workflows"],
    relatedSkills: ["git", "github", "ci-cd", "docker"],
  },
  {
    key: "jenkins",
    name: "Jenkins",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["jenkins ci", "jenkins pipeline"],
    relatedSkills: ["ci-cd", "docker", "linux"],
  },
  {
    key: "gitlab-ci",
    name: "GitLab CI/CD",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["gitlab ci", "gitlab pipeline"],
    relatedSkills: ["git", "ci-cd", "docker"],
  },
  {
    key: "terraform",
    name: "Terraform",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["iac", "infrastructure as code", "terraform hcl"],
    relatedSkills: ["aws", "azure", "gcp", "cloud"],
  },
  {
    key: "ansible",
    name: "Ansible",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["ansible playbook", "ansible automation"],
    relatedSkills: ["linux", "devops", "bash"],
  },
  {
    key: "linux",
    name: "Linux Administration",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["linux", "ubuntu", "centos", "redhat", "debian", "unix", "linux cli"],
    relatedSkills: ["bash", "docker", "devops"],
  },
  {
    key: "nginx",
    name: "Nginx",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["nginx reverse proxy", "nginx server"],
    relatedSkills: ["linux", "docker", "backend"],
  },
  {
    key: "prometheus-grafana",
    name: "Prometheus & Grafana",
    category: SKILL_CATEGORIES.DEVOPS,
    aliases: ["prometheus", "grafana", "monitoring", "observability"],
    relatedSkills: ["kubernetes", "docker", "devops"],
  },

  // ==========================================
  // CYBERSECURITY & INFOSEC
  // ==========================================
  {
    key: "cybersecurity",
    name: "Cybersecurity",
    category: SKILL_CATEGORIES.CYBERSECURITY,
    aliases: ["information security", "infosec", "network security", "cyber security"],
    relatedSkills: ["penetration-testing", "owasp", "ethical-hacking"],
  },
  {
    key: "penetration-testing",
    name: "Penetration Testing",
    category: SKILL_CATEGORIES.CYBERSECURITY,
    aliases: ["pen testing", "pentesting", "vulnerability assessment", "burp suite", "wireshark"],
    relatedSkills: ["cybersecurity", "ethical-hacking", "owasp"],
  },
  {
    key: "owasp",
    name: "OWASP Top 10",
    category: SKILL_CATEGORIES.CYBERSECURITY,
    aliases: ["owasp", "web application security", "appsec"],
    relatedSkills: ["cybersecurity", "penetration-testing"],
  },

  // ==========================================
  // MOBILE DEVELOPMENT
  // ==========================================
  {
    key: "react-native",
    name: "React Native",
    category: SKILL_CATEGORIES.MOBILE,
    aliases: ["reactnative", "react-native", "expo", "react native framework"],
    relatedSkills: ["react", "javascript", "typescript", "mobile"],
  },
  {
    key: "flutter",
    name: "Flutter",
    category: SKILL_CATEGORIES.MOBILE,
    aliases: ["flutter framework", "flutter sdk"],
    relatedSkills: ["dart", "mobile", "firebase"],
  },
  {
    key: "android-dev",
    name: "Android Development",
    category: SKILL_CATEGORIES.MOBILE,
    aliases: ["android", "android sdk", "android studio", "jetpack compose"],
    relatedSkills: ["kotlin", "java", "mobile"],
  },
  {
    key: "ios-dev",
    name: "iOS Development",
    category: SKILL_CATEGORIES.MOBILE,
    aliases: ["ios", "ios sdk", "xcode", "swiftui", "uikit"],
    relatedSkills: ["swift", "mobile"],
  },

  // ==========================================
  // QUALITY ASSURANCE & TESTING
  // ==========================================
  {
    key: "jest",
    name: "Jest",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["jest framework", "react testing library", "rtl"],
    relatedSkills: ["javascript", "react", "unit-testing"],
  },
  {
    key: "cypress",
    name: "Cypress",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["cypress.io", "cypress e2e"],
    relatedSkills: ["e2e-testing", "javascript", "react"],
  },
  {
    key: "selenium",
    name: "Selenium",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["selenium webdriver", "selenium automation"],
    relatedSkills: ["java", "python", "test-automation"],
  },
  {
    key: "playwright",
    name: "Playwright",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["playwright test", "playwright e2e"],
    relatedSkills: ["typescript", "javascript", "e2e-testing"],
  },
  {
    key: "postman",
    name: "Postman",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["postman api", "api testing", "newman"],
    relatedSkills: ["rest-apis", "backend"],
  },
  {
    key: "unit-testing",
    name: "Unit Testing",
    category: SKILL_CATEGORIES.TESTING,
    aliases: ["unit tests", "tdd", "test driven development"],
    relatedSkills: ["jest", "junit", "pytest"],
  },

  // ==========================================
  // UI/UX & PRODUCT DESIGN
  // ==========================================
  {
    key: "figma",
    name: "Figma",
    category: SKILL_CATEGORIES.UI_UX,
    aliases: ["figma design", "figma ui"],
    relatedSkills: ["ui-ux-design", "wireframing", "prototyping", "design-systems"],
  },
  {
    key: "ui-ux-design",
    name: "UI/UX Design",
    category: SKILL_CATEGORIES.UI_UX,
    aliases: ["ui design", "ux design", "user experience", "user interface design", "product design"],
    relatedSkills: ["figma", "wireframing", "prototyping", "design-systems"],
  },
  {
    key: "wireframing-prototyping",
    name: "Wireframing & Prototyping",
    category: SKILL_CATEGORIES.UI_UX,
    aliases: ["wireframing", "prototyping", "mockups", "user flows"],
    relatedSkills: ["figma", "ui-ux-design"],
  },
  {
    key: "design-systems",
    name: "Design Systems",
    category: SKILL_CATEGORIES.UI_UX,
    aliases: ["design system", "component library", "style guides"],
    relatedSkills: ["figma", "tailwind-css", "react"],
  },

  // ==========================================
  // BUSINESS & MANAGEMENT
  // ==========================================
  {
    key: "agile-scrum",
    name: "Agile & Scrum",
    category: SKILL_CATEGORIES.BUSINESS,
    aliases: ["agile", "scrum", "kanban", "sprint planning", "agile methodologies", "scrum master"],
    relatedSkills: ["jira", "project-management"],
  },
  {
    key: "project-management",
    name: "Project Management",
    category: SKILL_CATEGORIES.BUSINESS,
    aliases: ["project planning", "pmp", "resource management", "delivery management"],
    relatedSkills: ["agile-scrum", "jira", "leadership"],
  },
  {
    key: "product-management",
    name: "Product Management",
    category: SKILL_CATEGORIES.BUSINESS,
    aliases: ["product roadmap", "user stories", "product strategy", "prd"],
    relatedSkills: ["agile-scrum", "ui-ux-design", "business-analytics"],
  },

  // ==========================================
  // DEVELOPER TOOLS & VERSION CONTROL
  // ==========================================
  {
    key: "git",
    name: "Git",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["git vcs", "git version control", "branching", "git flow"],
    relatedSkills: ["github", "gitlab", "bitbucket", "devops"],
  },
  {
    key: "github",
    name: "GitHub",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["github repositories", "github prs"],
    relatedSkills: ["git", "github-actions"],
  },
  {
    key: "gitlab",
    name: "GitLab",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["gitlab repos"],
    relatedSkills: ["git", "gitlab-ci"],
  },
  {
    key: "jira",
    name: "Jira",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["atlassian jira", "jira software", "jira ticketing"],
    relatedSkills: ["agile-scrum", "confluence"],
  },
  {
    key: "confluence",
    name: "Confluence",
    category: SKILL_CATEGORIES.TOOLS,
    aliases: ["atlassian confluence", "documentation"],
    relatedSkills: ["jira", "project-management"],
  },

  // ==========================================
  // SOFT SKILLS & LEADERSHIP
  // ==========================================
  {
    key: "problem-solving",
    name: "Problem Solving",
    category: SKILL_CATEGORIES.SOFT_SKILLS,
    aliases: ["analytical thinking", "troubleshooting", "root cause analysis"],
    relatedSkills: ["critical-thinking"],
  },
  {
    key: "communication",
    name: "Communication",
    category: SKILL_CATEGORIES.SOFT_SKILLS,
    aliases: ["verbal communication", "written communication", "presentation skills", "stakeholder communication"],
    relatedSkills: ["team-collaboration", "leadership"],
  },
  {
    key: "team-collaboration",
    name: "Team Collaboration",
    category: SKILL_CATEGORIES.SOFT_SKILLS,
    aliases: ["teamwork", "cross-functional collaboration", "team player"],
    relatedSkills: ["communication", "agile-scrum"],
  },
  {
    key: "leadership",
    name: "Leadership & Mentoring",
    category: SKILL_CATEGORIES.SOFT_SKILLS,
    aliases: ["leadership", "team leadership", "mentoring", "tech lead", "people management"],
    relatedSkills: ["project-management", "communication"],
  },
];

// Fast lookup index maps
const CANONICAL_MAP_BY_KEY = new Map();
const ALIAS_LOOKUP_MAP = new Map();

CANONICAL_SKILL_DICTIONARY.forEach((skill) => {
  CANONICAL_MAP_BY_KEY.set(skill.key, skill);

  // Exact name lowercase lookup
  const cleanName = skill.name.toLowerCase().trim();
  ALIAS_LOOKUP_MAP.set(cleanName, skill);

  // Alias lookups
  if (Array.isArray(skill.aliases)) {
    skill.aliases.forEach((alias) => {
      if (alias && typeof alias === "string") {
        ALIAS_LOOKUP_MAP.set(alias.toLowerCase().trim(), skill);
      }
    });
  }
});

module.exports = {
  CANONICAL_SKILL_DICTIONARY,
  CANONICAL_MAP_BY_KEY,
  ALIAS_LOOKUP_MAP,
};
