# Digital Experience Co-pilot (DXP-A11Y)

A unified, intelligent, and proactive platform designed to address the entire lifecycle of a website's quality through specialized AI agents.

## 🎯 Overview

The Digital Experience Co-pilot is a modular system powered by a suite of specialized AI agents that combine three key technological pillars:

- **Human Perception**: Computer vision to "see" webpage layout and visual hierarchy
- **Human Action**: Headless browser automation to "act" like a user
- **Human Reasoning**: Multi-modal LLMs to "think" about context and provide actionable remediation

## 🏗️ Architecture

This project follows a microservice and polyglot approach:

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Backend Services**: Node.js/Express for most services, Python FastAPI for AI agents
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: Docker, Kubernetes, Redis

## 📁 Project Structure

```
dxp-a11y/
├── frontend/                    # Next.js Dashboard (existing)
├── services/
│   ├── api-gateway/            # API Gateway & routing
│   ├── auth-service/           # Authentication & authorization
│   ├── web-analysis-service/   # Browser automation & DOM analysis
│   ├── ai-agent-service/       # Python AI agents & analysis
│   ├── report-service/         # Report generation & storage
│   └── notification-service/   # Real-time notifications
├── shared/                     # Shared types, utils, constants
├── infrastructure/             # K8s, Terraform, monitoring
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Supabase account
- OpenAI/Anthropic API keys

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dxp-a11y
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Development

### Service Ports

- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- Auth Service: http://localhost:3002
- Web Analysis Service: http://localhost:3003
- AI Agent Service: http://localhost:3004
- Report Service: http://localhost:3005
- Notification Service: http://localhost:3006

### Running Individual Services

Each service can be run independently:

```bash
# Node.js services
cd services/[service-name]
npm install
npm run dev

# Python AI Agent service
cd services/ai-agent-service
pip install -r requirements.txt
uvicorn src.main:app --reload --port 3004
```

## 📊 Features

### Phase 1: Accessibility Agent (MVP)
- [ ] Web scraping and screenshot capture
- [ ] Accessibility analysis (WCAG compliance)
- [ ] Basic dashboard for reports

### Phase 2: Enhanced Analysis
- [ ] Computer vision for layout analysis
- [ ] UX and SEO agents
- [ ] Real-time monitoring
- [ ] Enhanced reporting

### Phase 3: Full Co-pilot
- [ ] Proactive monitoring
- [ ] Code-level remediation suggestions
- [ ] CI/CD integrations
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
