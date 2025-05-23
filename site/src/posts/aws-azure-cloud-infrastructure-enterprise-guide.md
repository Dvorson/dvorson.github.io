---
title: "AWS and Azure Cloud Infrastructure: Enterprise Migration and Optimization Strategies"
description: "Comprehensive guide to AWS and Azure cloud infrastructure design, migration strategies, and cost optimization. Learn enterprise-grade patterns for building scalable, secure cloud applications."
pubDate: "2025-01-05"
author: "Anton Dvorson"
tags: ["AWS", "Azure", "Cloud Infrastructure", "DevOps", "Cloud Migration", "Kubernetes", "Docker", "Enterprise Architecture"]
categories: ["Cloud Infrastructure", "DevOps"]
heroImage: "/img/cloud-infrastructure.jpg"
---

# AWS and Azure Cloud Infrastructure: Enterprise Migration and Optimization Strategies

Modern enterprises face increasing pressure to leverage cloud infrastructure for competitive advantage. Having worked extensively with cloud platforms across enterprise environments at EPAM Systems, FirstLine Software, and other organizations, I've witnessed how proper cloud architecture can transform business operations while reducing costs and improving reliability.

## The Strategic Value of Cloud Infrastructure

Cloud adoption delivers measurable business outcomes when implemented correctly:

- **Scalability**: Handle traffic growth from thousands to millions of users seamlessly
- **Cost Efficiency**: Optimize resource utilization and reduce infrastructure spending by 40-60%
- **Global Reach**: Deploy applications worldwide with minimal latency
- **Reliability**: Achieve 99.9%+ uptime through built-in redundancy and fault tolerance
- **Innovation Velocity**: Accelerate feature delivery and time-to-market

Through my experience implementing cloud solutions, I've observed organizations achieve these benefits consistently when following proven architectural patterns and best practices.

## AWS vs Azure: Platform Analysis

### AWS Ecosystem Strengths
- **Service Breadth**: Most comprehensive cloud platform with 200+ services
- **Market Maturity**: Battle-tested infrastructure powering Netflix, Airbnb, and thousands of enterprises
- **Global Infrastructure**: 31 regions with extensive availability zone coverage
- **Developer Ecosystem**: Rich third-party integrations and community support

### Azure Platform Advantages  
- **Microsoft Integration**: Native Windows Server, Active Directory, and Office 365 connectivity
- **Hybrid Capabilities**: Seamless on-premises integration through Azure Arc and hybrid cloud solutions
- **Enterprise Focus**: Strong compliance, governance, and security features for regulated industries
- **AI/ML Leadership**: Advanced cognitive services and machine learning capabilities

### Multi-Cloud Architecture Strategy
For enterprise deployments, a multi-cloud approach often provides optimal results:
- **Primary Platform**: AWS for web applications and microservices
- **Specialized Workloads**: Azure for Microsoft-centric applications and enterprise systems
- **Risk Mitigation**: Avoid vendor lock-in while maintaining operational flexibility

## Enterprise Cloud Architecture Patterns

### 1. Three-Tier Application Architecture

**AWS Infrastructure Implementation**
```yaml
# infrastructure/aws/vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

# Application Load Balancer for high availability
resource "aws_lb" "application" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = true
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Auto Scaling Group for elastic capacity
resource "aws_autoscaling_group" "app" {
  name                = "${var.project_name}-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  target_group_arns   = [aws_lb_target_group.app.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300
  
  min_size         = 2
  max_size         = 20
  desired_capacity = 3

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Scaling policies for cost optimization
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  tag {
    key                 = "Name"
    value               = "${var.project_name}-app-server"
    propagate_at_launch = true
  }
}

# RDS with Multi-AZ for high availability
resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.xlarge"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  multi_az               = true
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.project_name}-final-snapshot"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
```

