# Production Deployment Guide

本文档整理了项目部署到 Google Cloud 所需的 gcloud 命令，按场景分类。

## 目录

1. [初始设置](#1-初始设置)
2. [数据库 (Cloud SQL)](#2-数据库-cloud-sql)
3. [Secret Manager](#3-secret-manager)
4. [Container Registry](#4-container-registry)
5. [Cloud Run](#5-cloud-run)
6. [Cloud Build CI/CD](#6-cloud-build-cicd)
7. [日志与监控](#7-日志与监控)
8. [常用运维命令](#8-常用运维命令)

---

## 1. 初始设置

### 登录与项目配置

```bash
# 登录 Google Cloud
gcloud auth login

# 查看当前项目
gcloud config get-value project

# 设置默认项目
gcloud config set project PROJECT_ID

# 查看项目列表
gcloud projects list

# 查看当前配置
gcloud config list
```

### 启用必要的 API

```bash
# 启用 Cloud Run API
gcloud services enable run.googleapis.com

# 启用 Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# 启用 Container Registry API
gcloud services enable containerregistry.googleapis.com

# 启用 Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# 启用 Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 启用 Cloud Source Repositories API (可选)
gcloud services enable sourcerepo.googleapis.com

# 一次性启用所有
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

---

## 2. 数据库 (Cloud SQL)

### 创建 Cloud SQL 实例

```bash
# 创建 PostgreSQL 实例
gcloud sql instances create INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_PASSWORD

# 创建高性能实例
gcloud sql instances create INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-perf-optimized-N-2 \
  --region=asia-east1 \
  --root-password=YOUR_PASSWORD
```

### 数据库操作

```bash
# 列出所有实例
gcloud sql instances list

# 查看实例详情
gcloud sql instances describe INSTANCE_NAME

# 创建数据库
gcloud sql databases create DATABASE_NAME --instance=INSTANCE_NAME

# 列出数据库
gcloud sql databases list --instance=INSTANCE_NAME

# 删除数据库
gcloud sql databases delete DATABASE_NAME --instance=INSTANCE_NAME

# 连接到数据库 (需要 Cloud SQL Proxy 或授权网络)
gcloud sql connect INSTANCE_NAME --user=postgres
```

### 用户管理

```bash
# 创建用户
gcloud sql users create USERNAME \
  --instance=INSTANCE_NAME \
  --password=PASSWORD

# 列出用户
gcloud sql users list --instance=INSTANCE_NAME

# 修改用户密码
gcloud sql users set-password USERNAME \
  --instance=INSTANCE_NAME \
  --password=NEW_PASSWORD
```

---

## 3. Secret Manager

### 创建 Secrets

```bash
# 从命令行创建 secret
echo -n 'secret-value' | gcloud secrets create SECRET_NAME --data-file=-

# 从文件创建 secret
gcloud secrets create SECRET_NAME --data-file=path/to/file

# 创建带标签的 secret
gcloud secrets create SECRET_NAME \
  --data-file=- \
  --labels=env=prod,app=myapp
```

### 管理 Secrets

```bash
# 列出所有 secrets
gcloud secrets list

# 查看 secret 详情
gcloud secrets describe SECRET_NAME

# 查看 secret 值
gcloud secrets versions access latest --secret=SECRET_NAME

# 添加新版本
echo -n 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-

# 删除 secret
gcloud secrets delete SECRET_NAME
```

### 权限管理

```bash
# 授权服务账号访问 secret
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# 查看 secret 权限
gcloud secrets get-iam-policy SECRET_NAME
```

---

## 4. Container Registry

### 构建与推送镜像

```bash
# 使用 Cloud Build 构建并推送
gcloud builds submit --tag gcr.io/PROJECT_ID/IMAGE_NAME

# 指定 Dockerfile
gcloud builds submit --tag gcr.io/PROJECT_ID/IMAGE_NAME --dockerfile=Dockerfile

# 使用配置文件构建
gcloud builds submit --config=cloudbuild.yaml

# 本地 Docker 推送到 GCR
docker tag IMAGE gcr.io/PROJECT_ID/IMAGE_NAME
docker push gcr.io/PROJECT_ID/IMAGE_NAME
```

### 镜像管理

```bash
# 列出镜像
gcloud container images list

# 列出镜像标签
gcloud container images list-tags gcr.io/PROJECT_ID/IMAGE_NAME

# 删除镜像
gcloud container images delete gcr.io/PROJECT_ID/IMAGE_NAME:TAG
```

---

## 5. Cloud Run

### 部署服务

```bash
# 基础部署
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT_ID/IMAGE_NAME \
  --region us-central1 \
  --platform managed

# 完整部署 (带环境变量和 Cloud SQL)
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT_ID/IMAGE_NAME \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME \
  --set-env-vars "KEY1=value1,KEY2=value2" \
  --update-secrets "ENV_VAR=SECRET_NAME:latest"

# 使用分隔符处理特殊字符
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT_ID/IMAGE_NAME \
  --set-env-vars "^||^KEY1=value1||KEY2=value with spaces||KEY3=value,with,commas"
```

### 服务管理

```bash
# 列出服务
gcloud run services list

# 查看服务详情
gcloud run services describe SERVICE_NAME --region=REGION

# 获取服务 URL
gcloud run services describe SERVICE_NAME --region=REGION --format='value(status.url)'

# 查看服务配置
gcloud run services describe SERVICE_NAME --region=REGION --format=yaml

# 删除服务
gcloud run services delete SERVICE_NAME --region=REGION
```

### 流量管理

```bash
# 查看修订版本
gcloud run revisions list --service=SERVICE_NAME --region=REGION

# 将流量切换到特定版本
gcloud run services update-traffic SERVICE_NAME \
  --region=REGION \
  --to-revisions=REVISION_NAME=100

# 金丝雀发布 (90/10 分流)
gcloud run services update-traffic SERVICE_NAME \
  --region=REGION \
  --to-revisions=OLD_REVISION=90,NEW_REVISION=10
```

### 配置更新

```bash
# 更新环境变量
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --update-env-vars "KEY=new_value"

# 更新 secrets
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --update-secrets "ENV_VAR=SECRET_NAME:latest"

# 更新资源配置
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --timeout=300

# 设置最小/最大实例数
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --min-instances=1 \
  --max-instances=10
```

---

## 6. Cloud Build CI/CD

### Triggers 管理

```bash
# 列出 triggers
gcloud builds triggers list

# 创建 GitHub trigger
gcloud builds triggers create github \
  --name="trigger-name" \
  --repo-name="repo" \
  --repo-owner="owner" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml"

# 创建 Cloud Source Repositories trigger
gcloud builds triggers create cloud-source-repositories \
  --name="trigger-name" \
  --repo="repo-name" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml"

# 手动触发构建
gcloud builds triggers run TRIGGER_NAME --branch=main

# 删除 trigger
gcloud builds triggers delete TRIGGER_NAME
```

### 构建历史

```bash
# 查看构建历史
gcloud builds list

# 查看特定构建详情
gcloud builds describe BUILD_ID

# 查看构建日志
gcloud builds log BUILD_ID

# 取消正在进行的构建
gcloud builds cancel BUILD_ID
```

### cloudbuild.yaml 示例

```yaml
steps:
  # 构建镜像
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA', '.']

  # 推送镜像
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA']

  # 部署到 Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'app'
      - '--image'
      - 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA'
```

---

## 7. 日志与监控

### 查看日志

```bash
# 查看 Cloud Run 服务日志
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME" \
  --limit=50 \
  --format="table(timestamp,textPayload)"

# 查看特定修订版本日志
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.revision_name=REVISION_NAME" \
  --limit=50

# 查看错误日志
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50

# 实时查看日志 (streaming)
gcloud alpha logging tail "resource.type=cloud_run_revision"

# 查看 Cloud Build 日志
gcloud logging read "resource.type=build" --limit=50
```

### 监控指标

```bash
# 查看服务指标
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"
```

---

## 8. 常用运维命令

### 一键部署脚本

```bash
#!/bin/bash
# deploy.sh

PROJECT_ID="your-project-id"
SERVICE_NAME="your-service"
REGION="us-central1"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 构建并推送
gcloud builds submit --tag ${IMAGE} --project ${PROJECT_ID}

# 部署
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --region ${REGION} \
  --platform managed \
  --project ${PROJECT_ID}

# 显示 URL
gcloud run services describe ${SERVICE_NAME} \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --format 'value(status.url)'
```

### 回滚到上一版本

```bash
# 列出修订版本
gcloud run revisions list --service=SERVICE_NAME --region=REGION

# 回滚到指定版本
gcloud run services update-traffic SERVICE_NAME \
  --region=REGION \
  --to-revisions=PREVIOUS_REVISION=100
```

### 健康检查

```bash
# 检查服务状态
curl -s https://SERVICE_URL/health

# 检查服务是否正常
gcloud run services describe SERVICE_NAME \
  --region=REGION \
  --format='value(status.conditions[0].status)'
```

### 清理资源

```bash
# 删除旧的修订版本 (保留最近 5 个)
gcloud run revisions list --service=SERVICE_NAME --region=REGION \
  --format='value(name)' | tail -n +6 | \
  xargs -I {} gcloud run revisions delete {} --region=REGION --quiet

# 删除旧镜像
gcloud container images list-tags gcr.io/PROJECT_ID/IMAGE_NAME \
  --format='get(digest)' --filter='timestamp.datetime < "2024-01-01"' | \
  xargs -I {} gcloud container images delete gcr.io/PROJECT_ID/IMAGE_NAME@{} --quiet
```

---

## 项目特定配置

### 本项目 (lem-api) 配置

```bash
# 项目 ID
PROJECT_ID=gen-lang-client-0818638363

# Cloud SQL 实例
INSTANCE=lemonade-postgres
REGION=asia-east1
DATABASE=lem

# Cloud Run 服务
SERVICE=lem-api
RUN_REGION=us-central1

# 服务 URL
https://lem-api-903028288904.us-central1.run.app
```

### 快速部署

```bash
# 方式 1: 使用 deploy.sh
./deploy.sh

# 方式 2: 使用 Makefile
make deploy

# 方式 3: 推送到 GitHub (自动触发 Cloud Build)
git push origin main
```

### Secrets 列表

| Secret Name | 描述 |
|-------------|------|
| lem-database-url | 数据库连接字符串 |
| lem-jwt-secret | JWT 签名密钥 |
| lem-stripe-secret | Stripe API 密钥 |
| lem-stripe-webhook-secret | Stripe Webhook 密钥 |
| lem-google-client-secret | Google OAuth 密钥 |
| lem-smtp-password | SMTP 邮箱密码 |
