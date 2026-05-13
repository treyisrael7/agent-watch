import { randomUUID } from "node:crypto";

const DEFAULT_TRACE_URL = "http://localhost:8000/api/traces";
const traceUrl = process.env.AGENT_WATCH_TRACE_URL ?? DEFAULT_TRACE_URL;

const scenarios = {
  "successful-grounded-answer": {
    agentName: "Customer Support Refund Agent",
    status: "success",
    uncertaintyScore: 0.09,
    userInput: "Can I get a refund for order CS-1042? It arrived damaged yesterday.",
    retrieval: {
      query: "refund policy damaged item delivered yesterday",
      documents: [
        {
          id: "policy_refunds_damaged_items",
          title: "Refunds for damaged items",
          excerpt:
            "Damaged items reported within 14 days are eligible for a full refund after order validation.",
        },
        {
          id: "policy_refund_timeline",
          title: "Refund processing timeline",
          excerpt:
            "Approved refunds are returned to the original payment method within 5-7 business days.",
        },
      ],
      grounded: true,
    },
    toolCall: {
      name: "lookup_order",
      input: { order_id: "CS-1042" },
      output: {
        order_id: "CS-1042",
        status: "delivered",
        delivered_at: "2026-05-12T16:22:00Z",
        refundable: true,
        refund_amount_usd: 49.99,
      },
      ok: true,
    },
    llmDecision: {
      label: "approve_refund",
      rationale:
        "The retrieved policy covers damaged items reported within 14 days and the order lookup confirms eligibility.",
      cited_documents: ["policy_refunds_damaged_items", "policy_refund_timeline"],
    },
    finalOutput:
      "Yes. Your order CS-1042 is eligible for a full $49.99 refund because damaged items reported within 14 days qualify under our refund policy. The refund should return to your original payment method within 5-7 business days.",
  },
  "tool-failure": {
    agentName: "Customer Support Refund Agent",
    status: "failed",
    uncertaintyScore: 0.74,
    userInput: "I want a refund for order CS-2048. Can you start it now?",
    retrieval: {
      query: "refund policy standard order refund eligibility",
      documents: [
        {
          id: "policy_standard_refunds",
          title: "Standard refund eligibility",
          excerpt:
            "Refund eligibility depends on order status, delivery date, item condition, and payment capture state.",
        },
      ],
      grounded: true,
    },
    toolCall: {
      name: "lookup_order",
      input: { order_id: "CS-2048" },
      output: {
        error: "Order service timed out after 2500ms",
        retryable: true,
      },
      ok: false,
    },
    llmDecision: {
      label: "defer_refund",
      rationale:
        "The policy requires order-specific facts, but the order lookup tool failed before eligibility could be verified.",
      cited_documents: ["policy_standard_refunds"],
    },
    finalOutput:
      "I cannot start the refund yet because I could not verify order CS-2048. Please try again in a few minutes or contact support with this order number so we can check eligibility.",
  },
  "unstable-low-uncertainty": {
    agentName: "Customer Support Refund Agent",
    status: "unstable",
    uncertaintyScore: 0.06,
    userInput: "Can I get a refund for a final sale item from two months ago?",
    retrieval: {
      query: "refund policy final sale item after 60 days",
      documents: [
        {
          id: "policy_final_sale",
          title: "Final sale policy",
          excerpt:
            "Final sale items are not refundable unless required by law or covered by a defect exception.",
        },
        {
          id: "policy_refund_window",
          title: "Refund window",
          excerpt: "Most eligible items must be returned within 30 days of delivery.",
        },
      ],
      grounded: true,
    },
    toolCall: {
      name: "check_exception_eligibility",
      input: { item_type: "final_sale", days_since_delivery: 60 },
      output: {
        eligible_for_exception: false,
        reason: "No defect or legal exception recorded",
      },
      ok: true,
    },
    llmDecision: {
      label: "incorrectly_approve_refund",
      rationale:
        "The model answered confidently even though the retrieved policy and tool result both point to ineligibility.",
      cited_documents: ["policy_final_sale", "policy_refund_window"],
      instability_flags: [
        "contradicts_retrieval",
        "contradicts_tool_output",
        "overconfident_low_uncertainty",
      ],
    },
    finalOutput:
      "Yes, you should be able to receive a refund for the final sale item even though it was purchased two months ago.",
  },
};

function isoAt(baseTime, offsetMs) {
  return new Date(baseTime.getTime() + offsetMs).toISOString();
}