**Azure Infrastructure Implementation**
```yaml
# infrastructure/azure/main.tf
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-rg"
  location = var.azure_region

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Virtual Network with proper segmentation
resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Application Gateway for load balancing
resource "azurerm_application_gateway" "main" {
  name                = "${var.project_name}-appgw"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = 2
  }

  autoscale_configuration {
    min_capacity = 2
    max_capacity = 10
  }

  gateway_ip_configuration {
    name      = "gateway-ip-config"
    subnet_id = azurerm_subnet.gateway.id
  }

  frontend_port {
    name = "frontend-port-80"
    port = 80
  }

  frontend_port {
    name = "frontend-port-443"
    port = 443
  }

  frontend_ip_configuration {
    name                 = "frontend-ip-config"
    public_ip_address_id = azurerm_public_ip.gateway.id
  }

  # SSL termination and security
  ssl_certificate {
    name     = "ssl-cert"
    data     = filebase64("certificate.pfx")
    password = var.ssl_password
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Virtual Machine Scale Set for elastic compute
resource "azurerm_linux_virtual_machine_scale_set" "app" {
  name                = "${var.project_name}-vmss"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  sku                = "Standard_D2s_v3"
  instances          = 3

  admin_username = var.admin_username
  
  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = file("~/.ssh/id_rsa.pub")
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts-gen2"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Premium_LRS"
    caching             = "ReadWrite"
  }

  # Auto-scaling configuration
  automatic_os_upgrade_policy {
    disable_automatic_rollback  = false
    enable_automatic_os_upgrade = true
  }

  upgrade_mode = "Automatic"

  network_interface {
    name    = "internal"
    primary = true

    ip_configuration {
      name      = "internal"
      primary   = true
      subnet_id = azurerm_subnet.app.id
      load_balancer_backend_address_pool_ids = [
        azurerm_lb_backend_address_pool.app.id
      ]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Azure Database for PostgreSQL with high availability
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.project_name}-psql"
  resource_group_name    = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  version               = "15"
  
  administrator_login    = var.database_username
  administrator_password = var.database_password
  
  zone                   = "1"
  high_availability {
    mode = "ZoneRedundant"
  }
  
  storage_mb            = 32768
  sku_name             = "GP_Standard_D2s_v3"
  
  backup_retention_days = 35
  geo_redundant_backup_enabled = true
  
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
```

### 2. Microservices with Container Orchestration

**Amazon EKS Configuration**
```yaml
# kubernetes/aws/cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: production-cluster
  region: us-west-2
  version: "1.28"

iam:
  withOIDC: true

addons:
  - name: vpc-cni
    version: latest
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
  - name: aws-ebs-csi-driver
    version: latest

nodeGroups:
  - name: system-nodes
    instanceType: t3.medium
    minSize: 1
    maxSize: 3
    desiredCapacity: 2
    
    volumeSize: 50
    volumeType: gp3
    
    ssh:
      allow: false
    
    iam:
      withAddonPolicies:
        autoScaler: true
        cloudWatch: true
        ebs: true
        efs: true
        albIngress: true
    
    labels:
      node-type: system
    
    taints:
      - key: node-type
        value: system
        effect: NoSchedule

  - name: application-nodes
    instanceType: m5.large
    minSize: 3
    maxSize: 20
    desiredCapacity: 5
    
    volumeSize: 100
    volumeType: gp3
    
    ssh:
      allow: false
    
    iam:
      withAddonPolicies:
        autoScaler: true
        cloudWatch: true
        ebs: true
        efs: true
        albIngress: true
    
    labels:
      node-type: application

cloudWatch:
  clusterLogging:
    enableTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"]
```

**Azure AKS Setup**
```yaml
# infrastructure/azure/aks.tf
resource "azurerm_kubernetes_cluster" "main" {
  name                = "${var.project_name}-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${var.project_name}-aks"
  kubernetes_version  = "1.28.3"

  default_node_pool {
    name                = "system"
    node_count          = 2
    vm_size            = "Standard_D2s_v3"
    os_disk_size_gb    = 50
    vnet_subnet_id     = azurerm_subnet.aks.id
    
    enable_auto_scaling = true
    min_count          = 2
    max_count          = 5
    
    node_labels = {
      "node-type" = "system"
    }
    
    node_taints = [
      "CriticalAddonsOnly=true:NoSchedule"
    ]
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "azure"
    service_cidr   = "10.1.0.0/16"
    dns_service_ip = "10.1.0.10"
  }

  # Security and compliance features
  azure_policy_enabled             = true
  open_service_mesh_enabled        = true
  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }
  
  # Monitoring and observability
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Additional node pool for applications
resource "azurerm_kubernetes_cluster_node_pool" "applications" {
  name                  = "apps"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size              = "Standard_D4s_v3"
  node_count           = 3
  
  enable_auto_scaling = true
  min_count          = 3
  max_count          = 20
  
  vnet_subnet_id = azurerm_subnet.aks.id
  
  node_labels = {
    "node-type" = "application"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
```

