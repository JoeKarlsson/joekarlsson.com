---
title: 'Tempus: Multi-Cloud Asset Inventory Across 80+ AWS Accounts and 1000+ GCP Projects'
date: 2024-11-01
slug: 'tempus-multi-cloud-asset-inventory'
description: 'How Tempus uses CloudQuery on GCP with Terraform, GKE, Cloud SQL, and Grafana to run nightly syncs across 80+ AWS accounts and 1000+ GCP projects for compliance and security.'
categories: ['Dev Tools']
tags: ['CloudQuery', 'Cloud Infrastructure', 'Case Study', 'GCP', 'AWS']
canonicalUrl: 'https://www.cloudquery.io/blog/tempus-multi-cloud-asset-inventory?category=case-studies'
tldr: 'Tempus runs CloudQuery in production on GCP using Terraform IaC, fetching resources nightly from 80+ AWS accounts and 1000+ GCP projects to support compliance monitoring, security posture management, and data governance.'
---

Tempus runs CloudQuery in production to handle a complex multi-cloud environment spanning over 80 AWS accounts and 1,000+ GCP projects.

Their setup deploys everything via Terraform infrastructure as code to Google Cloud Platform. The infrastructure runs within GCP, using GKE and Docker for compute, Cloud SQL for the PostgreSQL database, and Grafana for visualization and analysis.

Resources are fetched nightly through a cron job. Policy benchmark checks run periodically, with results stored in Google Cloud Storage, then synced to BigQuery and Google Sheets for stakeholder reporting.

The primary use cases are assurance monitoring, compliance verification, and cloud security posture management. The Security Operations Center, Cloud Security, and Data Governance teams are the primary consumers of the data.

As Michael from Tempus described their approach: "We use CloudQuery in a production environment, deploying everything via Terraform infrastructure as code to Google Cloud Platform."
