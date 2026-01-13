# Google Cloud CLI (gcloud) Reference

## Installation & Status

**Location:** `/Users/hb/google-cloud-sdk/bin/gcloud`

**Version:** Google Cloud SDK 551.0.0 (as of 2026-01-13)

**Active Account:** delta.bin.he@gmail.com
**Default Project:** gen-lang-client-0818638363

## Installed Components

| Component | Version |
|-----------|---------|
| core | 2026.01.02 |
| beta | 2026.01.02 |
| bq (BigQuery) | 2.1.26 |
| gsutil (Cloud Storage) | 5.35 |
| gcloud-crc32c | 1.0.0 |

## Quick Reference

### Getting Started

```bash
gcloud init                    # Initialize and configure gcloud
gcloud version                 # Display version info
gcloud info                    # Display environment details
gcloud components update       # Update to latest version
gcloud cheat-sheet             # Display helpful command reference
```

### Authentication

```bash
gcloud auth login                          # Login with user credentials
gcloud auth list                           # List authenticated accounts
gcloud auth activate-service-account       # Auth with service account
gcloud auth print-access-token             # Print current access token
gcloud auth revoke                         # Remove credentials
gcloud auth configure-docker               # Configure Docker credentials
```

### Configuration

```bash
gcloud config list                         # Show current configuration
gcloud config set project PROJECT_ID       # Set default project
gcloud config set compute/zone ZONE        # Set default zone
gcloud config set compute/region REGION    # Set default region
gcloud config get project                  # Get current project
gcloud config configurations list          # List all configurations
gcloud config configurations create NAME   # Create new config
gcloud config configurations activate NAME # Switch configuration
```

## Common Services

### Cloud Run

```bash
gcloud run deploy SERVICE --image IMAGE    # Deploy container
gcloud run services list                   # List services
gcloud run services describe SERVICE       # Show service details
gcloud run services delete SERVICE         # Delete service
gcloud run revisions list                  # List revisions
gcloud run jobs list                       # List jobs
gcloud run regions list                    # List available regions
```

### Cloud Functions

```bash
gcloud functions deploy NAME --runtime RUNTIME --trigger-http   # Deploy function
gcloud functions list                      # List functions
gcloud functions describe NAME             # Show function details
gcloud functions delete NAME               # Delete function
gcloud functions call NAME                 # Invoke function
gcloud functions logs read NAME            # View function logs
```

### Cloud Storage

```bash
gcloud storage buckets create gs://BUCKET  # Create bucket
gcloud storage buckets list                # List buckets
gcloud storage cp FILE gs://BUCKET/        # Upload file
gcloud storage cp gs://BUCKET/FILE .       # Download file
gcloud storage ls gs://BUCKET              # List bucket contents
gcloud storage rm gs://BUCKET/FILE         # Delete object
gcloud storage cat gs://BUCKET/FILE        # View file contents
```

### Cloud SQL

```bash
gcloud sql instances list                  # List instances
gcloud sql instances create NAME           # Create instance
gcloud sql instances describe NAME         # Show instance details
gcloud sql databases list --instance=NAME  # List databases
gcloud sql users list --instance=NAME      # List users
gcloud sql connect NAME --user=USER        # Connect to instance
gcloud sql backups list --instance=NAME    # List backups
```

### Secret Manager

```bash
gcloud secrets create NAME                 # Create secret
gcloud secrets list                        # List secrets
gcloud secrets describe NAME               # Show secret details
gcloud secrets versions add NAME --data-file=FILE  # Add version
gcloud secrets versions access latest --secret=NAME  # Get secret value
gcloud secrets delete NAME                 # Delete secret
```

### Compute Engine

```bash
gcloud compute instances list              # List VMs
gcloud compute instances create NAME       # Create VM
gcloud compute instances describe NAME     # Show VM details
gcloud compute instances start NAME        # Start VM
gcloud compute instances stop NAME         # Stop VM
gcloud compute instances delete NAME       # Delete VM
gcloud compute ssh NAME                    # SSH to VM
gcloud compute zones list                  # List zones
```

### Kubernetes Engine (GKE)

```bash
gcloud container clusters list             # List clusters
gcloud container clusters create NAME      # Create cluster
gcloud container clusters get-credentials NAME  # Get kubectl config
gcloud container clusters describe NAME    # Show cluster details
gcloud container images list-tags IMAGE    # List image tags
```

### IAM

```bash
gcloud iam service-accounts list           # List service accounts
gcloud iam service-accounts create NAME    # Create service account
gcloud iam service-accounts keys list --iam-account=SA  # List keys
gcloud iam roles list                      # List roles
gcloud projects add-iam-policy-binding PROJECT --member=MEMBER --role=ROLE
```

### Logging & Monitoring

```bash
gcloud logging logs list                   # List logs
gcloud logging read "FILTER"               # Read log entries
gcloud monitoring dashboards list          # List dashboards
```

### Pub/Sub

```bash
gcloud pubsub topics list                  # List topics
gcloud pubsub topics create NAME           # Create topic
gcloud pubsub subscriptions list           # List subscriptions
gcloud pubsub subscriptions create NAME --topic=TOPIC
```

### Services & APIs

```bash
gcloud services list                       # List enabled services
gcloud services list --available           # List available services
gcloud services enable SERVICE             # Enable service
gcloud services disable SERVICE            # Disable service
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--project=PROJECT` | Override default project |
| `--account=ACCOUNT` | Override default account |
| `--quiet, -q` | Disable interactive prompts |
| `--format=FORMAT` | Output format (json, yaml, table, etc.) |
| `--verbosity=LEVEL` | Set output verbosity |
| `--help` | Display help |

### Output Formats

```bash
--format=json           # JSON output
--format=yaml           # YAML output
--format=table          # Table output (default)
--format=value          # Raw values only
--format="value(FIELD)" # Specific field value
```

## Useful Command Groups

| Group | Description |
|-------|-------------|
| `ai` | Vertex AI resources |
| `app` | App Engine |
| `artifacts` | Artifact Registry |
| `builds` | Cloud Build |
| `composer` | Cloud Composer |
| `dataflow` | Dataflow jobs |
| `dataproc` | Dataproc clusters |
| `deploy` | Cloud Deploy |
| `dns` | Cloud DNS |
| `domains` | Domain management |
| `eventarc` | Eventarc triggers |
| `firestore` | Firestore databases |
| `kms` | Cloud KMS |
| `redis` | Memorystore Redis |
| `scheduler` | Cloud Scheduler |
| `spanner` | Cloud Spanner |
| `tasks` | Cloud Tasks |

## Additional Tools

- **bq** - BigQuery command-line tool
- **gsutil** - Cloud Storage utility (legacy, prefer `gcloud storage`)

## Resources

- [gcloud CLI Cheatsheet](https://cloud.google.com/sdk/docs/cheatsheet)
- [gcloud Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