## Production-Ready Application Deployment

### Helm Chart Configuration
```yaml
# helm/microservice/values.yaml
replicaCount: 3

image:
  repository: your-registry/api
  tag: "1.0.0"
  pullPolicy: IfNotPresent

nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"

podSecurityContext:
  fsGroup: 2000

securityContext:
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: api-tls
      hosts:
        - api.yourdomain.com

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 50
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# Node affinity for optimal placement
nodeSelector:
  node-type: application

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - api
        topologyKey: kubernetes.io/hostname

# Health checks
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5

# Environment configuration
env:
  - name: NODE_ENV
    value: "production"
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: database-credentials
        key: url
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        name: redis-credentials
        key: url
```

### Container Security Best Practices
```dockerfile
# Multi-stage build for security and efficiency
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage with minimal attack surface
FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

# Security: Update packages and remove package manager
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy built application with proper ownership
COPY --from=build --chown=appuser:nodejs /app/dist ./dist
COPY --from=dependencies --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/package.json ./package.json

# Security: Remove write permissions
RUN chmod -R 555 /app

# Switch to non-root user
USER appuser

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Expose port (documentation only)
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

## CI/CD Pipeline Implementation

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: 'security-scan-results.sarif'

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate coverage report
        run: npm run coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  build-and-push:
    needs: [security-scan, test]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region us-west-2 --name production-cluster

      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install api ./helm/microservice \
            --set image.tag=${{ github.sha }} \
            --namespace production \
            --create-namespace \
            --wait \
            --timeout=10m

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/api -n production --timeout=300s
          kubectl get pods -n production -l app.kubernetes.io/name=api
```

## Monitoring and Observability

### Prometheus Configuration
```yaml
# monitoring/prometheus/values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    resources:
      requests:
        cpu: 500m
        memory: 2Gi
      limits:
        cpu: 2000m
        memory: 8Gi
    
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi

alertmanager:
  alertmanagerSpec:
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
      limits:
        cpu: 500m
        memory: 512Mi

grafana:
  adminPassword: ${{ secrets.GRAFANA_PASSWORD }}
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 500m
      memory: 1Gi
  
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'custom-dashboards'
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards

  dashboards:
    custom-dashboards:
      node-exporter:
        gnetId: 1860
        revision: 27
        datasource: Prometheus
      kubernetes-cluster:
        gnetId: 7249
        revision: 1
        datasource: Prometheus
```

### Application Metrics
```typescript
// monitoring/metrics.ts
import promClient from 'prom-client';

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom business metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1.0, 2.0, 5.0],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0],
  registers: [register],
});

// Business metrics
const ordersTotal = new promClient.Counter({
  name: 'orders_total',
  help: 'Total number of orders processed',
  labelNames: ['status', 'payment_method'],
  registers: [register],
});

const revenueTotal = new promClient.Gauge({
  name: 'revenue_total_dollars',
  help: 'Total revenue in dollars',
  registers: [register],
});

export {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  activeConnections,
  databaseQueryDuration,
  ordersTotal,
  revenueTotal,
};
```

## Cost Optimization Strategies

