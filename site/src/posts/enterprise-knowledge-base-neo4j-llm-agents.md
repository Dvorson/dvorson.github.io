---
title: "How to Build an Enterprise Knowledge Base with Neo4j and LLM Agents"
description: "Step-by-step guide to building an enterprise knowledge base with Neo4j and LLM agents. Real architecture decisions from a Fortune-500 implementation."
pubDate: "2026-03-05"
author: "Anton Dvorson"
tags: ["Neo4j", "Knowledge Graph", "LLM Agents", "Enterprise AI", "GraphRAG", "Knowledge Base", "AI Architecture"]
categories: ["AI Engineering", "Technical Consulting"]
heroImage: "/img/neo4j-knowledge-base.jpg"
---

# How to Build an Enterprise Knowledge Base with Neo4j and LLM Agents

Most enterprise knowledge bases share the same fate: they start as a well-organized repository and gradually decay into a graveyard of outdated, contradictory, and unfindable content. I have seen this pattern at every large organization I have worked with. Thousands of articles, wikis, and runbooks accumulate over years, but finding the right answer to a specific question becomes nearly impossible.

Earlier this year I built a system that changed this for a Fortune-500 client. The architecture combines Neo4j as a knowledge graph, an entity extraction pipeline, and specialized LLM agents that can reason across the entire knowledge base. This post is a practitioner's breakdown of how I built it and what I learned.

## Why Traditional Search Fails at Enterprise Scale

Before getting into the solution, it is worth understanding why the obvious approaches fall short.

**Keyword search** works when you know the exact terminology. But enterprise knowledge bases are written by hundreds of authors over many years. The same concept gets described differently across teams, products, and time periods. A keyword search for "SSO configuration" might miss the article titled "Setting up single sign-on for enterprise clients" because the author never used the abbreviation.

**Vector search (basic RAG)** improves on this by matching semantic meaning rather than exact words. But it has a fundamental limitation: it retrieves chunks of text in isolation. When your question requires connecting information from three different articles -- say, "What is the current recommended SSO setup for our enterprise tier, and does it support the MFA requirements from the Q3 security update?" -- vector search retrieves pieces that are individually relevant but cannot reason about their relationships.

**The knowledge graph approach** solves this by first organizing information into entities and relationships, then using that structure to retrieve contextually connected content. It is more work to build, but the answers are dramatically better.

## Architecture Overview

The system I built has four layers that work together.

**Layer 1: Ingestion and Entity Extraction.** A Python pipeline reads articles from the source system (Salesforce Knowledge in this case, but the pattern applies to Confluence, SharePoint, or any CMS). Each article passes through an LLM-powered extraction step that identifies entities (products, features, procedures, teams, error codes) and relationships between them. The output is a set of structured nodes and edges ready for the graph.

**Layer 2: The Neo4j Knowledge Graph.** Neo4j stores the extracted entities and relationships along with the original content chunks. The graph model I used has about a dozen node types -- Article, Product, Feature, Procedure, ErrorCode, Team, Version -- connected by typed relationships like DESCRIBES, REQUIRES, SUPERSEDES, and RELATES_TO. This structure lets you traverse from a product to its features to the procedures that configure those features to the error codes you might encounter.

**Layer 3: Query Agents.** Instead of a single monolithic query pipeline, I built specialized [LLM agents](/solutions/ai-agents) that handle different types of questions. A routing agent classifies the incoming question and dispatches it to the right specialist: a factual lookup agent, a procedure agent, a troubleshooting agent, or a comparison agent. Each agent knows how to construct the right Cypher queries and how to synthesize the retrieved information.

**Layer 4: Feedback and Freshness.** Articles get stale. The system tracks which articles are cited in answers and flags contradictions automatically. When two articles disagree on the same topic, the system surfaces this for human review rather than silently picking one.

## Ontology Design: The Decisions That Matter Most

The single most important decision in this kind of project is ontology design -- how you model the entities and relationships. Get this wrong and no amount of engineering will save you.

I started with a temptingly comprehensive ontology that modeled everything: authors, revision histories, access permissions, every possible relationship type. After two weeks of entity extraction producing inconsistent results, I stripped it back to a focused model with seven core node types and twelve relationship types.

**The principle:** model what you need to answer questions, not what you think might be useful someday. Every node type and relationship must earn its place by enabling a specific class of query that would be impossible without it.

