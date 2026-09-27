---
title: "Ticker Talk"
updatedDate: 2026-09-26
---

Ask Ticker Talk for a company's revenue in a given quarter and the answer comes back with the SEC accession number, the reporting period, the unit, and the date the figure was known. If the filing does not contain the number, the answer says so. It does not substitute a zero, a partial period, or a figure that was only published later.

That last property is the whole product. A fundamental analyst can get a fluent answer from any chatbot. What they cannot get is an answer they can verify in thirty seconds, anchored to what was actually public on a given date.

## Architecture

```
browser -> Next.js workspace -> FastAPI -> agent: plans, calls tools, explains
                                        -> PostgreSQL: SEC and XBRL facts (canonical)
                                        -> worker: ingestion, filing-change monitoring
```

PostgreSQL is the single source of truth. Redis handles coordination between the API and the worker. Anything else, such as a graph or a vector index, is an optional projection that can be rebuilt from Postgres.

The split between the model and the code is strict. The LLM plans, retrieves, and explains. Deterministic code owns accounting, units, period selection, and every calculation. Every fact query is bounded by `filed_date <= as_of`, so a restatement filed next year is invisible to a question about last year.

For fully specified questions (ticker, metric, as-of date, period) the agent does not need the model to compose the answer at all. It maps the metric through a small, reviewed table of SEC concepts, replays the exact row with the temporal constraint, and renders the result in code. The tool calls and telemetry still run, so these answers look the same in traces as any other.

## Evaluation

The harness computes each expected answer live and point-in-time, through the same read path the agent uses. A test can never reward look-ahead, because the ground truth cannot see the future either.

There are two scoring layers:

- **Deterministic scorer.** It extracts numbers from the answer text, normalizes "$394.33B", "394.33 billion" and "394,330 million" to the same value, and compares against the ground truth. The same text always gets the same score, which is what makes it possible to compare models on score per dollar.
- **Pinned LLM judge.** For open questions that have a reference answer and a rubric, the judge model and prompt are fixed so scores stay comparable between runs.

The golden set has 17 questions mapped to six analyst pains. Some are tagged as questions a general chatbot should fail and Ticker Talk should pass. Others probe capabilities I know are missing, so a failure there is a tracked gap, not a broken harness. A separate 13-case suite covers whole workflows (company reports, thesis updates, filing-change reviews) under one fixed knowledge cutoff.

Nothing ships on unit tests alone. The API has 1,405 unit tests, but a release is qualified by signed browser journeys against staging and then production, including a check that the answer and evidence saved to the database match what the user saw.

## Cutting the product down

Ticker Talk started as an AI stock screener. The usage log said otherwise: of 114 recorded user messages, 88 were questions about SEC filings and one was about screening. That sample includes my own release runs, so I treat it as a prioritization signal, not proof of demand. It was still enough to act on.

I removed screening, technical analysis, the portfolio views, and the market-data surfaces, along with every route, import, and dependency that only they used. In August 2026 I also retired the Neo4j graph as running infrastructure. Once I compared what it added for users against what it cost to operate, Postgres alone covered the product.

## An incident worth writing down

The landing-page example, a comparison of one company's latest filings, started timing out. The staging replay failed at 48.41 seconds. Three deadlines were involved (API at 48 seconds, web proxy at 58, browser at 59), and all of them were shorter than the agent's own 180-second budget.

Aligning the ceilings at 240, 300, and 330 seconds, while keeping heartbeats and client cancellation, got the request through in 148.95 seconds with an empty answer. The reasoning model had spent all 4,096 output tokens on reasoning and had nothing left for the response.

The fix was to default interactive calls to low reasoning effort and to stop forcing a 700-token limit that the model's internal reasoning also counted against. I then added that exact journey, with rendered citations and the saved-answer check, to the release gate. The latest production run completed in 13.6 seconds with 11 evidence cards.

## What I would do differently

I would build the evaluation harness and the point-in-time contract before the first feature. I built a screener first and deleted most of it later.

I would also define request deadlines as one budget passed down the stack, not as separate constants in each layer. Three layers that each looked reasonable in isolation added up to a request that could never finish.
