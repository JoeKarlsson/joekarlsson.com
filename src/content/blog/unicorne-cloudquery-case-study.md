---
title: 'How Unicorne Increased Well-Architected Review Capacity by 60% with CloudQuery'
date: 2026-01-01
slug: 'unicorne-cloudquery-case-study'
description: 'How Unicorne used CloudQuery to automate AWS Well-Architected Framework Reviews and build their FinOps SaaS product Stable - cutting engagement time from 50 to 20 hours.'
categories: ['Dev Tools']
tags: ['CloudQuery', 'Cloud Infrastructure', 'Case Study', 'AWS']
canonicalUrl: 'https://www.cloudquery.io/blog/unicorne-cloudquery-case-study'
tldr: 'Unicorne cut WAFR engagement time from 50 hours to 20 by automating data collection with CloudQuery, then used the same infrastructure to build Stable, a FinOps SaaS product - without building a data layer from scratch.'
---

Unicorne, a Quebec-based AWS Advanced Tier Services Partner, used CloudQuery to transform how it delivers Well-Architected Framework Reviews (WAFR) and built its FinOps SaaS product Stable on top of the same infrastructure. The company won "2025 AWS Canada Rising Star Consulting Partner of the Year" at AWS re:2025.

## The Problem: Manual Data Gathering at Scale

Well-Architected Framework Reviews evaluate infrastructure across six pillars: Security, Cost Optimization, Reliability, Operational Excellence, Performance Efficiency, and Sustainability. Before CloudQuery, Unicorne's consultants spent over 50 hours per engagement on manual data gathering - logging into client consoles, running CLI commands, and extracting Cost Usage Reports.

## How Unicorne Automated AWS Well-Architected Reviews

CloudQuery automated data extraction across client accounts using cross-account IAM roles. For the Security and Cost Optimization pillars specifically, the process became fully automated. CIS Benchmark coverage that previously consumed hours per account now runs in minutes.

Engagement time dropped from 50 hours to 20. Rather than reducing output, this efficiency gain allowed consultants to invest 30 additional hours analyzing the remaining four pillars where human expertise adds the most value - effectively doubling consulting revenue without expanding headcount.

## Building Stable on CloudQuery

Unicorne productized its internal tooling into Stable, a FinOps platform addressing resource-level cost visibility. AWS Cost Explorer shows spending categories but not which specific resources or behaviors drive those costs.

The team evaluated building their own data collection layer but determined it would require several months of engineering effort. Using CloudQuery let them skip that entirely and focus on differentiating features: the recommendation engine, cost breakdowns, and alerting systems.

CloudQuery runs nightly as a containerized job, syncing resource inventories from customer AWS accounts to two destinations: Amazon S3 for historical analysis and recommendations processing, and Aurora PostgreSQL for low-latency application queries.

## Results

Unicorne's consulting practice now runs multiple WAFRs weekly. Stable's users - primarily DevOps engineers, FinOps practitioners, and CTOs at small to mid-size businesses - have achieved measurable savings: one client reduced cloud costs by 67%, another achieved 30% infrastructure savings, and a third cut AWS spending by 23%.

As Unicorne's leadership put it: "Proven, reliable, and easy to have access to your full cloud inventory."
