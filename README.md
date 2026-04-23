# SmartPG - PG Management System

A full-stack PG (Paying Guest) Management System built with React, Node.js, and MongoDB.

## Architecture Overview

```text
+-------------------+       +-----------------------+       +-----------+
|                   |       |   tenant-service      |       |           |
|                   | ----> |   (Port 4001)         | ----> |           |
|                   |       +-----------------------+       |           |
|                   |                                       |           |
|                   |       +-----------------------+       |           |
|                   |       |   payment-service     |       |           |
|   Frontend        | ----> |   (Port 4002)         | ----> |  MongoDB  |
|   (React/Vite)    |       +-----------------------+       |  (PV/PVC) |
|   (Port 80/3000)  |                                       |           |
|                   |       +-----------------------+       |           |
|                   |       |   mess-service        |       |           |
|                   | ----> |   (Port 4003)         | ----> |           |
|                   |       +-----------------------+       |           |
|                   |                                       |           |
|                   |       +-----------------------+       |           |
|                   | ----> |   complaint-service   | ----> |           |
|                   |       |   (Port 4004)         |       |           |
|                   |       +-----------------------+       |           |
|                   |                                       |           |
|                   |       +-----------------------+       |           |
|                   | ----> |   notification-service| ----> |           |
|                   |       |   (Port 4005)         |       |           |
+-------------------+       +-----------------------+       +-----------+
```

## Phases

The project is divided into 5 phases:
1. **Docker**: Multi-stage Dockerfiles for all microservices and frontend, ensuring secure (non-root) and optimized images.
2. **Kubernetes (K8s)**: Complete manifest setup including deployments, services, namespaces, and MongoDB persistent storage (PV/PVC).
3. **Helm**: (Optional/Future) Can be used to template the current k8s base/dev/prod overlays for easier management across multiple clusters.
4. **Continuous Integration (CI)**: GitHub Actions workflow for linting, CodeQL SAST scanning, GitLeaks secret scanning, Trivy image vulnerability scanning, and Docker image publishing to GHCR.
5. **Continuous Deployment (CD)**: Automated deployment to K8s namespaces (`smartpg-dev` and `smartpg-prod`) triggered by branch pushes.

## Services & Ports Table

| Service               | Port | Description |
|-----------------------|------|-------------|
| frontend              | 80   | React UI served via Nginx |
| tenant-service        | 4001 | Tenant registration, auth, room allocation |
| payment-service       | 4002 | Rent tracking, payment history |
| mess-service          | 4003 | Menu management, daily meal opt-in/out |
| complaint-service     | 4004 | Maintenance issues, cleanliness, noise |
| notification-service  | 4005 | In-app notifications and announcements |
| mongodb               | 27017| Shared database (separate collections) |

## Pipeline Triggers

- `develop` branch → `smartpg-dev` namespace
- `main` branch → `smartpg-prod` namespace

## Secret Management

How secrets flow:
GitHub Secrets → K8s Secrets → Pod env vars

Required GitHub Secrets:
- `KUBECONFIG_DEV`: Kubeconfig for development cluster
- `KUBECONFIG_PROD`: Kubeconfig for production cluster
- `MONGO_PASSWORD`: MongoDB root password
- `JWT_SECRET`: Secret key for signing JSON Web Tokens

## Local Development Setup

1. **Prerequisites**: Node.js v20, MongoDB running locally on port 27017.
2. **Clone repo**: `git clone <repo-url>`
3. **Backend Setup**:
   For each service in `src/`:
   ```bash
   cd src/tenant-service
   npm install
   cp .env.example .env
   npm run dev
   ```
4. **Frontend Setup**:
   ```bash
   cd src/frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

## Kubernetes Deployment

Deploy using raw manifests:
```bash
# Setup Dev Environment
kubectl apply -f k8s-manifests/dev/namespace.yaml
kubectl apply -f k8s-manifests/dev/configmap.yaml

# Setup Database
kubectl apply -f k8s-manifests/base/mongodb/

# Setup Services (replace with kustomize or apply individually)
kubectl apply -f k8s-manifests/base/tenant-service/
kubectl apply -f k8s-manifests/base/payment-service/
# ... apply other services
```

Verify Dev:
```bash
kubectl get all -n smartpg-dev
```

Verify Prod:
```bash
kubectl get all -n smartpg-prod
```

## Connection Verification

Test inter-service communication from within the cluster:
```bash
kubectl exec -it deployment/tenant-service -n smartpg-dev -- wget -qO- http://notification-service:4005/health
```

## Security Gates

| Check | Tool | Phase | Fail Condition |
|-------|------|-------|----------------|
| Linting | ESLint | CI | Any linting error |
| Secrets | GitLeaks | CI | Hardcoded secret found |
| SAST | CodeQL | CI | Security vulnerabilities in code |
| Image Scan | Trivy | CI | CRITICAL or HIGH vulnerabilities |
| Container | Docker | Build | Running as root |

## Gateway API Architecture

```text
Internet
  ↓
Gateway (smartpg-gateway) Port 80
  ↓ (route matching)
┌─────────────────────────────────────┐
│  /api/auth, /api/tenants → :4001   │
│  /api/payments           → :4002   │
│  /api/menu, /api/orders  → :4003   │
│  /api/complaints         → :4004   │
│  /api/notifications      → :4005   │
│  /                       → :80     │
└─────────────────────────────────────┘
```

The Gateway API replaces the legacy Ingress controller with a more expressive, role-oriented routing model:
- **GatewayClass**: Defines the Envoy Gateway controller (`gateway.envoy.io/gatewayclass-controller`)
- **Gateway**: Per-environment listener on port 80
- **HTTPRoute**: Route rules matching path prefixes to backend services
- **NetworkPolicy**: Restricts ingress to pods from Envoy Gateway system namespace

## MongoDB StatefulSet

MongoDB has been migrated from a Deployment to a **StatefulSet** for production-grade data persistence:

- **StatefulSet** gives stable pod identity — pod name is always `mongodb-0` (predictable)
- **Headless Service** (`mongodb-service`, ClusterIP: None) — required for StatefulSet DNS resolution
- **Client Service** (`mongodb-client`, ClusterIP) — used by all app services for connecting to MongoDB
- **volumeClaimTemplates** — auto-creates PVCs named `mongodb-storage-mongodb-0` and `mongodb-config-mongodb-0`
- **Data persists** across pod restarts and rescheduling
- **PV names must match** the VCT pattern: `{templateName}-{statefulsetName}-{ordinal}`

### Verify Gateway

```bash
kubectl get gateway -n smartpg-dev
kubectl get httproute -n smartpg-dev
kubectl describe httproute smartpg-routes -n smartpg-dev
```

### Verify StatefulSet

```bash
kubectl get statefulset -n smartpg-dev
kubectl get pvc -n smartpg-dev
kubectl logs mongodb-0 -n smartpg-dev
```

