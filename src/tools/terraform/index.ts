import { terraformPlan } from "./plan.js";
import { terraformStateList, terraformStateShow } from "./state.js";
import { terraformOutput } from "./output.js";
import { terraformValidate } from "./validate.js";

export function registerTerraformTools() {
  return [
    {
      name: "terraform_plan",
      description: "Run terraform plan to preview infrastructure changes (read-only, safe)",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing Terraform files" },
        },
        required: ["directory"],
      },
    },
    {
      name: "terraform_state_list",
      description: "List all resources in the Terraform state",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing Terraform files" },
        },
        required: ["directory"],
      },
    },
    {
      name: "terraform_state_show",
      description: "Show details of a specific resource in Terraform state",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing Terraform files" },
          resource: { type: "string", description: "Resource address (e.g., 'aws_instance.web')" },
        },
        required: ["directory", "resource"],
      },
    },
    {
      name: "terraform_output",
      description: "Read Terraform output values",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing Terraform files" },
          name: { type: "string", description: "Specific output name (optional, shows all if omitted)" },
        },
        required: ["directory"],
      },
    },
    {
      name: "terraform_validate",
      description: "Validate Terraform configuration and check formatting",
      inputSchema: {
        type: "object" as const,
        properties: {
          directory: { type: "string", description: "Directory containing Terraform files" },
        },
        required: ["directory"],
      },
    },
  ];
}

export async function handleTerraformTool(
  name: string,
  args: Record<string, unknown> | undefined
): Promise<string> {
  const a = args || {};
  switch (name) {
    case "terraform_plan": return terraformPlan(a);
    case "terraform_state_list": return terraformStateList(a);
    case "terraform_state_show": return terraformStateShow(a);
    case "terraform_output": return terraformOutput(a);
    case "terraform_validate": return terraformValidate(a);
    default: throw new Error(`Unknown Terraform tool: ${name}`);
  }
}
