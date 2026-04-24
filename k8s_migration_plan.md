# SmartPG Kubernetes Migration Plan

This plan outlines the steps to deploy the SmartPG management system to a Kubernetes cluster using NFS dynamic storage and the latest microservice images.

## 1. Prerequisites
- Kubernetes Cluster (v1.24+)
- NFS Client CSI Driver installed (`nfs.csi.k8s.io`)
- NFS Server accessible at `172.31.41.217` with share `/var/nfs/general`
- `kubectl` configured with cluster access

## 2. Manifest Updates Summary
The following changes have been made to the manifests in `k8s-manifests/base/`:

### Storage Layer
- **StorageClass**: Created `storage-class.yaml` defining the `csi-standard` provisioner.
- **MongoDB**: Updated `statefulset.yaml` to use `csi-standard` for both data and config volumes. This enables dynamic PVC provisioning on the NFS share.

### Application Layer
- **Images**: Updated all deployments to use the `vignesh8386/smartpg-*:v1.0.0` registry and tag.
- **Services Updated**:
  - `frontend`
  - `tenant-service` (Auth/Core)
  - `complaint-service`
  - `mess-service`
  - `notification-service`
  - `payment-service`

## 3. Step-by-Step Deployment Guide

### Step 1: Create Namespace and Storage Class
```bash
kubectl apply -f k8s-manifests/prod/namespace.yaml
kubectl apply -f k8s-manifests/base/mongodb/storage-class.yaml
```

### Step 2: Configure Environment and Secrets
Create the secrets and configmaps. Ensure you replace `<VALUE>` with your actual secrets.
```bash
kubectl apply -f k8s-manifests/prod/configmap.yaml
# Manually create secrets if not present in manifests
kubectl create secret generic smartpg-secrets \
  --from-literal=MONGO_USERNAME=admin \
  --from-literal=MONGO_PASSWORD=<PASSWORD> \
  --from-literal=JWT_SECRET=<SECRET> \
  -n smartpg
```

### Step 3: Deploy MongoDB (Database Layer)
MongoDB is deployed as a StatefulSet to ensure data persistence across pod restarts.
```bash
kubectl apply -f k8s-manifests/base/mongodb/service-headless.yaml
kubectl apply -f k8s-manifests/base/mongodb/service-client.yaml
kubectl apply -f k8s-manifests/base/mongodb/statefulset.yaml
```
*Wait for MongoDB pod to be Ready:* `kubectl get pods -l app=mongodb -n smartpg`

### Step 4: Deploy Microservices
Apply all microservice deployments and services.
```bash
kubectl apply -f k8s-manifests/base/tenant-service/
kubectl apply -f k8s-manifests/base/complaint-service/
kubectl apply -f k8s-manifests/base/mess-service/
kubectl apply -f k8s-manifests/base/notification-service/
kubectl apply -f k8s-manifests/base/payment-service/
kubectl apply -f k8s-manifests/base/frontend/
```

### Step 5: Configure Networking (Gateway API)
Deploy the Gateway and HTTPRoutes for external access.
```bash
kubectl apply -f k8s-manifests/prod/gateway.yaml
kubectl apply -f k8s-manifests/prod/httproute.yaml
```

## 4. Verification Commands
- **Check Storage**: `kubectl get pvc -n smartpg` (Should show `BOUND` status)
- **Check Pods**: `kubectl get pods -n smartpg`
- **Check Access**: `kubectl get gateway -n smartpg` (Get the external IP)
