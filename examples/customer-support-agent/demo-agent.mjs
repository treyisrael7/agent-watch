import { AgentWatch } from "@agent-watch/sdk";

const DEFAULT_TRACE_URL = "http://localhost:8000/api/traces";
const traceUrl = process.env.AGENT_WATCH_TRACE_URL ?? DEFAULT_TRACE_URL;

const scenarios = {
  "successful-refund-answer": {
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
    decision: {
      label: "approve_refund",
      rationale:
        "The retrieved policy covers damaged items reported within 14 days and the order lookup confirms eligibility.",
      cited_documents: ["policy_refunds_damaged_items", "policy_refund_timeline"],
    },
    llmCall: {
      model: "support-refund-assistant-v1",
      prompt_tokens: 1186,
      completion_tokens: 154,
      temperature: 0.2,
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
    decision: {
      label: "defer_refund",
      rationale:
        "The policy requires order-specific facts, but the order lookup tool failed before eligibility could be verified.",
      cited_documents: ["policy_standard_refunds"],
    },
    llmCall: {
      model: "support-refund-assistant-v1",
      prompt_tokens: 941,
      completion_tokens: 88,
      temperature: 0.2,
    },
    finalOutput:
      "I cannot start the refund yet because I could not verify order CS-2048. Please try again in a few minutes or contact support with this order number so we can check eligibility.",
  },
  "unstable-uncertain-answer": {
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
    decision: {
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
    llmCall: {
      model: "support-refund-assistant-v1",
      prompt_tokens: 1033,
      completion_tokens: 72,
      temperature: 0.2,
    },
    finalOutput:
      "Yes, you should be able to receive a refund for the final sale item even though it was purchased two months ago.",
  },
};

const scenarioAliases = {
  "successful-grounded-answer": "successful-refund-answer",
  "unstable-low-uncertainty": "unstable-uncertain-answer",
};

function createScenarioClock(toolCallSucceeded) {
  const started = Date.now();
  const offsets = toolCallSucceeded
    ? [0, 120, 620, 700, 1450, 1500, 1720, 1780, 2550, 2700]
    : [0, 120, 620, 700, 3400, 3480, 3800, 3880, 4620, 4800];
  let index = 0;

  return () => new Date(started + offsets[Math.min(index++, offsets.length - 1)]);
}

function createScenarioIdGenerator(scenarioName) {
  const suffix = Math.random().toString(36).slice(2, 8);
  let spanIndex = 0;

  return (prefix) => {
    if (prefix === "run") {
      return `run_support_${scenarioName}_${suffix}`;
    }

    spanIndex += 1;
    return `span_${scenarioName}_${spanIndex}`;
  };
}

async function runScenario(scenarioName, scenario) {
  const watcher = new AgentWatch({
    endpoint: traceUrl,
    apiKey: process.env.AGENT_WATCH_API_KEY ?? "dev-key",
    idGenerator: createScenarioIdGenerator(scenarioName),
    now: createScenarioClock(scenario.toolCall.ok),
  });

  const trace = watcher.startTrace({
    agentName: scenario.agentName,
    userInput: scenario.userInput,
  });

  console.log(`\nRunning ${scenarioName}`);
  console.log(`Posting ${trace.runId} to ${traceUrl}`);
  console.log(`User input: ${scenario.userInput}`);

  trace.addSpan({
    type: "retrieval",
    name: "Retrieve refund policy context",
    input: { query: scenario.retrieval.query, topK: 2 },
    output: {
      documents: scenario.retrieval.documents,
      grounded: scenario.retrieval.grounded,
    },
    metadata: {
      index: "refund_policy_knowledge_base",
    },
  });

  trace.addSpan({
    type: "tool_call",
    name: scenario.toolCall.name,
    input: scenario.toolCall.input,
    output: scenario.toolCall.output,
    metadata: {
      toolName: scenario.toolCall.name,
      status: scenario.toolCall.ok ? "success" : "error",
    },
  });

  trace.addSpan({
    type: "decision",
    name: "Evaluate refund eligibility",
    input: {
      retrievedDocumentIds: scenario.retrieval.documents.map((document) => document.id),
      toolStatus: scenario.toolCall.ok ? "success" : "error",
    },
    output: scenario.decision,
    metadata: {
      policyGrounded: scenario.retrieval.grounded,
    },
  });

  trace.addSpan({
    type: "llm_call",
    name: "Draft customer response",
    input: {
      userInput: scenario.userInput,
      decision: scenario.decision.label,
      policyContext: scenario.retrieval.documents.map((document) => document.excerpt),
    },
    output: {
      answer: scenario.finalOutput,
    },
    metadata: scenario.llmCall,
  });

  const result = await trace.end({
    status: scenario.status,
    finalOutput: scenario.finalOutput,
    uncertaintyScore: scenario.uncertaintyScore,
  });

  if (!result.ok) {
    throw result.error ?? new Error(`Trace ingestion failed with status ${result.status}`);
  }

  console.log(`Created trace: ${result.payload.run_id} (${result.payload.status})`);
}

function selectedScenarios() {
  const requested = process.argv.slice(2);

  if (requested.length === 0 || requested.includes("all")) {
    return Object.entries(scenarios);
  }

  const normalized = requested.map((name) => scenarioAliases[name] ?? name);
  const unknown = normalized.filter((name) => !scenarios[name]);

  if (unknown.length > 0) {
    throw new Error(
      `Unknown scenario(s): ${unknown.join(", ")}. Valid scenarios: ${Object.keys(scenarios).join(", ")}, all`,
    );
  }

  return normalized.map((name) => [name, scenarios[name]]);
}

async function main() {
  const selected = selectedScenarios();

  for (const [scenarioName, scenario] of selected) {
    await runScenario(scenarioName, scenario);
  }

  console.log(
    `\nPosted ${selected.length} customer support trace(s). Open http://localhost:3000/traces to inspect them.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