### Resource Right-Sizing
```python
# scripts/cost-optimization.py
import boto3
import json
from datetime import datetime, timedelta
from typing import List, Dict

class CloudCostOptimizer:
    def __init__(self, region: str = 'us-west-2'):
        self.ec2 = boto3.client('ec2', region_name=region)
        self.cloudwatch = boto3.client('cloudwatch', region_name=region)
        self.cost_explorer = boto3.client('ce', region_name='us-east-1')
    
    def analyze_ec2_utilization(self, days: int = 14) -> List[Dict]:
        """Analyze EC2 instance utilization and provide rightsizing recommendations"""
        instances = self.ec2.describe_instances(
            Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
        )
        
        recommendations = []
        
        for reservation in instances['Reservations']:
            for instance in reservation['Instances']:
                instance_id = instance['InstanceId']
                instance_type = instance['InstanceType']
                
                metrics = self._get_instance_metrics(instance_id, days)
                recommendation = self._generate_rightsizing_recommendation(
                    instance_id, instance_type, metrics
                )
                
                if recommendation:
                    recommendations.append(recommendation)
        
        return recommendations
    
    def _get_instance_metrics(self, instance_id: str, days: int) -> Dict:
        """Get CloudWatch metrics for an instance"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        cpu_response = self.cloudwatch.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average', 'Maximum']
        )
        
        memory_response = self.cloudwatch.get_metric_statistics(
            Namespace='CWAgent',
            MetricName='mem_used_percent',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average', 'Maximum']
        )
        
        cpu_avg = sum(point['Average'] for point in cpu_response['Datapoints']) / len(cpu_response['Datapoints']) if cpu_response['Datapoints'] else 0
        cpu_max = max(point['Maximum'] for point in cpu_response['Datapoints']) if cpu_response['Datapoints'] else 0
        
        memory_avg = sum(point['Average'] for point in memory_response['Datapoints']) / len(memory_response['Datapoints']) if memory_response['Datapoints'] else 0
        memory_max = max(point['Maximum'] for point in memory_response['Datapoints']) if memory_response['Datapoints'] else 0
        
        return {
            'cpu_average': cpu_avg,
            'cpu_maximum': cpu_max,
            'memory_average': memory_avg,
            'memory_maximum': memory_max
        }
    
    def _generate_rightsizing_recommendation(self, instance_id: str, instance_type: str, metrics: Dict) -> Dict:
        """Generate rightsizing recommendation based on metrics"""
        cpu_avg = metrics['cpu_average']
        cpu_max = metrics['cpu_maximum']
        memory_avg = metrics['memory_average']
        memory_max = metrics['memory_maximum']
        
        # Define thresholds for rightsizing
        if cpu_avg < 20 and cpu_max < 50 and memory_avg < 50:
            # Underutilized - recommend smaller instance
            recommendation_type = 'downsize'
            new_instance_type = self._get_smaller_instance_type(instance_type)
        elif cpu_avg > 80 or cpu_max > 95 or memory_avg > 85:
            # Overutilized - recommend larger instance
            recommendation_type = 'upsize'
            new_instance_type = self._get_larger_instance_type(instance_type)
        else:
            # Properly sized
            return None
        
        return {
            'instance_id': instance_id,
            'current_type': instance_type,
            'recommended_type': new_instance_type,
            'recommendation_type': recommendation_type,
            'cpu_utilization': {
                'average': cpu_avg,
                'maximum': cpu_max
            },
            'memory_utilization': {
                'average': memory_avg,
                'maximum': memory_max
            },
            'estimated_savings': self._calculate_cost_savings(instance_type, new_instance_type)
        }
    
    def _get_smaller_instance_type(self, current_type: str) -> str:
        """Get smaller instance type recommendation"""
        downsize_map = {
            'm5.large': 'm5.medium',
            'm5.xlarge': 'm5.large',
            'm5.2xlarge': 'm5.xlarge',
            'm5.4xlarge': 'm5.2xlarge',
            't3.large': 't3.medium',
            't3.xlarge': 't3.large',
            't3.2xlarge': 't3.xlarge',
            'c5.large': 'c5.medium',
            'c5.xlarge': 'c5.large',
            'c5.2xlarge': 'c5.xlarge',
        }
        return downsize_map.get(current_type, current_type)
    
    def _get_larger_instance_type(self, current_type: str) -> str:
        """Get larger instance type recommendation"""
        upsize_map = {
            'm5.medium': 'm5.large',
            'm5.large': 'm5.xlarge',
            'm5.xlarge': 'm5.2xlarge',
            'm5.2xlarge': 'm5.4xlarge',
            't3.medium': 't3.large',
            't3.large': 't3.xlarge',
            't3.xlarge': 't3.2xlarge',
            'c5.medium': 'c5.large',
            'c5.large': 'c5.xlarge',
            'c5.xlarge': 'c5.2xlarge',
        }
        return upsize_map.get(current_type, current_type)
    
    def _calculate_cost_savings(self, current_type: str, recommended_type: str) -> float:
        """Calculate estimated monthly cost savings"""
        # Simplified pricing (actual pricing varies by region and usage)
        instance_pricing = {
            't3.medium': 33.41,
            't3.large': 66.82,
            't3.xlarge': 133.63,
            't3.2xlarge': 267.26,
            'm5.medium': 43.83,
            'm5.large': 87.66,
            'm5.xlarge': 175.32,
            'm5.2xlarge': 350.64,
            'm5.4xlarge': 701.28,
            'c5.medium': 38.69,
            'c5.large': 77.38,
            'c5.xlarge': 154.76,
            'c5.2xlarge': 309.52,
        }
        
        current_cost = instance_pricing.get(current_type, 0)
        recommended_cost = instance_pricing.get(recommended_type, 0)
        
        return current_cost - recommended_cost

# Usage example
if __name__ == "__main__":
    optimizer = CloudCostOptimizer()
    recommendations = optimizer.analyze_ec2_utilization(days=14)
    
    total_potential_savings = sum(rec['estimated_savings'] for rec in recommendations)
    
    print(f"Found {len(recommendations)} rightsizing opportunities")
    print(f"Total potential monthly savings: ${total_potential_savings:.2f}")
    
    for rec in recommendations:
        print(f"Instance {rec['instance_id']}: {rec['current_type']} -> {rec['recommended_type']} (${rec['estimated_savings']:.2f}/month)")
```