For this project, the SUPERSEDES relationship turned out to be the highest-value addition. Knowledge bases accumulate contradictory information because old articles are never deleted when new ones are published. By explicitly modeling which articles supersede which, the query agents could always prefer the most current information.

## Entity Extraction at Scale

Extracting entities from tens of thousands of articles is where theory meets reality. Here is what I learned.

**Batch processing with checkpoints.** Processing thousands of articles through an LLM takes hours and costs real money. I built the pipeline with checkpoint-and-resume capability so that a failure at article 8,000 does not mean starting over from scratch. Each batch of 100 articles is processed, validated, and committed to Neo4j before moving to the next.

**Entity resolution is the hard part.** The same product might be called "Enterprise SSO," "SSO for Enterprise," "enterprise single sign-on," and "E-SSO" across different articles. Without entity resolution, you get four separate nodes in the graph instead of one. I used a combination of LLM-based normalization and fuzzy matching to merge duplicates, but this required several rounds of tuning and manual review.

**Confidence scoring.** Not every extraction is equally reliable. I added confidence scores to extracted relationships and set thresholds for automatic acceptance versus human review. Relationships extracted with high confidence (clear, explicit statements in the text) go straight into the graph. Lower-confidence extractions (implied relationships, ambiguous references) go into a review queue.

## Query Agent Architecture

The multi-agent approach was essential for handling the variety of questions that enterprise users ask. A single prompt template cannot handle "What is the default timeout for SSO?" and "Walk me through configuring MFA for our enterprise tier" and "Why am I getting error E-4012 after the latest update?" equally well.

I built four specialized agents using [Langflow for orchestration](/case-studies/multi-agent-telecom):

**Factual Lookup Agent.** Handles simple factual questions. Constructs a targeted Cypher query, retrieves the relevant subgraph, and generates a direct answer with source citations.

**Procedure Agent.** Handles how-to questions. Retrieves step-by-step procedures and checks for prerequisite steps that might live in different articles. Returns ordered instructions with links to source material.

**Troubleshooting Agent.** Handles error codes and problem descriptions. Traverses the graph from error codes to known causes to resolution procedures. This agent has the most complex Cypher queries because troubleshooting paths often span multiple hops.

**Comparison Agent.** Handles questions that require comparing two or more options. Retrieves information about each option from the graph and presents a structured comparison rather than a single narrative answer.

A lightweight routing agent sits in front of these four, classifying each incoming question and dispatching it appropriately. In production, the routing agent correctly classifies about 93 percent of questions, with the remaining 7 percent falling back to the factual lookup agent as a safe default.

## Production Considerations

Building the system is one thing. Keeping it running reliably in production is another.

**Incremental updates.** The knowledge base changes daily. New articles are published, existing ones are updated, and occasionally articles are retired. The ingestion pipeline runs incrementally -- processing only changed articles since the last run -- and updates the graph accordingly. Full rebuilds happen weekly as a consistency check.

**Access control.** Enterprise knowledge bases often have restricted articles visible only to certain teams. The graph respects these permissions by tagging nodes with access levels and filtering query results based on the requesting user's role.

**Monitoring.** I track three things in Grafana: query latency (p50, p95, p99), answer quality scores (based on user feedback), and graph freshness (time since last successful sync). When answer quality drops below a threshold for a particular topic area, it usually means the underlying articles need updating.

**Cost management.** LLM calls are the primary cost driver. I implemented aggressive caching for repeated and near-duplicate questions, which reduced LLM costs by roughly 60 percent in the first month of production.

## Results and Lessons

After three months in production, the system serves around 2,000 queries per day with a user satisfaction rate of 87 percent (measured by thumbs-up/thumbs-down feedback). The previous keyword search had an estimated satisfaction rate of about 40 percent based on internal surveys.

The most valuable lesson: invest heavily in ontology design and entity resolution before scaling up. I spent nearly three weeks -- almost a quarter of the total project timeline -- on these two areas, and it was worth every day. Teams that rush past ontology design end up with a graph that is too noisy to query effectively.

If you are considering a similar project for your organization, I have written a broader guide on the [GraphRAG approach](/solutions/graphrag) and published a detailed [case study](/case-studies/graphrag-knowledge-base) from this project. The architecture is adaptable to any enterprise knowledge source -- the core patterns remain the same whether your content lives in Salesforce, Confluence, SharePoint, or a custom CMS.