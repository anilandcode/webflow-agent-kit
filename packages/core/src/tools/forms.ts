import { z } from 'zod';
import type { WebflowClient } from 'webflow-api';

export function createListFormsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_forms',
    description:
      'List all forms on a Webflow site. Use to discover form IDs before reading submissions.',
    inputSchema: z.object({
      siteId: z.string().describe('The Webflow site ID'),
    }),
    execute: async ({ siteId }: { siteId: string }) => {
      const response = await client.forms.list(siteId);
      return response;
    },
  };
}

export function createGetFormTool(client: WebflowClient) {
  return {
    name: 'webflow_get_form',
    description: 'Get details about a specific form, including its schema and field definitions.',
    inputSchema: z.object({
      formId: z.string().describe('The form ID'),
    }),
    execute: async ({ formId }: { formId: string }) => {
      const form = await client.forms.get(formId);
      return { form };
    },
  };
}

export function createListFormSubmissionsTool(client: WebflowClient) {
  return {
    name: 'webflow_list_form_submissions',
    description:
      'List all submissions for a specific form. Includes submitted data with timestamps. Pagination supported.',
    inputSchema: z.object({
      formId: z.string().describe('The form ID'),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }),
    execute: async ({
      formId,
      limit,
      offset,
    }: {
      formId: string;
      limit: number;
      offset: number;
    }) => {
      const response = await client.forms.listSubmissions(formId, { limit, offset });
      return response;
    },
  };
}

export function createGetSubmissionTool(client: WebflowClient) {
  return {
    name: 'webflow_get_form_submission',
    description: 'Get a single form submission by its ID. Returns all submitted field data.',
    inputSchema: z.object({
      formSubmissionId: z.string().describe('The form submission ID'),
    }),
    execute: async ({ formSubmissionId }: { formSubmissionId: string }) => {
      const submission = await client.forms.getSubmission(formSubmissionId);
      return { submission };
    },
  };
}

export function createUpdateSubmissionTool(client: WebflowClient) {
  return {
    name: 'webflow_update_form_submission',
    description:
      'Update fields on a form submission. Use to add internal notes or change submission state.',
    inputSchema: z.object({
      formSubmissionId: z.string().describe('The form submission ID'),
      fieldData: z.record(z.unknown()).describe('Updated field data'),
    }),
    execute: async ({
      formSubmissionId,
      fieldData,
    }: {
      formSubmissionId: string;
      fieldData: Record<string, unknown>;
    }) => {
      await client.forms.updateSubmission(formSubmissionId, fieldData);
      return { updated: true, formSubmissionId };
    },
  };
}

export function createFormTools(client: WebflowClient) {
  return {
    listForms: createListFormsTool(client),
    getForm: createGetFormTool(client),
    listFormSubmissions: createListFormSubmissionsTool(client),
    getSubmission: createGetSubmissionTool(client),
    updateSubmission: createUpdateSubmissionTool(client),
  };
}