function span(spanId, type, name, input, output, startedAt, endedAt, metadata = {}) {
  return {
    span_id: spanId,
    type,
    name,
    input,
    output,
    started_at: startedAt,
    ended_at: endedAt,
    latency_ms: new Date(endedAt).getTime() - new Date(startedAt).getTime(),
    metadata,
  };
}

function buildTrace(scenarioName, scenario) {
  const started = new Date();
  const runId = `run_support_${scenarioName}_${randomUUID().slice(0, 8)}`;
  const receivedAt = isoAt(started, 0);
  const retrievedAt = isoAt(started, 450);
  const toolStartedAt = isoAt(started, 500);
  const toolEndedAt = isoAt(started, scenario.toolCall.ok ? 1250 : 3000);
  const decisionStartedAt = isoAt(started, scenario.toolCall.ok ? 1300 : 3050);
  const decisionEndedAt = isoAt(started, scenario.toolCall.ok ? 2100 : 3725);
  const finalStartedAt = isoAt(started, scenario.toolCall.ok ? 2150 : 3775);
  const completedAt = isoAt(started, scenario.toolCall.ok ? 2600 : 4200);

  return {
    run_id: runId,
    agent_name: scenario.agentName,
    status: scenario.status,
    started_at: receivedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(receivedAt).getTime(),
    user_input: scenario.userInput,
    final_output: scenario.finalOutput,
    uncertainty_score: scenario.uncertaintyScore,
    spans: [
      span(
        "span_user_input",
        "decision",
        "Log user input",
        { channel: "chat" },
        { text: scenario.userInput },
        receivedAt,
        isoAt(started, 80),
        { step: "user_input" },
      ),
      span(
        "span_retrieval",
        "retrieval",
        "Retrieve refund policy context",
        { query: scenario.retrieval.query, top_k: 2 },
        {
          documents: scenario.retrieval.documents,
          grounded: scenario.retrieval.grounded,
        },
        isoAt(started, 100),
        retrievedAt,
        { index: "refund_policy_knowledge_base" },
      ),
      span(
        "span_tool_call",
        "tool_call",
        scenario.toolCall.name,
        scenario.toolCall.input,
        scenario.toolCall.output,
        toolStartedAt,
        toolEndedAt,
        {
          tool_name: scenario.toolCall.name,
          status: scenario.toolCall.ok ? "success" : "error",
        },
      ),
      span(
        "span_llm_decision",
        "llm_call",
        "Decide refund response",
        {
          user_input: scenario.userInput,
          retrieved_document_ids: scenario.retrieval.documents.map((document) => document.id),
          tool_status: scenario.toolCall.ok ? "success" : "error",
        },
        scenario.llmDecision,
        decisionStartedAt,
        decisionEndedAt,
        {
          model: "demo-support-llm",
          temperature: 0.2,
        },
      ),
      span(
        "span_final_answer",
        "decision",
        "Return final answer",
        { decision: scenario.llmDecision.label },
        { answer: scenario.finalOutput },
        finalStartedAt,
        completedAt,
        { step: "final_answer" },
      ),
    ],
  };
}

async function postTrace(trace) {
  console.log(`\nPosting ${trace.run_id} to ${traceUrl}`);
  console.log(`User input: ${trace.user_input}`);

  const response = await fetch(traceUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trace, null, 2),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Trace ingestion failed with ${response.status} ${response.statusText}: ${body}`,
    );
  }

  const createdTrace = await response.json();
  console.log(`Created trace: ${createdTrace.run_id} (${createdTrace.status})`);
}

function selectedScenarios() {
  const requested = process.argv.slice(2);

  if (requested.length === 0 || requested.includes("all")) {
    return Object.entries(scenarios);
  }

  const unknown = requested.filter((name) => !scenarios[name]);
  if (unknown.length > 0) {
    throw new Error(
      `Unknown scenario(s): ${unknown.join(", ")}. Valid scenarios: ${Object.keys(scenarios).join(", ")}, all`,
    );
  }

  return requested.map((name) => [name, scenarios[name]]);
}

async function main() {
  const traces = selectedScenarios().map(([scenarioName, scenario]) =>
    buildTrace(scenarioName, scenario),
  );

  for (const trace of traces) {
    await postTrace(trace);
  }

  console.log(
    `\nPosted ${traces.length} customer support trace(s). Open http://localhost:3000/traces to inspect them.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