### Automated Resource Scheduling
```yaml
# kubernetes/cost-optimization/scheduler.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-down-dev-environments
  namespace: cost-optimization
spec:
  schedule: "0 19 * * 1-5"  # 7 PM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: cost-optimizer
          containers:
          - name: kubectl
            image: bitnami/kubectl:latest
            command:
            - /bin/sh
            - -c
            - |
              echo "Scaling down development environments..."
              
              # Scale down deployments in development namespaces
              for ns in development staging; do
                echo "Scaling down deployments in $ns namespace"
                kubectl get deployments -n $ns -o name | while read deployment; do
                  current_replicas=$(kubectl get $deployment -n $ns -o jsonpath='{.spec.replicas}')
                  if [ "$current_replicas" -gt 0 ]; then
                    # Store current replica count for scale-up
                    kubectl annotate $deployment -n $ns cost-optimizer/original-replicas=$current_replicas --overwrite
                    # Scale down to 0
                    kubectl scale $deployment -n $ns --replicas=0
                    echo "Scaled down $deployment from $current_replicas to 0"
                  fi
                done
              done
              
              echo "Development environments scaled down for cost optimization"
          restartPolicy: OnFailure
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-dev-environments
  namespace: cost-optimization
spec:
  schedule: "0 8 * * 1-5"   # 8 AM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: cost-optimizer
          containers:
          - name: kubectl
            image: bitnami/kubectl:latest
            command:
            - /bin/sh
            - -c
            - |
              echo "Scaling up development environments..."
              
              # Scale up deployments in development namespaces
              for ns in development staging; do
                echo "Scaling up deployments in $ns namespace"
                kubectl get deployments -n $ns -o name | while read deployment; do
                  original_replicas=$(kubectl get $deployment -n $ns -o jsonpath='{.metadata.annotations.cost-optimizer/original-replicas}')
                  if [ -n "$original_replicas" ] && [ "$original_replicas" -gt 0 ]; then
                    kubectl scale $deployment -n $ns --replicas=$original_replicas
                    echo "Scaled up $deployment to $original_replicas replicas"
                  fi
                done
              done
              
              echo "Development environments scaled up for business hours"
          restartPolicy: OnFailure
```

## Security and Compliance

### Network Security Configuration
```yaml
# security/network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-default
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 3000
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-to-database
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []  # Allow DNS
    ports:
    - protocol: UDP
      port: 53
```

