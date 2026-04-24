# SmartPG Umbrella Chart

This is the Helm Umbrella chart for the SmartPG application. It manages the following microservices:
- frontend
- tenant-service
- payment-service
- mess-service
- complaint-service
- notification-service
- mongodb

## Installation

To install the chart with the release name `smartpg`:

```bash
# For development
helm upgrade --install smartpg ./helm/smartpg -f helm/smartpg/values-dev.yaml --namespace smartpg-dev --create-namespace

# For production
helm upgrade --install smartpg ./helm/smartpg -f helm/smartpg/values-prod.yaml --namespace smartpg-prod --create-namespace
```

## Structure

- `charts/`: Contains all subcharts (microservices)
- `values.yaml`: Base configuration for all subcharts.
- `values-dev.yaml`: Overrides for the development environment.
- `values-prod.yaml`: Overrides for the production environment.