### Secrets Management
```typescript
// utils/secrets-manager.ts
import { 
  SecretsManagerClient, 
  GetSecretValueCommand,
  RotateSecretCommand 
} from "@aws-sdk/client-secrets-manager";

interface DatabaseCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

interface ApiCredentials {
  stripeKey: string;
  sendgridKey: string;
  jwtSecret: string;
}

class SecretsManager {
  private client: SecretsManagerClient;
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(region: string = process.env.AWS_REGION || 'us-west-2') {
    this.client = new SecretsManagerClient({ region });
  }

  async getSecret<T>(secretName: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.client.send(command);
      const secretValue = JSON.parse(response.SecretString || '{}');
      
      // Cache the secret
      this.cache.set(secretName, {
        value: secretValue,
        expiry: Date.now() + this.CACHE_TTL
      });

      return secretValue;
    } catch (error) {
      console.error(`Error retrieving secret ${secretName}:`, error);
      throw new Error(`Failed to retrieve secret: ${secretName}`);
    }
  }

  async getDatabaseCredentials(): Promise<DatabaseCredentials> {
    return this.getSecret<DatabaseCredentials>('production/database/credentials');
  }

  async getApiCredentials(): Promise<ApiCredentials> {
    return this.getSecret<ApiCredentials>('production/api/credentials');
  }

  async rotateSecret(secretName: string): Promise<void> {
    try {
      const command = new RotateSecretCommand({
        SecretId: secretName,
      });

      await this.client.send(command);
      
      // Clear from cache to force refresh
      this.cache.delete(secretName);
      
      console.log(`Successfully initiated rotation for secret: ${secretName}`);
    } catch (error) {
      console.error(`Error rotating secret ${secretName}:`, error);
      throw new Error(`Failed to rotate secret: ${secretName}`);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default SecretsManager;
```

## Migration Strategies and Planning

### Assessment Framework
```python
# scripts/migration-assessment.py
from typing import Dict, List, Optional
import json
from dataclasses import dataclass
from enum import Enum

class MigrationComplexity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class MigrationType(Enum):
    REHOST = "rehost"          # Lift and shift
    REPLATFORM = "replatform"   # Lift, tinker, and shift
    REFACTOR = "refactor"       # Re-architect
    RETIRE = "retire"           # Decommission
    RETAIN = "retain"           # Keep on-premises

@dataclass
class Application:
    name: str
    technology_stack: List[str]
    dependencies: List[str]
    data_size_gb: int
    users_count: int
    compliance_requirements: List[str]
    current_infrastructure: str
    business_criticality: str  # low, medium, high, critical

class MigrationAssessment:
    def __init__(self):
        self.applications: List[Application] = []
        self.migration_waves: List[List[Application]] = []
    
    def assess_application(self, app: Application) -> Dict:
        """Assess an application for cloud migration readiness"""
        complexity = self._calculate_complexity(app)
        migration_type = self._recommend_migration_type(app)
        effort_weeks = self._estimate_effort(app, complexity)
        cost_estimate = self._estimate_cost(app, migration_type)
        
        return {
            'application': app.name,
            'complexity': complexity.value,
            'recommended_migration_type': migration_type.value,
            'estimated_effort_weeks': effort_weeks,
            'estimated_cost_usd': cost_estimate,
            'dependencies': app.dependencies,
            'risks': self._identify_risks(app),
            'benefits': self._identify_benefits(app),
            'prerequisites': self._identify_prerequisites(app)
        }
    
    def _calculate_complexity(self, app: Application) -> MigrationComplexity:
        """Calculate migration complexity based on various factors"""
        complexity_score = 0
        
        # Technology stack complexity
        if any(tech in ['mainframe', 'legacy', 'cobol'] for tech in app.technology_stack):
            complexity_score += 3
        elif any(tech in ['windows', '.net', 'sql_server'] for tech in app.technology_stack):
            complexity_score += 2
        elif any(tech in ['java', 'python', 'node.js', 'postgres'] for tech in app.technology_stack):
            complexity_score += 1
        
        # Data size impact
        if app.data_size_gb > 1000:
            complexity_score += 2
        elif app.data_size_gb > 100:
            complexity_score += 1
        
        # Dependencies
        complexity_score += min(len(app.dependencies), 3)
        
        # Compliance requirements
        if app.compliance_requirements:
            complexity_score += len(app.compliance_requirements)
        
        # Business criticality
        if app.business_criticality == 'critical':
            complexity_score += 2
        elif app.business_criticality == 'high':
            complexity_score += 1
        
        if complexity_score <= 3:
            return MigrationComplexity.LOW
        elif complexity_score <= 6:
            return MigrationComplexity.MEDIUM
        elif complexity_score <= 9:
            return MigrationComplexity.HIGH
        else:
            return MigrationComplexity.VERY_HIGH
    
    def _recommend_migration_type(self, app: Application) -> MigrationType:
        """Recommend migration strategy based on application characteristics"""
        # Check if application should be retired
        if app.users_count == 0 or 'deprecated' in app.technology_stack:
            return MigrationType.RETIRE
        
        # Check if application should be retained on-premises
        if (app.business_criticality == 'critical' and 
            any(req in ['air_gapped', 'classified'] for req in app.compliance_requirements)):
            return MigrationType.RETAIN
        
        # Check for refactoring opportunities
        if (any(tech in ['microservices', 'containers', 'kubernetes'] for tech in app.technology_stack) or
            app.users_count > 10000):
            return MigrationType.REFACTOR
        
        # Check for replatforming opportunities
        if any(tech in ['java', 'python', 'node.js'] for tech in app.technology_stack):
            return MigrationType.REPLATFORM
        
        # Default to rehosting
        return MigrationType.REHOST
    
    def _estimate_effort(self, app: Application, complexity: MigrationComplexity) -> int:
        """Estimate migration effort in weeks"""
        base_effort = {
            MigrationComplexity.LOW: 2,
            MigrationComplexity.MEDIUM: 6,
            MigrationComplexity.HIGH: 12,
            MigrationComplexity.VERY_HIGH: 24
        }
        
        effort = base_effort[complexity]
        
        # Add effort for data migration
        if app.data_size_gb > 100:
            effort += 2
        if app.data_size_gb > 1000:
            effort += 4
        
        # Add effort for dependencies
        effort += len(app.dependencies)
        
        return effort
    
    def _estimate_cost(self, app: Application, migration_type: MigrationType) -> int:
        """Estimate migration cost in USD"""
        base_costs = {
            MigrationType.REHOST: 10000,
            MigrationType.REPLATFORM: 25000,
            MigrationType.REFACTOR: 50000,
            MigrationType.RETIRE: 1000,
            MigrationType.RETAIN: 0
        }
        
        base_cost = base_costs[migration_type]
        
        # Scale by user count
        if app.users_count > 1000:
            base_cost *= 1.5
        if app.users_count > 10000:
            base_cost *= 2
        
        return int(base_cost)
    
    def _identify_risks(self, app: Application) -> List[str]:
        """Identify migration risks"""
        risks = []
        
        if app.data_size_gb > 1000:
            risks.append("Large data migration may cause extended downtime")
        
        if app.business_criticality == 'critical':
            risks.append("Critical application requires careful migration planning")
        
        if len(app.dependencies) > 5:
            risks.append("Complex dependencies may cause integration issues")
        
        if any(tech in ['legacy', 'mainframe'] for tech in app.technology_stack):
            risks.append("Legacy technology may have limited cloud compatibility")
        
        return risks
    
    def _identify_benefits(self, app: Application) -> List[str]:
        """Identify migration benefits"""
        benefits = [
            "Improved scalability and elasticity",
            "Reduced infrastructure management overhead",
            "Enhanced disaster recovery capabilities",
            "Access to managed services and latest technologies"
        ]
        
        if app.users_count > 1000:
            benefits.append("Better performance for high-traffic applications")
        
        if 'windows' in app.technology_stack:
            benefits.append("Reduced Windows licensing costs")
        
        return benefits
    
    def _identify_prerequisites(self, app: Application) -> List[str]:
        """Identify migration prerequisites"""
        prerequisites = [
            "Network connectivity setup (VPN or Direct Connect)",
            "Cloud account setup and IAM configuration",
            "Backup and disaster recovery planning"
        ]
        
        if app.compliance_requirements:
            prerequisites.append("Compliance assessment and approval")
        
        if app.data_size_gb > 100:
            prerequisites.append("Data migration strategy and tools")
        
        return prerequisites
    
    def create_migration_waves(self, assessments: List[Dict]) -> List[List[str]]:
        """Organize applications into migration waves"""
        # Sort by complexity and dependencies
        sorted_apps = sorted(assessments, key=lambda x: (
            len([dep for dep in x.get('dependencies', []) if dep in [a['application'] for a in assessments]]),
            {'low': 1, 'medium': 2, 'high': 3, 'very_high': 4}[x['complexity']]
        ))
        
        waves = []
        current_wave = []
        max_wave_size = 5
        
        for app in sorted_apps:
            if len(current_wave) >= max_wave_size:
                waves.append(current_wave)
                current_wave = []
            
            current_wave.append(app['application'])
        
        if current_wave:
            waves.append(current_wave)
        
        return waves

# Usage example
def main():
    assessment = MigrationAssessment()
    
    # Example applications
    apps = [
        Application(
            name="Legacy HR System",
            technology_stack=["java", "oracle", "windows"],
            dependencies=["Active Directory", "Email System"],
            data_size_gb=500,
            users_count=1000,
            compliance_requirements=["SOX", "GDPR"],
            current_infrastructure="on_premises",
            business_criticality="high"
        ),
        Application(
            name="E-commerce Platform",
            technology_stack=["node.js", "react", "postgres", "redis"],
            dependencies=["Payment Gateway", "CDN"],
            data_size_gb=2000,
            users_count=50000,
            compliance_requirements=["PCI-DSS"],
            current_infrastructure="on_premises",
            business_criticality="critical"
        )
    ]
    
    assessments = []
    for app in apps:
        assessment_result = assessment.assess_application(app)
        assessments.append(assessment_result)
        print(f"Assessment for {app.name}:")
        print(json.dumps(assessment_result, indent=2))
        print("-" * 50)
    
    # Create migration waves
    waves = assessment.create_migration_waves(assessments)
    print("Migration Waves:")
    for i, wave in enumerate(waves, 1):
        print(f"Wave {i}: {', '.join(wave)}")

if __name__ == "__main__":
    main()
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- **Infrastructure Setup**: VPC/VNet, security groups, IAM roles
- **CI/CD Pipeline**: GitHub Actions, container registry, deployment automation
- **Monitoring**: Prometheus, Grafana, alerting rules
- **Security**: Secrets management, network policies, security scanning

### Phase 2: Core Services (Weeks 5-8)
- **Database Migration**: RDS/Azure Database setup with replication
- **Application Deployment**: Containerized services on EKS/AKS
- **Load Balancing**: ALB/Application Gateway configuration
- **Auto-scaling**: HPA and cluster autoscaling

### Phase 3: Optimization (Weeks 9-12)
- **Performance Tuning**: Resource optimization, caching implementation
- **Cost Optimization**: Right-sizing, scheduled scaling, reserved instances
- **Security Hardening**: Compliance validation, penetration testing
- **Documentation**: Runbooks, architecture diagrams, team training

### Phase 4: Production Readiness (Weeks 13-16)
- **Disaster Recovery**: Multi-region setup, backup validation
- **Performance Testing**: Load testing, chaos engineering
- **Go-Live Planning**: Cutover procedures, rollback strategies
- **Post-Migration Support**: Monitoring, optimization, team enablement

## Success Metrics and KPIs

### Technical Performance
- **Availability**: 99.9%+ uptime
- **Performance**: < 200ms API response times
- **Scalability**: Handle 10x traffic without manual intervention
- **Security**: Zero critical security vulnerabilities

### Business Impact
- **Cost Reduction**: 30-50% infrastructure cost savings
- **Deployment Velocity**: 75% faster feature delivery
- **Operational Efficiency**: 60% reduction in manual tasks
- **Innovation**: 40% faster time-to-market for new features

### Team Productivity
- **Deployment Frequency**: Daily deployments with zero downtime
- **Mean Time to Recovery**: < 30 minutes for production issues
- **Developer Experience**: Self-service infrastructure provisioning
- **Knowledge Transfer**: 90% team proficiency in cloud technologies

## Conclusion

Successful cloud infrastructure implementation requires careful planning, proven architectural patterns, and continuous optimization. The strategies and examples outlined in this guide provide a foundation for building scalable, secure, and cost-effective cloud solutions.

The key to effective cloud adoption lies in understanding both the technical capabilities of modern platforms and the unique requirements of your organization. Whether migrating existing applications or building new cloud-native solutions, following these proven patterns will help ensure successful outcomes.

Through my experience implementing cloud solutions across diverse industries, I've observed that organizations achieving the greatest success are those that invest in proper planning, embrace automation, and maintain a focus on continuous improvement. The cloud provides unprecedented opportunities for innovation and efficiency when leveraged correctly.

---

**Keywords**: AWS cloud architecture, Azure infrastructure, cloud migration, Kubernetes deployment, DevOps automation, cloud cost optimization, enterprise cloud strategy, microservices architecture